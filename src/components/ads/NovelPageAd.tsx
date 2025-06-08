
import { memo } from 'react';
import AdSenseAd from './AdSenseAd';

const NovelPageAd = memo(() => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 my-6">
      <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
      <AdSenseAd
        adSlot="8834824326"
        adFormat="rectangle"
        width="336px"
        height="280px"
        responsive={true}
        className="w-full"
      />
    </div>
  );
});

NovelPageAd.displayName = 'NovelPageAd';

export default NovelPageAd;
