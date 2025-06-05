
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';

interface CoinBalance {
  balance: number;
  loading: boolean;
}

interface FunctionResponse {
  success: boolean;
  new_balance?: number;
  error?: string;
}

export const useCoins = () => {
  const { user } = useAuth();
  const [coinBalance, setCoinBalance] = useState<CoinBalance>({ balance: 0, loading: true });

  useEffect(() => {
    if (user) {
      fetchCoinBalance();
    } else {
      setCoinBalance({ balance: 0, loading: false });
    }
  }, [user]);

  const fetchCoinBalance = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_coins')
        .select('balance')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      
      setCoinBalance({ balance: data?.balance || 0, loading: false });
    } catch (error) {
      console.error('Error fetching coin balance:', error);
      setCoinBalance({ balance: 0, loading: false });
    }
  };

  const addCoins = async (amount: number, description?: string) => {
    if (!user) {
      toast.error('You must be logged in to purchase coins');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('add_coins_to_user', {
        p_user_id: user.id,
        p_amount: amount,
        p_description: description || 'Coin purchase'
      });

      if (error) throw error;

      const response = data as unknown as FunctionResponse;
      if (response.success) {
        setCoinBalance(prev => ({ ...prev, balance: response.new_balance || 0 }));
        toast.success(`Added ${amount} coins to your account!`);
        return true;
      } else {
        toast.error('Failed to add coins');
        return false;
      }
    } catch (error) {
      console.error('Error adding coins:', error);
      toast.error('Failed to add coins');
      return false;
    }
  };

  const unlockChapter = async (chapterId: string, coinCost: number) => {
    if (!user) {
      toast.error('You must be logged in to unlock chapters');
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('unlock_chapter_with_coins', {
        p_user_id: user.id,
        p_chapter_id: chapterId,
        p_coin_cost: coinCost
      });

      if (error) throw error;

      const response = data as unknown as FunctionResponse;
      if (response.success) {
        setCoinBalance(prev => ({ ...prev, balance: response.new_balance || 0 }));
        toast.success('Chapter unlocked successfully!');
        return true;
      } else {
        toast.error(response.error || 'Failed to unlock chapter');
        return false;
      }
    } catch (error) {
      console.error('Error unlocking chapter:', error);
      toast.error('Failed to unlock chapter');
      return false;
    }
  };

  const checkChapterPurchased = async (chapterId: string) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('chapter_purchases')
        .select('id')
        .eq('user_id', user.id)
        .eq('chapter_id', chapterId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking chapter purchase:', error);
      return false;
    }
  };

  return {
    coinBalance: coinBalance.balance,
    loading: coinBalance.loading,
    addCoins,
    unlockChapter,
    checkChapterPurchased,
    refreshBalance: fetchCoinBalance
  };
};
