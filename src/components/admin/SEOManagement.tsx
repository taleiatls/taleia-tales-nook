
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Download, FileText, Search } from "lucide-react";
import { generateSitemap, downloadSitemap } from "@/utils/sitemapGenerator";

const SEOManagement = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [sitemapPreview, setSitemapPreview] = useState<string>("");

  const handleGenerateSitemap = async () => {
    setIsGenerating(true);
    try {
      const sitemap = await generateSitemap();
      setSitemapPreview(sitemap);
      toast.success("Sitemap generated successfully!");
    } catch (error) {
      console.error("Error generating sitemap:", error);
      toast.error("Failed to generate sitemap");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadSitemap = async () => {
    try {
      await downloadSitemap();
      toast.success("Sitemap downloaded!");
    } catch (error) {
      console.error("Error downloading sitemap:", error);
      toast.error("Failed to download sitemap");
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

Sitemap: ${window.location.origin}/sitemap.xml`;

    navigator.clipboard.writeText(robotsContent);
    toast.success("Robots.txt content copied to clipboard!");
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
              <span>Sitemap Generation</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Generate XML sitemap for search engines
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                onClick={handleGenerateSitemap} 
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isGenerating ? "Generating..." : "Generate Sitemap"}
              </Button>
              {sitemapPreview && (
                <Button 
                  onClick={handleDownloadSitemap}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              )}
            </div>
            
            {sitemapPreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-400 mb-2">Preview (first 500 characters):</p>
                <pre className="bg-gray-900 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                  {sitemapPreview.substring(0, 500)}...
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Robots.txt Management */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-gray-100">Robots.txt</CardTitle>
            <CardDescription className="text-gray-400">
              Current robots.txt configuration
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
            
            <div className="text-sm text-gray-400">
              <p>Current robots.txt allows all crawlers.</p>
              <p className="mt-2">Copy the updated content and replace your robots.txt file to include sitemap reference.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Tips */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">SEO Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Generate and submit your sitemap to Google Search Console</li>
            <li>• Ensure all novel pages have unique, descriptive titles</li>
            <li>• Add meta descriptions to improve click-through rates</li>
            <li>• Use structured data for better search result appearance</li>
            <li>• Monitor your site's performance in search analytics</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOManagement;
