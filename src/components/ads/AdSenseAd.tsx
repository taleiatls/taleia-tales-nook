
import { useEffect, useRef, useState } from 'react';

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
  const adRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const loadAdSense = () => {
      try {
        // Check if AdSense script is loaded
        if (typeof window !== 'undefined') {
          if (!window.adsbygoogle) {
            // Initialize adsbygoogle array if it doesn't exist
            window.adsbygoogle = [];
          }
          
          // Push the ad configuration
          window.adsbygoogle.push({});
          setIsLoaded(true);
          console.log('AdSense ad loaded for slot:', adSlot);
        }
      } catch (error) {
        console.error('AdSense error for slot', adSlot, ':', error);
        setIsLoaded(false);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(loadAdSense, 100);
    
    return () => clearTimeout(timer);
  }, [adSlot]);

  // Fallback display when ads don't load
  if (!isLoaded) {
    return (
      <div 
        className={`ad-container ${className} flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded`}
        style={{ width: responsive ? "100%" : width, height: responsive ? "auto" : height, minHeight: "100px" }}
      >
        <div className="text-gray-500 text-sm">Advertisement</div>
      </div>
    );
  }

  return (
    <div className={`ad-container ${className}`} ref={adRef}>
      <ins
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
