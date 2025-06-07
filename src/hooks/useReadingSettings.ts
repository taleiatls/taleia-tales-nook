
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

export const useReadingSettings = () => {
  const { user } = useAuth();
  const [readingSettings, setReadingSettings] = useState<ReadingSettings>({
    font_size: 18,
    font_family: 'serif',
    line_height: 1.6,
    theme: 'dark'
  });

  const fetchReadingSettings = useCallback(async () => {
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
          setReadingSettings(newSettings);
        }
      } catch (error) {
        console.error("Error fetching reading settings:", error);
      }
    }
  }, [user?.id]);

  useEffect(() => {
    fetchReadingSettings();
  }, [fetchReadingSettings]);

  const handleSettingsChange = useCallback((newSettings: ReadingSettings) => {
    console.log("Settings changed:", newSettings);
    setReadingSettings(newSettings);
  }, []);

  return {
    readingSettings,
    handleSettingsChange
  };
};
