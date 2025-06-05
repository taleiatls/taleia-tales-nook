
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Coins, Package, Star, Zap, ArrowLeft } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface CoinPackage {
  id: string;
  coins: number;
  price: string;
  priceInUSD: number;
  bonus?: number;
  popular?: boolean;
}

const coinPackages: CoinPackage[] = [
  { id: 'starter', coins: 50, price: '$1.00', priceInUSD: 1.00 },
  { id: 'small', coins: 100, price: '$2.00', priceInUSD: 2.00, bonus: 10 },
  { id: 'medium', coins: 250, price: '$5.00', priceInUSD: 5.00, bonus: 25, popular: true },
  { id: 'large', coins: 500, price: '$10.00', priceInUSD: 10.00, bonus: 75 },
  { id: 'mega', coins: 1000, price: '$20.00', priceInUSD: 20.00, bonus: 200 }
];

const Store = () => {
  const { user } = useAuth();
  const { coinBalance } = useCoins();
  const [purchasing, setPurchasing] = useState<string | null>(null);
  const navigate = useNavigate();

  const handlePurchase = async (pkg: CoinPackage) => {
    if (!user) {
      toast.error('Please sign in to purchase coins');
      navigate('/auth');
      return;
    }

    setPurchasing(pkg.id);
    
    try {
      // Call PayPal payment function
      const { data, error } = await supabase.functions.invoke('create-paypal-payment', {
        body: {
          coins: pkg.coins,
          bonus: pkg.bonus || 0,
          price: pkg.priceInUSD,
          packageId: pkg.id
        }
      });

      if (error) throw error;

      if (data?.approvalUrl) {
        // Redirect to PayPal for payment approval
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('No PayPal approval URL received');
      }
    } catch (error) {
      console.error('Error creating PayPal payment:', error);
      toast.error('Failed to start PayPal checkout process');
    } finally {
      setPurchasing(null);
    }
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          {/* Back to Home Button */}
          <div className="flex justify-start mb-6">
            <Button
              variant="outline"
              onClick={handleBackToHome}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Package className="h-10 w-10 text-yellow-400" />
            Coin Store
          </h1>
          <p className="text-gray-300 text-lg">
            Purchase coins to unlock premium chapters - $1 = 50 coins!
          </p>
          
          {user && (
            <div className="mt-6 inline-flex items-center gap-2 bg-gray-800 px-6 py-3 rounded-lg border border-gray-700">
              <Coins className="h-5 w-5 text-yellow-400" />
              <span className="text-white font-medium">Your Balance: {coinBalance} coins</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {coinPackages.map((pkg) => (
            <Card 
              key={pkg.id} 
              className={`relative bg-gray-800 border-gray-700 transition-transform hover:scale-105 ${
                pkg.popular ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center">
                <div className="flex justify-center mb-3">
                  <div className="p-3 bg-yellow-400/20 rounded-full">
                    <Coins className="h-6 w-6 text-yellow-400" />
                  </div>
                </div>
                <CardTitle className="text-xl text-white">
                  {pkg.coins} Coins
                </CardTitle>
                {pkg.bonus && (
                  <CardDescription className="text-green-400 font-medium flex items-center justify-center gap-1">
                    <Zap className="h-3 w-3" />
                    +{pkg.bonus} Bonus!
                  </CardDescription>
                )}
                <div className="text-2xl font-bold text-yellow-400 mt-2">
                  {pkg.price}
                </div>
              </CardHeader>
              
              <CardContent>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  onClick={() => handlePurchase(pkg)}
                  disabled={purchasing === pkg.id}
                >
                  {purchasing === pkg.id ? 'Processing...' : 'PayPal'}
                </Button>
                
                <div className="mt-4 text-center text-sm text-gray-400">
                  Total: {pkg.coins + (pkg.bonus || 0)} coins
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-bold text-white mb-4">How it works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-gray-300">
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-blue-400 font-bold">1</span>
              </div>
              <h3 className="font-medium mb-2">Purchase Coins via PayPal</h3>
              <p className="text-sm">Buy coin packages securely with PayPal - $1 = 50 coins</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-blue-400 font-bold">2</span>
              </div>
              <h3 className="font-medium mb-2">Find Locked Chapters</h3>
              <p className="text-sm">Premium chapters are marked with a lock icon</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-600/20 rounded-full p-3 w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                <span className="text-blue-400 font-bold">3</span>
              </div>
              <h3 className="font-medium mb-2">Unlock & Read</h3>
              <p className="text-sm">Spend coins to unlock chapters permanently</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Store;
