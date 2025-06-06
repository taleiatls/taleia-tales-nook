
import { useEffect, useState } from 'react';
import { generateSitemap } from '@/utils/sitemapGenerator';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const content = await generateSitemap();
        setSitemapContent(content);
        
        // Set proper content type for XML
        const metaTag = document.querySelector('meta[http-equiv="Content-Type"]');
        if (metaTag) {
          metaTag.setAttribute('content', 'application/xml; charset=utf-8');
        } else {
          const newMeta = document.createElement('meta');
          newMeta.setAttribute('http-equiv', 'Content-Type');
          newMeta.setAttribute('content', 'application/xml; charset=utf-8');
          document.head.appendChild(newMeta);
        }
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setSitemapContent('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
      }
    };

    loadSitemap();
  }, []);

  if (!sitemapContent) {
    return <div>Generating sitemap...</div>;
  }

  // Return the raw XML content without any HTML wrapper
  return (
    <pre 
      style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'monospace',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word'
      }}
      dangerouslySetInnerHTML={{ __html: sitemapContent }}
    />
  );
};

export default Sitemap;
