
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: string;
}

export async function generateSitemap(): Promise<string> {
  // Use the published domain URL
  const baseUrl = 'https://taleiatls.com';
  const urls: SitemapUrl[] = [];

  // Add static pages
  urls.push({
    loc: `${baseUrl}/`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '1.0'
  });

  urls.push({
    loc: `${baseUrl}/search`,
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.8'
  });

  try {
    // Fetch all visible novels
    const { data: novels, error } = await supabase
      .from('novels')
      .select('id, title, created_at')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Add novel pages
    novels?.forEach(novel => {
      const novelSlug = slugify(novel.title);
      urls.push({
        loc: `${baseUrl}/novel/${novelSlug}`,
        lastmod: new Date(novel.created_at).toISOString().split('T')[0],
        changefreq: 'weekly',
        priority: '0.9'
      });
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  // Generate XML sitemap
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xmlContent;
}

export async function downloadSitemap() {
  const sitemapContent = await generateSitemap();
  const blob = new Blob([sitemapContent], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
