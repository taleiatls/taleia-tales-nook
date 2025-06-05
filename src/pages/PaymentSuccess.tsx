
import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Coins, ArrowLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { useCoins } from '@/hooks/useCoins';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { refreshBalance } = useCoins();
  const [processing, setProcessing] = useState(true);
  const [coinsAdded, setCoinsAdded] = useState<number | null>(null);

  useEffect(() => {
    const handlePaymentSuccess = async () => {
      const paypalOrderId = searchParams.get('token'); // PayPal returns 'token' parameter
      
      if (!paypalOrderId) {
        toast.error('No payment information found');
        navigate('/store');
        return;
      }

      try {
        console.log('Processing PayPal payment success:', paypalOrderId);
        
        const { data, error } = await supabase.functions.invoke('handle-paypal-success', {
          body: { paypalOrderId }
        });

        if (error) throw error;

        if (data?.success) {
          setCoinsAdded(data.coins);
          toast.success(`Payment successful! ${data.coins} coins added to your account.`);
          refreshBalance();
        } else {
          throw new Error('Payment processing failed');
        }
      } catch (error) {
        console.error('Error processing payment:', error);
        toast.error('Failed to process payment. Please contact support.');
      } finally {
        setProcessing(false);
      }
    };

    handlePaymentSuccess();
  }, [searchParams, navigate, refreshBalance]);

  const handleBackToStore = () => {
    navigate('/store');
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Card className="bg-gray-800 border-gray-700 max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-4"></div>
            <p className="text-gray-300">Processing your payment...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="bg-gray-800 border-gray-700 max-w-md w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-500/20 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-white">Payment Successful!</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center space-y-6">
          {coinsAdded && (
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4">
              <div className="flex items-center justify-center gap-2 text-yellow-400">
                <Coins className="h-6 w-6" />
                <span className="text-xl font-bold">{coinsAdded} Coins Added!</span>
              </div>
              <p className="text-gray-300 text-sm mt-2">
                Your coins have been added to your account
              </p>
            </div>
          )}
          
          <p className="text-gray-300">
            Thank you for your purchase! You can now use your coins to unlock premium chapters.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button 
              onClick={handleBackToHome}
              className="bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            >
              Start Reading
            </Button>
            <Button 
              onClick={handleBackToStore}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Store
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccess;
