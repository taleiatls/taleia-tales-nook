
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Download, FileText, Search, ExternalLink } from "lucide-react";
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
              <span>Dynamic Sitemap</span>
            </CardTitle>
            <CardDescription className="text-gray-400">
              Your sitemap is automatically generated at /sitemap.xml
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                onClick={handleGenerateSitemap} 
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isGenerating ? "Generating..." : "Preview Sitemap"}
              </Button>
              <Button 
                onClick={openSitemapUrl}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
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

            <div className="text-sm text-gray-400 bg-gray-900 p-3 rounded">
              <p><strong>Live URL:</strong> /sitemap.xml</p>
              <p><strong>Updates:</strong> Automatically when novels are added/updated</p>
              <p><strong>Format:</strong> XML Sitemap Protocol</p>
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
              <p className="mt-2">This robots.txt allows all crawlers and points to your dynamic sitemap.</p>
              <p className="mt-2">Place this content in your domain's robots.txt file.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Tips */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Dynamic Sitemap Benefits</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Your sitemap updates automatically when new novels are published</li>
            <li>• Search engines can access it at /sitemap.xml without manual uploads</li>
            <li>• Submit https://taleiatls.com/sitemap.xml to Google Search Console</li>
            <li>• No need to regenerate or re-upload the sitemap manually</li>
            <li>• Always includes the latest content with proper last modified dates</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOManagement;
