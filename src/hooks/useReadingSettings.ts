
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

const DEFAULT_SETTINGS: ReadingSettings = {
  font_size: 18,
  font_family: 'serif',
  line_height: 1.6,
  theme: 'dark'
};

const GUEST_SETTINGS_KEY = 'guest_reading_settings';

export const useReadingSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ReadingSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from localStorage for guest users
  const loadGuestSettings = useCallback((): ReadingSettings => {
    try {
      const stored = localStorage.getItem(GUEST_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error('Error loading guest settings:', error);
    }
    return DEFAULT_SETTINGS;
  }, []);

  // Save settings to localStorage for guest users
  const saveGuestSettings = useCallback((newSettings: ReadingSettings) => {
    try {
      localStorage.setItem(GUEST_SETTINGS_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving guest settings:', error);
    }
  }, []);

  // Load settings from database for logged-in users
  const loadUserSettings = useCallback(async (): Promise<ReadingSettings> => {
    if (!user) return DEFAULT_SETTINGS;

    try {
      const { data, error } = await supabase
        .from('user_reading_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        return {
          font_size: data.font_size,
          font_family: data.font_family,
          line_height: data.line_height,
          theme: data.theme as 'light' | 'dark' | 'comfort'
        };
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    }
    return DEFAULT_SETTINGS;
  }, [user]);

  // Save settings to database for logged-in users
  const saveUserSettings = useCallback(async (newSettings: ReadingSettings) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_reading_settings')
        .upsert({
          user_id: user.id,
          font_size: newSettings.font_size,
          font_family: newSettings.font_family,
          line_height: newSettings.line_height,
          theme: newSettings.theme,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving user settings:', error);
    }
  }, [user]);

  // Migrate guest settings to user account when logging in
  const migrateGuestSettings = useCallback(async () => {
    if (!user) return;

    const guestSettings = loadGuestSettings();
    
    // Check if user already has settings
    const existingSettings = await loadUserSettings();
    
    // If user has no settings or settings are default, migrate guest settings
    if (JSON.stringify(existingSettings) === JSON.stringify(DEFAULT_SETTINGS)) {
      await saveUserSettings(guestSettings);
      setSettings(guestSettings);
    }
  }, [user, loadGuestSettings, loadUserSettings, saveUserSettings]);

  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true);
      
      if (user) {
        // For logged-in users, load from database
        const userSettings = await loadUserSettings();
        setSettings(userSettings);
        
        // Migrate guest settings if needed
        await migrateGuestSettings();
      } else {
        // For guest users, load from localStorage
        const guestSettings = loadGuestSettings();
        setSettings(guestSettings);
      }
      
      setIsLoading(false);
    };

    initializeSettings();
  }, [user, loadUserSettings, loadGuestSettings, migrateGuestSettings]);

  // Update settings
  const updateSettings = useCallback(async (newSettings: ReadingSettings) => {
    setSettings(newSettings);

    if (user) {
      // Save to database for logged-in users
      await saveUserSettings(newSettings);
    } else {
      // Save to localStorage for guest users
      saveGuestSettings(newSettings);
    }
  }, [user, saveUserSettings, saveGuestSettings]);

  return {
    settings,
    updateSettings,
    isLoading
  };
};
