
import AdSenseAd from './AdSenseAd';

const HomeBannerAd = () => {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6">
      <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
        <div className="text-xs text-gray-500 mb-2 text-center">Advertisement</div>
        <AdSenseAd
          adSlot="1234567890" // Replace with your actual ad slot ID
          adFormat="horizontal"
          className="w-full"
          height="250px"
        />
      </div>
    </div>
  );
};

export default HomeBannerAd;
