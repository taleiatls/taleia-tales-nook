
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { FileText, Search, ExternalLink, Copy } from "lucide-react";

const SEOManagement = () => {
  const [showFullContent, setShowFullContent] = useState(false);

  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://taleiatls.com/</loc>
    <lastmod>2025-06-06</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://taleiatls.com/search</loc>
    <lastmod>2025-06-06</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://taleiatls.com/novel/the-mystic-chronicles</loc>
    <lastmod>2025-06-05</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

  const handleCopySitemap = async () => {
    try {
      await navigator.clipboard.writeText(sitemapContent);
      toast.success("Sitemap content copied to clipboard!");
    } catch (error) {
      console.error("Error copying sitemap:", error);
      toast.error("Failed to copy sitemap content");
    }
  };

  const copyRobotsContent = () => {
    const robotsContent = `User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /

User-agent: *
Allow: /

Sitemap: https://taleiatls.com/sitemap.xml`;

    navigator.clipboard.writeText(robotsContent);
    toast.success("Robots.txt content copied to clipboard!");
  };

  const openSitemapUrl = () => {
    window.open('/sitemap.xml', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="h-6 w-6 text-blue-500" />
        <h2 className="text-2xl font-bold text-gray-100">SEO Management</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Sitemap Management */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100 flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Sitemap Management</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              View and manage your sitemap.xml file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleCopySitemap}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Sitemap
              </Button>
              <Button 
                onClick={openSitemapUrl}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Sitemap
              </Button>
            </div>

            <div className="text-sm text-gray-400 bg-gray-900 p-3 rounded">
              <p><strong>Current URL:</strong> /sitemap.xml</p>
              <p><strong>Status:</strong> Static XML file</p>
              <p><strong>Format:</strong> XML Sitemap Protocol</p>
              <p className="mt-2 text-green-400">
                <strong>Working:</strong> The sitemap is now a simple static file that should work correctly.
              </p>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">Sitemap Content:</p>
                <Button
                  onClick={() => setShowFullContent(!showFullContent)}
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  {showFullContent ? "Show Less" : "Show Full"}
                </Button>
              </div>
              <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto max-h-96 overflow-y-auto">
                {showFullContent ? sitemapContent : sitemapContent.substring(0, 500) + (sitemapContent.length > 500 ? "..." : "")}
              </pre>
            </div>
          </CardContent>
        </Card>

        {/* Robots.txt Management */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Robots.txt Configuration</CardTitle>
            <CardDescription className="text-gray-400">
              Updated robots.txt for taleiatls.com
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={copyRobotsContent}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Copy Updated Robots.txt
            </Button>
            
            <div className="text-sm text-gray-400 bg-gray-900 p-3 rounded">
              <p><strong>Sitemap URL:</strong> https://taleiatls.com/sitemap.xml</p>
              <p className="mt-2">This robots.txt allows all crawlers and points to your sitemap.</p>
              <p className="mt-2">Place this content in your domain's robots.txt file.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Tips */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Sitemap Information</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• The sitemap is now a static XML file that should work correctly</li>
            <li>• Access it at: https://taleiatls.com/sitemap.xml</li>
            <li>• Submit the sitemap URL to Google Search Console for better indexing</li>
            <li>• The sitemap includes your main pages and novel pages</li>
            <li>• Update the sitemap manually when adding new content</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOManagement;
