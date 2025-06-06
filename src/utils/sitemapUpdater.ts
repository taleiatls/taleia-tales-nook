
import { generateSitemap } from './sitemapGenerator';

export async function updateSitemapFile(): Promise<boolean> {
  try {
    console.log('Generating new sitemap content...');
    const sitemapContent = await generateSitemap();
    
    console.log('Generated sitemap content:', sitemapContent);
    
    // In a client-side application, we need to trigger a download
    // The user will need to manually replace the file in the public folder
    const blob = new Blob([sitemapContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sitemap.xml';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Sitemap file downloaded successfully');
    return true;
  } catch (error) {
    console.error('Error updating sitemap file:', error);
    return false;
  }
}

// Alternative function that shows the content for manual copy-paste
export async function getSitemapContent(): Promise<string> {
  try {
    const sitemapContent = await generateSitemap();
    return sitemapContent;
  } catch (error) {
    console.error('Error generating sitemap content:', error);
    throw error;
  }
}
