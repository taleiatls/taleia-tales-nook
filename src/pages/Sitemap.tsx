
import { useEffect } from 'react';
import { generateSitemap } from '@/utils/sitemapGenerator';

const Sitemap = () => {
  useEffect(() => {
    const generateAndServe = async () => {
      try {
        const sitemapContent = await generateSitemap();
        
        // Create a blob with the XML content
        const blob = new Blob([sitemapContent], { type: 'application/xml' });
        const url = URL.createObjectURL(blob);
        
        // Replace the current page with the XML content
        window.location.replace(url);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        // Show error message if generation fails
        document.body.innerHTML = '<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>';
        document.head.innerHTML = '<meta http-equiv="Content-Type" content="application/xml; charset=utf-8">';
      }
    };

    generateAndServe();
  }, []);

  // Show loading while generating
  return (
    <div style={{ 
      fontFamily: 'monospace', 
      padding: '20px',
      whiteSpace: 'pre-wrap'
    }}>
      Generating sitemap.xml...
    </div>
  );
};

export default Sitemap;
