
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Download, FileText, Search, ExternalLink, RefreshCw, Copy } from "lucide-react";
import { generateSitemap } from "@/utils/sitemapGenerator";
import { updateSitemapFile, getSitemapContent } from "@/utils/sitemapUpdater";

const SEOManagement = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [sitemapPreview, setSitemapPreview] = useState<string>("");
  const [showFullContent, setShowFullContent] = useState(false);

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

  const handleUpdateSitemap = async () => {
    setIsUpdating(true);
    try {
      const success = await updateSitemapFile();
      
      if (success) {
        // Also get the content for preview
        const content = await getSitemapContent();
        setSitemapPreview(content);
        toast.success("Sitemap downloaded! Please replace the sitemap.xml file in your public folder with the downloaded file.");
      } else {
        toast.error("Failed to update sitemap");
      }
    } catch (error) {
      console.error("Error updating sitemap:", error);
      toast.error("Failed to update sitemap");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCopySitemap = async () => {
    try {
      const content = await getSitemapContent();
      await navigator.clipboard.writeText(content);
      toast.success("Sitemap content copied to clipboard! You can now manually update the sitemap.xml file.");
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
              Generate and update your sitemap.xml file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button 
                onClick={handleGenerateSitemap} 
                disabled={isGenerating}
                className="bg-blue-500 hover:bg-blue-600"
              >
                {isGenerating ? "Generating..." : "Preview Sitemap"}
              </Button>
              <Button 
                onClick={handleUpdateSitemap}
                disabled={isUpdating}
                className="bg-green-500 hover:bg-green-600"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {isUpdating ? "Updating..." : "Download Sitemap"}
              </Button>
              <Button 
                onClick={handleCopySitemap}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Content
              </Button>
              <Button 
                onClick={openSitemapUrl}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Live
              </Button>
            </div>

            <div className="text-sm text-gray-400 bg-gray-900 p-3 rounded">
              <p><strong>Current URL:</strong> /sitemap.xml</p>
              <p><strong>Updates:</strong> Download updated file and replace public/sitemap.xml</p>
              <p><strong>Format:</strong> XML Sitemap Protocol</p>
              <p className="mt-2 text-yellow-400">
                <strong>Instructions:</strong> 
                1. Click "Download Sitemap" to get the updated file<br/>
                2. Replace the sitemap.xml in your public folder<br/>
                3. Or use "Copy Content" to manually update the file
              </p>
            </div>
            
            {sitemapPreview && (
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
                  {showFullContent ? sitemapPreview : sitemapPreview.substring(0, 500) + (sitemapPreview.length > 500 ? "..." : "")}
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
              <p className="mt-2">This robots.txt allows all crawlers and points to your sitemap.</p>
              <p className="mt-2">Place this content in your domain's robots.txt file.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* SEO Tips */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-gray-100">Sitemap Management Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-gray-300 text-sm">
            <li>• Use "Download Sitemap" to get an updated sitemap with all current novels</li>
            <li>• Replace the sitemap.xml file in your public folder with the downloaded version</li>
            <li>• Alternatively, use "Copy Content" to manually copy and paste the sitemap content</li>
            <li>• Submit https://taleiatls.com/sitemap.xml to Google Search Console after updates</li>
            <li>• Update the sitemap whenever you add new novels or make significant changes</li>
            <li>• The sitemap includes proper last modified dates for better SEO</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SEOManagement;
