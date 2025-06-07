
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CachedChapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  views: number;
  created_at: string;
  is_locked: boolean;
  coin_price: number;
}

interface ChapterCache {
  [key: string]: CachedChapter;
}

export const useChapterCache = (novelId: string) => {
  const [cache, setCache] = useState<ChapterCache>({});
  const [loading, setLoading] = useState<Set<number>>(new Set());

  // Generate cache key
  const getCacheKey = useCallback((novelId: string, chapterNumber: number) => {
    return `${novelId}-${chapterNumber}`;
  }, []);

  // Get chapter from cache or session storage
  const getCachedChapter = useCallback((chapterNumber: number): CachedChapter | null => {
    const key = getCacheKey(novelId, chapterNumber);
    
    // Check memory cache first
    if (cache[key]) {
      return cache[key];
    }

    // Check session storage
    try {
      const stored = sessionStorage.getItem(`chapter-${key}`);
      if (stored) {
        const chapter = JSON.parse(stored);
        // Update memory cache
        setCache(prev => ({ ...prev, [key]: chapter }));
        return chapter;
      }
    } catch (error) {
      console.error('Error reading from session storage:', error);
    }

    return null;
  }, [novelId, cache, getCacheKey]);

  // Store chapter in cache and session storage
  const setCachedChapter = useCallback((chapter: CachedChapter) => {
    const key = getCacheKey(novelId, chapter.chapter_number);
    
    // Update memory cache
    setCache(prev => ({ ...prev, [key]: chapter }));

    // Store in session storage
    try {
      sessionStorage.setItem(`chapter-${key}`, JSON.stringify(chapter));
    } catch (error) {
      console.error('Error storing in session storage:', error);
    }
  }, [novelId, getCacheKey]);

  // Preload chapter in background
  const preloadChapter = useCallback(async (chapterNumber: number) => {
    if (!novelId || chapterNumber < 1) return;

    const key = getCacheKey(novelId, chapterNumber);
    
    // Skip if already cached or currently loading
    if (cache[key] || loading.has(chapterNumber)) {
      return;
    }

    // Check session storage first
    const cached = getCachedChapter(chapterNumber);
    if (cached) {
      return;
    }

    setLoading(prev => new Set(prev).add(chapterNumber));

    try {
      const { data: chapterData, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('novel_id', novelId)
        .eq('chapter_number', chapterNumber)
        .eq('is_hidden', false)
        .maybeSingle();

      if (error) {
        console.error('Error preloading chapter:', error);
        return;
      }

      if (chapterData) {
        setCachedChapter(chapterData);
      }
    } catch (error) {
      console.error('Error preloading chapter:', error);
    } finally {
      setLoading(prev => {
        const newSet = new Set(prev);
        newSet.delete(chapterNumber);
        return newSet;
      });
    }
  }, [novelId, cache, loading, getCacheKey, getCachedChapter, setCachedChapter]);

  // Clear cache for a specific novel
  const clearCache = useCallback(() => {
    setCache({});
    // Clear session storage for this novel
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(`chapter-${novelId}-`)) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.error('Error clearing session storage:', error);
    }
  }, [novelId]);

  return {
    getCachedChapter,
    setCachedChapter,
    preloadChapter,
    clearCache,
    isLoading: (chapterNumber: number) => loading.has(chapterNumber)
  };
};
