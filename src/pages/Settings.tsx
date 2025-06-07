
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { useReadingSettings } from "@/hooks/useReadingSettings";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const { settings, updateSettings, isLoading: isSettingsLoading } = useReadingSettings();

  // Redirect if not logged in
  if (!user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  // Handle setting changes with immediate application and saving
  const handleSettingChange = async (newSettings: any) => {
    try {
      await updateSettings(newSettings);
      toast.success("Reading settings saved successfully");
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  if (isLoading || isSettingsLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="container max-w-4xl mx-auto pt-16 px-4">
          <div className="text-center text-gray-300">Loading settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto pt-16 px-4">
        <h1 className="text-3xl font-bold text-white mb-8 font-serif">Reading Settings</h1>
        
        <Card className="bg-gray-900 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Customize Your Reading Experience</CardTitle>
            <CardDescription className="text-gray-400">
              Adjust these settings to make reading more comfortable for you
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-gray-300">Theme</Label>
              <RadioGroup 
                value={settings.theme} 
                onValueChange={(value) => handleSettingChange({
                  ...settings, 
                  theme: value as 'light' | 'dark' | 'comfort'
                })}
                className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" className="bg-gray-700" />
                  <Label htmlFor="light" className="text-gray-300">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" className="bg-gray-700" />
                  <Label htmlFor="dark" className="text-gray-300">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfort" id="comfort" className="bg-gray-700" />
                  <Label htmlFor="comfort" className="text-gray-300">Comfort</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Font Family Selection */}
            <div className="space-y-3">
              <Label className="text-gray-300">Font Family</Label>
              <RadioGroup 
                value={settings.font_family} 
                onValueChange={(value) => handleSettingChange({
                  ...settings, 
                  font_family: value
                })}
                className="flex flex-col space-y-1 sm:flex-row sm:space-y-0 sm:space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serif" id="serif" className="bg-gray-700" />
                  <Label htmlFor="serif" className="font-serif text-gray-300">Serif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sans-serif" id="sans-serif" className="bg-gray-700" />
                  <Label htmlFor="sans-serif" className="font-sans text-gray-300">Sans-serif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monospace" id="monospace" className="bg-gray-700" />
                  <Label htmlFor="monospace" className="font-mono text-gray-300">Monospace</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Font Size Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className="text-gray-300">Font Size: {settings.font_size}px</Label>
                <span className="text-sm text-gray-400">
                  <span className={settings.font_size === 14 ? "text-blue-400" : "text-gray-500 cursor-pointer"}
                    onClick={() => handleSettingChange({...settings, font_size: 14})}>A</span>
                  {" - "}
                  <span className={settings.font_size === 24 ? "text-blue-400" : "text-gray-300 cursor-pointer"}
                    onClick={() => handleSettingChange({...settings, font_size: 24})}>A</span>
                </span>
              </div>
              <Slider
                value={[settings.font_size]}
                min={14}
                max={24}
                step={1}
                onValueChange={(value) => handleSettingChange({
                  ...settings, 
                  font_size: value[0]
                })}
                className="py-4"
              />
            </div>

            {/* Line Height Slider */}
            <div className="space-y-3">
              <Label className="text-gray-300">Line Height: {settings.line_height}</Label>
              <Slider
                value={[settings.line_height * 10]}
                min={10}
                max={25}
                step={1}
                onValueChange={(value) => handleSettingChange({
                  ...settings, 
                  line_height: value[0] / 10
                })}
                className="py-4"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Compact</span>
                <span>Normal</span>
                <span>Spacious</span>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 border border-gray-700 rounded-lg p-4">
              <h4 className="text-gray-400 text-sm mb-2">Preview</h4>
              <div 
                className={`p-4 rounded-md ${
                  settings.theme === 'light' 
                    ? 'bg-gray-100 text-gray-900' 
                    : settings.theme === 'dark' 
                      ? 'bg-gray-800 text-gray-200' 
                      : 'bg-amber-50 text-amber-900'
                }`}
                style={{
                  fontFamily: settings.font_family,
                  fontSize: `${settings.font_size}px`,
                  lineHeight: settings.line_height
                }}
              >
                <p>This is how your text will appear when reading chapters. The quick brown fox jumps over the lazy dog.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
