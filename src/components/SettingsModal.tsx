
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { toast } from "@/components/ui/sonner";
import { Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

interface SettingsModalProps {
  onSettingsChange?: (settings: ReadingSettings) => void;
}

const SettingsModal = ({ onSettingsChange }: SettingsModalProps) => {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<ReadingSettings>({
    font_size: 18,
    font_family: 'serif',
    line_height: 1.6,
    theme: 'dark'
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('user_reading_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) throw error;
          
          if (data) {
            const newSettings = {
              font_size: data.font_size,
              font_family: data.font_family,
              line_height: data.line_height,
              theme: data.theme as 'light' | 'dark' | 'comfort'
            };
            setSettings(newSettings);
            onSettingsChange?.(newSettings);
          }
        } catch (error) {
          console.error("Error fetching reading settings:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    if (open) {
      fetchSettings();
    }
  }, [user, open, onSettingsChange]);

  const saveSettings = async () => {
    if (!user) {
      toast.error("Please sign in to save settings");
      return;
    }
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_reading_settings')
        .upsert({
          user_id: user.id,
          font_size: settings.font_size,
          font_family: settings.font_family,
          line_height: settings.line_height,
          theme: settings.theme,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      
      toast.success("Reading settings saved successfully");
      onSettingsChange?.(settings);
      setOpen(false);
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
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
                value={settings.theme} 
                onValueChange={(value) => setSettings({...settings, theme: value as 'light' | 'dark' | 'comfort'})}
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
                value={settings.font_family} 
                onValueChange={(value) => setSettings({...settings, font_family: value})}
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
                <Label className="text-gray-300">Font Size: {settings.font_size}px</Label>
              </div>
              <Slider
                value={[settings.font_size]}
                min={14}
                max={24}
                step={1}
                onValueChange={(value) => setSettings({...settings, font_size: value[0]})}
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
                onValueChange={(value) => setSettings({...settings, line_height: value[0] / 10})}
                className="py-4"
              />
            </div>

            {/* Preview */}
            <div className="border border-gray-700 rounded-lg p-4">
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
                <p>This is how your text will appear when reading chapters.</p>
              </div>
            </div>

            <Button 
              onClick={saveSettings}
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
