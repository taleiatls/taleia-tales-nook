
import { useState, useEffect, useCallback, useRef } from 'react';
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
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

      if (error) {
        console.error('Error loading user settings:', error);
        return DEFAULT_SETTINGS;
      }

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

  // Save settings to database for logged-in users (background save)
  const saveUserSettingsToDatabase = useCallback(async (newSettings: ReadingSettings) => {
    if (!user) return;

    try {
      setIsSaving(true);
      console.log('Saving settings to database:', newSettings);
      
      const { error } = await supabase
        .from('user_reading_settings')
        .upsert({
          user_id: user.id,
          font_size: newSettings.font_size,
          font_family: newSettings.font_family,
          line_height: newSettings.line_height,
          theme: newSettings.theme,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Database save error:', error);
        // Don't throw error to avoid breaking UI, just log it
      } else {
        console.log('Settings saved successfully to database');
      }
    } catch (error) {
      console.error('Error saving user settings:', error);
      // Don't throw error to avoid breaking UI
    } finally {
      setIsSaving(false);
    }
  }, [user]);

  // Debounced save function
  const debouncedSave = useCallback((newSettings: ReadingSettings) => {
    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for 2 seconds
    saveTimeoutRef.current = setTimeout(() => {
      if (user) {
        saveUserSettingsToDatabase(newSettings);
      } else {
        saveGuestSettings(newSettings);
      }
    }, 2000);
  }, [user, saveUserSettingsToDatabase, saveGuestSettings]);

  // Migrate guest settings to user account when logging in
  const migrateGuestSettings = useCallback(async () => {
    if (!user) return;

    const guestSettings = loadGuestSettings();
    
    // Check if user already has settings
    const existingSettings = await loadUserSettings();
    
    // If user has no settings or settings are default, migrate guest settings
    if (JSON.stringify(existingSettings) === JSON.stringify(DEFAULT_SETTINGS)) {
      await saveUserSettingsToDatabase(guestSettings);
      setSettings(guestSettings);
    }
  }, [user, loadGuestSettings, loadUserSettings, saveUserSettingsToDatabase]);

  // Initialize settings
  useEffect(() => {
    const initializeSettings = async () => {
      setIsLoading(true);
      
      try {
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
      } catch (error) {
        console.error('Error initializing settings:', error);
        setSettings(DEFAULT_SETTINGS);
      } finally {
        setIsLoading(false);
      }
    };

    initializeSettings();
  }, [user, loadUserSettings, loadGuestSettings, migrateGuestSettings]);

  // Update settings with immediate UI update and debounced background save
  const updateSettings = useCallback((newSettings: ReadingSettings) => {
    console.log('Updating settings:', newSettings);
    
    // Update UI immediately
    setSettings(newSettings);

    // Save to localStorage immediately for guests (instant backup)
    if (!user) {
      saveGuestSettings(newSettings);
    }

    // Schedule background save (for database if user is logged in, or as backup for guests)
    debouncedSave(newSettings);
  }, [user, saveGuestSettings, debouncedSave]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    settings,
    updateSettings,
    isLoading,
    isSaving
  };
};
