
import { useEffect, useRef } from 'react';

interface AdSenseAdProps {
  adSlot: string;
  adFormat?: string;
  width?: string;
  height?: string;
  className?: string;
  responsive?: boolean;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

const AdSenseAd = ({ 
  adSlot, 
  adFormat = "auto", 
  width = "100%", 
  height = "250px",
  className = "",
  responsive = true 
}: AdSenseAdProps) => {
  const adRef = useRef<HTMLInsElement>(null);

  useEffect(() => {
    const loadAd = () => {
      try {
        if (typeof window !== 'undefined' && window.adsbygoogle) {
          // Push the ad to AdSense queue
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          console.log('AdSense ad loaded for slot:', adSlot);
        }
      } catch (error) {
        console.error('AdSense error for slot', adSlot, ':', error);
      }
    };

    // Wait a bit for the DOM to be ready
    const timer = setTimeout(loadAd, 100);
    
    return () => clearTimeout(timer);
  }, [adSlot]);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ 
          display: "block", 
          width: responsive ? "100%" : width, 
          height: responsive ? "auto" : height 
        }}
        data-ad-client="ca-pub-7277063954373465"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={responsive ? "true" : "false"}
      />
    </div>
  );
};

export default AdSenseAd;
