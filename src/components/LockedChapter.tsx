
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Coins } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';

interface LockedChapterProps {
  chapterId: string;
  chapterTitle: string;
  coinPrice: number;
  novelId: string;
  onUnlock?: () => void;
}

const LockedChapter = ({ chapterId, chapterTitle, coinPrice, novelId, onUnlock }: LockedChapterProps) => {
  const { coinBalance, unlockChapter } = useCoins();

  const handleUnlock = async () => {
    const success = await unlockChapter(chapterId, coinPrice);
    if (success && onUnlock) {
      onUnlock();
    }
  };

  const canAfford = coinBalance >= coinPrice;

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="p-4 bg-gray-700 rounded-full">
            <Lock className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <CardTitle className="text-xl text-gray-100">{chapterTitle}</CardTitle>
        <p className="text-gray-400">This chapter is locked</p>
      </CardHeader>
      
      <CardContent className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-yellow-400">
          <Coins className="h-5 w-5" />
          <span className="font-bold">Cost: {coinPrice} coins</span>
        </div>
        
        <div className="text-sm text-gray-400">
          Your balance: {coinBalance} coins
        </div>
        
        {canAfford ? (
          <Button
            className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-bold"
            onClick={handleUnlock}
          >
            Unlock Chapter
          </Button>
        ) : (
          <div className="space-y-3">
            <p className="text-red-400 text-sm">Insufficient coins</p>
            <p className="text-gray-400 text-sm">Contact admin to purchase coins</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LockedChapter;
