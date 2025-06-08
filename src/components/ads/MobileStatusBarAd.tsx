
import { useIsMobile } from '@/hooks/use-mobile';
import AdSenseAd from './AdSenseAd';

const MobileStatusBarAd = () => {
  const isMobile = useIsMobile();

  if (!isMobile) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-700 p-2">
      <div className="text-xs text-gray-500 text-center mb-1">Advertisement</div>
      <AdSenseAd
        adSlot="8810773595" // Replace with your actual ad slot ID
        adFormat="banner"
        width="320px"
        height="50px"
        responsive={false}
        className="w-full"
      />
    </div>
  );
};

export default MobileStatusBarAd;
