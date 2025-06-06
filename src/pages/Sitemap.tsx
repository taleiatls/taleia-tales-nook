
import { useEffect, useState } from 'react';
import { generateSitemap } from '@/utils/sitemapGenerator';

const Sitemap = () => {
  const [sitemapContent, setSitemapContent] = useState<string>('');

  useEffect(() => {
    const loadSitemap = async () => {
      try {
        const content = await generateSitemap();
        setSitemapContent(content);
      } catch (error) {
        console.error('Error generating sitemap:', error);
        setSitemapContent('<?xml version="1.0" encoding="UTF-8"?><error>Failed to generate sitemap</error>');
      }
    };

    loadSitemap();
  }, []);

  useEffect(() => {
    // Set the document content type to XML
    const metaTag = document.querySelector('meta[http-equiv="Content-Type"]');
    if (metaTag) {
      metaTag.setAttribute('content', 'application/xml; charset=utf-8');
    } else {
      const newMeta = document.createElement('meta');
      newMeta.setAttribute('http-equiv', 'Content-Type');
      newMeta.setAttribute('content', 'application/xml; charset=utf-8');
      document.head.appendChild(newMeta);
    }

    // Remove any existing title
    const titleTag = document.querySelector('title');
    if (titleTag) {
      titleTag.textContent = '';
    }
  }, [sitemapContent]);

  if (!sitemapContent) {
    return null;
  }

  // Return just the XML content without any React wrapper
  return (
    <div 
      dangerouslySetInnerHTML={{ __html: sitemapContent }}
      style={{ 
        margin: 0, 
        padding: 0, 
        fontFamily: 'monospace',
        whiteSpace: 'pre',
        fontSize: '12px'
      }}
    />
  );
};

export default Sitemap;
