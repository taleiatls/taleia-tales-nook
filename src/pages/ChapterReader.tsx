import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import LockedChapter from "@/components/LockedChapter";
import ChapterListSlider from "@/components/ChapterListSlider";
import SettingsModal from "@/components/SettingsModal";
import ChapterSidebarAd from "@/components/ads/ChapterSidebarAd";
import MobileStatusBarAd from "@/components/ads/MobileStatusBarAd";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoins } from "@/hooks/useCoins";
import { isUUID, slugify } from "@/lib/slugify";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChapterCache } from "@/hooks/useChapterCache";
import { useReadingSettings } from "@/hooks/useReadingSettings";

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

interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

const ChapterReader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const { user } = useAuth();
  const { checkChapterPurchased } = useCoins();
  const isMobile = useIsMobile();
  const { settings: readingSettings, updateSettings: updateReadingSettings } = useReadingSettings();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  // Initialize chapter cache
  const { getCachedChapter, setCachedChapter, preloadChapter } = useChapterCache(novel?.id || '');

  // Theme helper functions
  const getThemeBackgroundClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'bg-gray-50';
      case 'comfort':
        return 'bg-amber-50';
      default:
        return 'bg-gray-900';
    }
  };

  const getThemeTextClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'text-gray-900';
      case 'comfort':
        return 'text-amber-900';
      default:
        return 'text-gray-200';
    }
  };

  const getThemeCardClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'bg-white text-gray-900 border-gray-200';
      case 'comfort':
        return 'bg-amber-25 text-amber-900 border-amber-200';
      default:
        return 'bg-gray-800 text-gray-200 border-gray-700';
    }
  };

  const getThemeButtonClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400';
      case 'comfort':
        return 'bg-amber-25 border-amber-300 text-amber-800 hover:bg-amber-100 hover:border-amber-400';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700 hover:border-gray-500';
    }
  };

  const getThemeSettingsButtonClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'comfort':
        return 'bg-amber-25 border-amber-300 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700';
    }
  };

  const getThemeSubtextClasses = () => {
    switch (readingSettings.theme) {
      case 'light':
        return 'text-gray-600';
      case 'comfort':
        return 'text-amber-700';
      default:
        return 'text-gray-400';
    }
  };

  const getFontFamily = () => {
    switch (readingSettings.font_family) {
      case 'sans-serif':
        return 'font-sans';
      case 'monospace':
        return 'font-mono';
      default:
        return 'font-serif';
    }
  };

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
        toast.error("Novel not found");
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
        toast.error("Chapter not found");
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

          if (novelFetchError) {
            console.error("Error fetching novel data:", novelFetchError);
          } else {
            const { error: novelViewError } = await supabase
              .from('novels')
              .update({ 
                total_views: (currentNovelData.total_views || 0) + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', novelData.id);

            if (novelViewError) {
              console.error("Error updating novel view count:", novelViewError);
            } else {
              console.log("Novel view count updated successfully");
            }
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
      toast.error("Failed to load chapter");
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [id, chapterId, user?.id, navigate, getCachedChapter, setCachedChapter, preloadChapter]);

  useEffect(() => {
    fetchChapterData();
  }, [id, chapterId]);

  const handleUnlockSuccess = useCallback(() => {
    setIsUnlocked(true);
    toast.success("Chapter unlocked! You can now read it.");
  }, []);

  const handleSettingsChange = useCallback((newSettings: any) => {
    console.log("Settings changed:", newSettings);
    updateReadingSettings(newSettings);
  }, [updateReadingSettings]);

  if (loading || checkingAccess) {
    return (
      <div className={`min-h-screen ${getThemeBackgroundClasses()}`}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className={getThemeTextClasses()}>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className={`min-h-screen ${getThemeBackgroundClasses()}`}>
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center">
          <p className={getThemeTextClasses()}>Chapter not found</p>
          <Link to="/">
            <Button className="mt-4">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Show locked chapter component if chapter is locked and user doesn't have access
  if (chapter.is_locked && !isUnlocked) {
    const novelSlug = slugify(novel.title);
    
    return (
      <div className={`min-h-screen ${getThemeBackgroundClasses()}`}>
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link to={`/novel/${novelSlug}`}>
              <Button variant="outline" className={getThemeButtonClasses()}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Novel
              </Button>
            </Link>
          </div>

          <LockedChapter
            chapterId={chapter.id}
            chapterTitle={chapter.title}
            coinPrice={chapter.coin_price}
            novelId={novel.id}
            onUnlock={handleUnlockSuccess}
          />
        </div>
      </div>
    );
  }

  const novelSlug = slugify(novel.title);
  const nextChapter = chapter.chapter_number < novel.total_chapters ? chapter.chapter_number + 1 : null;
  const prevChapter = chapter.chapter_number > 1 ? chapter.chapter_number - 1 : null;

  return (
    <div className={`min-h-screen ${getThemeBackgroundClasses()}`}>
      <Navbar />
      
      <div className={`max-w-7xl mx-auto px-4 py-4 md:py-8 ${isMobile ? 'pb-40' : ''}`}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Header */}
            <div className="mb-6">
              <Link to={`/novel/${novelSlug}`}>
                <Button variant="outline" className={getThemeButtonClasses()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Back to {novel.title}</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div className="flex-1">
                  <h1 className={`text-2xl md:text-3xl font-bold mb-2 ${getThemeTextClasses()}`}>{chapter.title}</h1>
                  <p className={`text-sm md:text-base ${getThemeSubtextClasses()}`}>
                    Chapter {chapter.chapter_number} of {novel.total_chapters}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <SettingsModal 
                    currentSettings={readingSettings}
                    onSettingsChange={handleSettingsChange} 
                  />
                  <ChapterListSlider
                    chapters={allChapters}
                    currentChapter={chapter.chapter_number}
                    novelTitle={novel.title}
                    novelSlug={novelSlug}
                  />
                </div>
              </div>
            </div>

            {/* Chapter Content */}
            <Card className={`p-4 md:p-8 ${getThemeCardClasses()} ${getFontFamily()}`}>
              <CardContent className="p-0">
                <div 
                  className={`p-4 md:p-8 ${getFontFamily()}`}
                  style={{
                    fontSize: `${readingSettings.font_size}px`,
                    lineHeight: readingSettings.line_height
                  }}
                >
                  <div className="prose prose-lg max-w-none">
                    {chapter.content.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 leading-relaxed">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Navigation - Mobile Friendly */}
            <div className="flex justify-between items-center gap-4 mt-6">
              {/* Previous Chapter */}
              {prevChapter ? (
                <Link to={`/novel/${novelSlug}/chapter/${prevChapter}`}>
                  <Button
                    variant="outline"
                    className={`min-w-[44px] px-3 sm:px-5 py-2 ${getThemeButtonClasses()} flex items-center justify-center`}
                  >
                    <ArrowLeft className="h-5 w-5" />
                    <span className="hidden sm:inline ml-2">Previous</span>
                  </Button>
                </Link>
              ) : (
                <div />
              )}

              {/* Next Chapter */}
              {nextChapter ? (
                <Link to={`/novel/${novelSlug}/chapter/${nextChapter}`}>
                  <Button
                    variant="outline"
                    className={`min-w-[44px] px-3 sm:px-5 py-2 ${getThemeButtonClasses()} flex items-center justify-center`}
                  >
                    <span className="hidden sm:inline mr-2">Next</span>
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </div>

          {/* Sidebar with Ad - Hidden on mobile, visible on xl screens */}
          <div className="hidden xl:block xl:col-span-1">
            <div className="sticky top-8">
              <ChapterSidebarAd />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Status Bar Ad */}
      <MobileStatusBarAd />
    </div>
  );
};

export default ChapterReader;
