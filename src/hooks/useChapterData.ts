
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoins } from "@/hooks/useCoins";
import { isUUID, slugify } from "@/lib/slugify";
import { useChapterCache } from "@/hooks/useChapterCache";

interface Chapter {
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

interface Novel {
  id: string;
  title: string;
  author: string;
  total_chapters: number;
  total_views: number;
}

interface ChapterListItem {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
  is_locked: boolean;
  coin_price: number;
}

export const useChapterData = (id: string | undefined, chapterId: string | undefined) => {
  const { user } = useAuth();
  const { checkChapterPurchased } = useCoins();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  // Initialize chapter cache
  const { getCachedChapter, setCachedChapter, preloadChapter } = useChapterCache(novel?.id || '');

  const fetchChapterData = useCallback(async () => {
    if (!id || !chapterId) return;
    
    setLoading(true);
    setCheckingAccess(true);
    
    try {
      console.log("Fetching chapter with novel ID/slug:", id, "chapter:", chapterId);
      
      let novelData: Novel | null = null;

      // Find the novel first
      if (isUUID(id || '')) {
        const { data, error } = await supabase
          .from('novels')
          .select('id, title, author, total_chapters, total_views')
          .eq('id', id)
          .eq('is_hidden', false)
          .maybeSingle();

        if (error) throw error;
        novelData = data;
      } else {
        // Search by slug
        const { data: allNovels, error } = await supabase
          .from('novels')
          .select('id, title, author, total_chapters, total_views')
          .eq('is_hidden', false);

        if (error) throw error;

        novelData = allNovels?.find(novel => slugify(novel.title) === id) || null;
      }

      if (!novelData) {
        console.error("Novel not found");
        navigate("/");
        return;
      }

      setNovel(novelData);

      // Fetch all chapters for the slider (only visible ones)
      const { data: allChaptersData, error: allChaptersError } = await supabase
        .from('chapters')
        .select('id, chapter_number, title, created_at, is_locked, coin_price')
        .eq('novel_id', novelData.id)
        .eq('is_hidden', false)
        .order('chapter_number', { ascending: true });

      if (allChaptersError) throw allChaptersError;
      setAllChapters(allChaptersData || []);

      const currentChapterNumber = parseInt(chapterId || '1');

      // Try to get chapter from cache first
      const cachedChapter = getCachedChapter(currentChapterNumber);
      let chapterData: Chapter | null = null;

      if (cachedChapter) {
        console.log("Loading chapter from cache");
        chapterData = cachedChapter;
      } else {
        // Fetch the specific chapter from database
        const { data: fetchedChapter, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('novel_id', novelData.id)
          .eq('chapter_number', currentChapterNumber)
          .eq('is_hidden', false)
          .maybeSingle();

        if (chapterError) throw chapterError;
        chapterData = fetchedChapter;

        // Cache the chapter
        if (chapterData) {
          setCachedChapter(chapterData);
        }
      }

      if (!chapterData) {
        console.error("Chapter not found");
        navigate(`/novel/${id}`);
        return;
      }

      setChapter(chapterData);

      // Check if chapter is locked and if user has access
      if (chapterData.is_locked && user) {
        const purchased = await checkChapterPurchased(chapterData.id);
        setIsUnlocked(purchased);
      } else if (!chapterData.is_locked) {
        setIsUnlocked(true);
      } else {
        setIsUnlocked(false);
      }

      // Increment view count if chapter is accessible
      if (!chapterData.is_locked || (chapterData.is_locked && user)) {
        const purchased = chapterData.is_locked ? await checkChapterPurchased(chapterData.id) : true;
        if (purchased) {
          // Update chapter view count
          await supabase
            .from('chapters')
            .update({ views: (chapterData.views || 0) + 1 })
            .eq('id', chapterData.id);

          // Update novel view count
          const { data: currentNovelData, error: novelFetchError } = await supabase
            .from('novels')
            .select('total_views')
            .eq('id', novelData.id)
            .single();

          if (!novelFetchError && currentNovelData) {
            await supabase
              .from('novels')
              .update({ 
                total_views: (currentNovelData.total_views || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', novelData.id);
          }
        }
      }

      // Preload adjacent chapters in background
      const prevChapterNumber = currentChapterNumber - 1;
      const nextChapterNumber = currentChapterNumber + 1;

      // Preload previous chapter
      if (prevChapterNumber >= 1) {
        setTimeout(() => preloadChapter(prevChapterNumber), 100);
      }

      // Preload next chapter
      if (nextChapterNumber <= novelData.total_chapters) {
        setTimeout(() => preloadChapter(nextChapterNumber), 200);
      }

    } catch (error) {
      console.error("Error fetching chapter data:", error);
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [id, chapterId, user?.id, navigate, getCachedChapter, setCachedChapter, preloadChapter, checkChapterPurchased]);

  useEffect(() => {
    fetchChapterData();
  }, [fetchChapterData]);

  return {
    chapter,
    novel,
    allChapters,
    loading,
    isUnlocked,
    checkingAccess,
    setIsUnlocked
  };
};
