
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import { Settings } from "lucide-react";
import { useReadingSettings, ReadingSettings } from "@/hooks/useReadingSettings";

interface SettingsModalProps {
  currentSettings?: ReadingSettings;
  onSettingsChange?: (settings: ReadingSettings) => void;
}

const SettingsModal = ({ currentSettings, onSettingsChange }: SettingsModalProps) => {
  const { user } = useAuth();
  const { settings: hookSettings, updateSettings, isLoading } = useReadingSettings();
  const [open, setOpen] = useState(false);

  // Use hook settings or provided settings
  const activeSettings = currentSettings || hookSettings;

  // Handle setting changes with immediate application
  const handleSettingChange = async (newSettings: ReadingSettings) => {
    try {
      // Apply settings immediately
      onSettingsChange?.(newSettings);
      
      // Save settings (to localStorage for guests, database for users)
      await updateSettings(newSettings);
      
      // Show appropriate toast message
      if (user) {
        toast.success("Settings saved!");
      } else {
        toast.success("Settings applied and will be saved when you log in");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-md bg-gray-900 border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-white">Reading Settings</DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="text-center text-gray-300 py-4">Loading settings...</div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className="text-gray-300">Theme</Label>
              <RadioGroup 
                value={activeSettings.theme} 
                onValueChange={(value) => handleSettingChange({
                  ...activeSettings, 
                  theme: value as 'light' | 'dark' | 'comfort'
                })}
                className="flex flex-col space-y-1"
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
                value={activeSettings.font_family} 
                onValueChange={(value) => handleSettingChange({
                  ...activeSettings, 
                  font_family: value
                })}
                className="flex flex-col space-y-1"
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
                <Label className="text-gray-300">Font Size: {activeSettings.font_size}px</Label>
              </div>
              <Slider
                value={[activeSettings.font_size]}
                min={14}
                max={24}
                step={1}
                onValueChange={(value) => handleSettingChange({
                  ...activeSettings, 
                  font_size: value[0]
                })}
                className="py-4"
              />
            </div>

            {/* Line Height Slider */}
            <div className="space-y-3">
              <Label className="text-gray-300">Line Height: {activeSettings.line_height}</Label>
              <Slider
                value={[activeSettings.line_height * 10]}
                min={10}
                max={25}
                step={1}
                onValueChange={(value) => handleSettingChange({
                  ...activeSettings, 
                  line_height: value[0] / 10
                })}
                className="py-4"
              />
            </div>

            {/* Preview */}
            <div className="border border-gray-700 rounded-lg p-4">
              <h4 className="text-gray-400 text-sm mb-2">Preview</h4>
              <div 
                className={`p-4 rounded-md ${
                  activeSettings.theme === 'light' 
                    ? 'bg-gray-100 text-gray-900' 
                    : activeSettings.theme === 'dark' 
                      ? 'bg-gray-800 text-gray-200' 
                      : 'bg-amber-50 text-amber-900'
                }`}
                style={{
                  fontFamily: activeSettings.font_family,
                  fontSize: `${activeSettings.font_size}px`,
                  lineHeight: activeSettings.line_height
                }}
              >
                <p>This is how your text will appear when reading chapters.</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
