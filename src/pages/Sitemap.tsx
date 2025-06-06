
import { useEffect, useState } from 'react';
import { generateSitemap } from '@/utils/sitemapGenerator';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const content = await generateSitemap();
        setSitemapContent(content);
        
        // Set the content type to XML
        document.contentType = 'application/xml';
      } catch (error) {
        console.error('Error generating sitemap:', error);
      }
    };

    loadSitemap();
  }, []);

  // Return raw XML content
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sitemapContent }}
      style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}
    />
  );
};

export default Sitemap;
