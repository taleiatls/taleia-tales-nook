
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/sonner";
import { Download, FileText, Search, ExternalLink, RefreshCw } from "lucide-react";
import { generateSitemap, downloadSitemap } from "@/utils/sitemapGenerator";

const SEOManagement = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
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

  const handleUpdateSitemap = async () => {
    setIsUpdating(true);
    try {
      const sitemapContent = await generateSitemap();
      
      // Create a download link to save the updated sitemap
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
      
      toast.success("Sitemap updated! Please upload the downloaded file to replace the current sitemap.xml");
    } catch (error) {
      console.error("Error updating sitemap:", error);
      toast.error("Failed to update sitemap");
    } finally {
      setIsUpdating(false);
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
                {isUpdating ? "Updating..." : "Update Sitemap"}
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
              <p><strong>Current URL:</strong> /sitemap.xml</p>
              <p><strong>Updates:</strong> Manual update using "Update Sitemap" button</p>
              <p><strong>Format:</strong> XML Sitemap Protocol</p>
              <p className="mt-2 text-yellow-400">
                <strong>Note:</strong> After clicking "Update Sitemap", upload the downloaded file to replace the current sitemap.xml
              </p>
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
            <li>• Use "Update Sitemap" to generate a new sitemap with all current novels</li>
            <li>• Download and upload the new sitemap.xml to replace the current one</li>
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
