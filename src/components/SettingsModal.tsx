
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import { Settings, Save } from "lucide-react";
import { useReadingSettings, ReadingSettings } from "@/hooks/useReadingSettings";

interface SettingsModalProps {
  currentSettings?: ReadingSettings;
  onSettingsChange?: (settings: ReadingSettings) => void;
}

const SettingsModal = ({ currentSettings, onSettingsChange }: SettingsModalProps) => {
  const { user } = useAuth();
  const { settings: hookSettings, updateSettings, isLoading, isSaving } = useReadingSettings();
  const [open, setOpen] = useState(false);

  // Use hook settings or provided settings
  const activeSettings = currentSettings || hookSettings;

  // Theme helper functions
  const getThemeDialogClasses = () => {
    switch (activeSettings.theme) {
      case 'light':
        return 'bg-white border-gray-200 text-gray-900';
      case 'comfort':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      default:
        return 'bg-gray-900 border-gray-700 text-white';
    }
  };

  const getThemeButtonClasses = () => {
    switch (activeSettings.theme) {
      case 'light':
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'comfort':
        return 'bg-amber-25 border-amber-300 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700';
    }
  };

  const getThemeLabelClasses = () => {
    switch (activeSettings.theme) {
      case 'light':
        return 'text-gray-700';
      case 'comfort':
        return 'text-amber-700';
      default:
        return 'text-gray-300';
    }
  };

  const getThemePreviewClasses = () => {
    switch (activeSettings.theme) {
      case 'light':
        return 'border-gray-300 bg-gray-100 text-gray-900';
      case 'comfort':
        return 'border-amber-300 bg-amber-50 text-amber-900';
      default:
        return 'border-gray-700 bg-gray-800 text-gray-200';
    }
  };

  // Handle setting changes with immediate application
  const handleSettingChange = (newSettings: ReadingSettings) => {
    try {
      console.log("Settings changing to:", newSettings);
      
      // Apply settings immediately to UI
      onSettingsChange?.(newSettings);
      
      // Update settings (this will trigger background save after 2 seconds)
      updateSettings(newSettings);
      
      // Show toast based on user status
      if (user) {
        toast.success("Settings updated! Saving in background...");
      } else {
        toast.success("Settings updated! Will sync when you log in");
      }
    } catch (error) {
      console.error("Error updating settings:", error);
      toast.error("Failed to update settings");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={getThemeButtonClasses()}>
          <Settings className="h-4 w-4" />
          {isSaving && <Save className="h-3 w-3 ml-1 animate-pulse" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className={`max-w-md ${getThemeDialogClasses()}`}>
        <DialogHeader>
          <DialogTitle className={getThemeLabelClasses()}>
            Reading Settings
            {isSaving && (
              <span className="text-xs ml-2 opacity-70">
                (Saving...)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className={`text-center py-4 ${getThemeLabelClasses()}`}>Loading settings...</div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Theme Selection */}
            <div className="space-y-3">
              <Label className={getThemeLabelClasses()}>Theme</Label>
              <RadioGroup 
                value={activeSettings.theme} 
                onValueChange={(value) => handleSettingChange({
                  ...activeSettings, 
                  theme: value as 'light' | 'dark' | 'comfort'
                })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className={getThemeLabelClasses()}>Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className={getThemeLabelClasses()}>Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="comfort" id="comfort" />
                  <Label htmlFor="comfort" className={getThemeLabelClasses()}>Comfort</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Font Family Selection */}
            <div className="space-y-3">
              <Label className={getThemeLabelClasses()}>Font Family</Label>
              <RadioGroup 
                value={activeSettings.font_family} 
                onValueChange={(value) => handleSettingChange({
                  ...activeSettings, 
                  font_family: value
                })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serif" id="serif" />
                  <Label htmlFor="serif" className={`font-serif ${getThemeLabelClasses()}`}>Serif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sans-serif" id="sans-serif" />
                  <Label htmlFor="sans-serif" className={`font-sans ${getThemeLabelClasses()}`}>Sans-serif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="monospace" id="monospace" />
                  <Label htmlFor="monospace" className={`font-mono ${getThemeLabelClasses()}`}>Monospace</Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Font Size Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <Label className={getThemeLabelClasses()}>Font Size: {activeSettings.font_size}px</Label>
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
              <Label className={getThemeLabelClasses()}>Line Height: {activeSettings.line_height}</Label>
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
            <div className={`border rounded-lg p-4 ${getThemePreviewClasses()}`}>
              <h4 className={`text-sm mb-2 opacity-70`}>Preview</h4>
              <div 
                className="p-4 rounded-md"
                style={{
                  fontFamily: activeSettings.font_family,
                  fontSize: `${activeSettings.font_size}px`,
                  lineHeight: activeSettings.line_height
                }}
              >
                <p>This is how your text will appear when reading chapters.</p>
              </div>
            </div>

            {/* Status indicator */}
            {!user && (
              <div className={`text-xs text-center opacity-70 ${getThemeLabelClasses()}`}>
                Settings saved locally. Sign in to sync across devices.
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
