
import AdSenseAd from './AdSenseAd';

const ChapterSidebarAd = () => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 mb-6">
      <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
      <AdSenseAd
        adSlot="0987654321" // Replace with your actual ad slot ID
        adFormat="rectangle"
        width="300px"
        height="250px"
        responsive={false}
        className="w-full"
      />
    </div>
  );
};

export default ChapterSidebarAd;
