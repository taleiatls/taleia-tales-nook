
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight, Settings, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoins } from "@/hooks/useCoins";
import LockedChapter from "@/components/LockedChapter";

interface Chapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  content: string;
  is_locked: boolean;
  coin_price: number;
}

interface Novel {
  id: string;
  title: string;
}

interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

const defaultSettings: ReadingSettings = {
  font_size: 18,
  font_family: 'serif',
  line_height: 1.6,
  theme: 'dark'
};

const ChapterReader = () => {
  const { id: novelId, chapterId } = useParams();
  const { user } = useAuth();
  const { checkChapterPurchased } = useCoins();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<{ id: string; chapter_number: number; title: string }[]>([]);
  const [settings, setSettings] = useState<ReadingSettings>(defaultSettings);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isChapterUnlocked, setIsChapterUnlocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch novel info
        const { data: novelData, error: novelError } = await supabase
          .from('novels')
          .select('id, title')
          .eq('id', novelId)
          .maybeSingle();

        if (novelError) throw novelError;
        setNovel(novelData);

        // Fetch all chapter numbers and titles for the novel (for navigation)
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, chapter_number, title')
          .eq('novel_id', novelId)
          .order('chapter_number', { ascending: true });
          
        if (chaptersError) throw chaptersError;
        setChapters(chaptersData || []);

        // Fetch current chapter content
        const { data: chapterData, error: chapterError } = await supabase
          .from('chapters')
          .select('*')
          .eq('novel_id', novelId)
          .eq('chapter_number', parseInt(chapterId || '1'))
          .maybeSingle();

        if (chapterError) throw chapterError;
        setChapter(chapterData);

        // Check if chapter is unlocked for logged-in users
        if (chapterData && chapterData.is_locked && user) {
          const purchased = await checkChapterPurchased(chapterData.id);
          setIsChapterUnlocked(purchased);
        } else if (chapterData && !chapterData.is_locked) {
          setIsChapterUnlocked(true);
        }

        // Increment view count for this chapter (only if unlocked)
        if (chapterData && (!chapterData.is_locked || isChapterUnlocked)) {
          await supabase
            .from('chapters')
            .update({ views: (chapterData.views || 0) + 1 })
            .eq('id', chapterData.id);
        }

        // Fetch user reading settings if logged in
        if (user) {
          const { data: userSettings, error: settingsError } = await supabase
            .from('user_reading_settings')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

          if (!settingsError && userSettings) {
            setSettings({
              font_size: userSettings.font_size,
              font_family: userSettings.font_family,
              line_height: userSettings.line_height,
              theme: userSettings.theme as 'light' | 'dark' | 'comfort'
            });
          }
        }
      } catch (error) {
        console.error("Error fetching chapter:", error);
        toast.error("Failed to load chapter");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    window.scrollTo(0, 0);
  }, [novelId, chapterId, user, checkChapterPurchased]);

  const handleChapterUnlock = async () => {
    if (chapter) {
      const purchased = await checkChapterPurchased(chapter.id);
      setIsChapterUnlocked(purchased);
    }
  };

  const currentIndex = chapters.findIndex(c => c.chapter_number.toString() === chapterId);
  const prevChapter = currentIndex > 0 ? chapters[currentIndex - 1] : null;
  const nextChapter = currentIndex < chapters.length - 1 ? chapters[currentIndex + 1] : null;

  // Apply theme styles
  const getThemeStyles = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-gray-100 text-gray-900';
      case 'dark':
        return 'bg-gray-900 text-gray-200';
      case 'comfort':
        return 'bg-amber-50 text-amber-900';
      default:
        return 'bg-gray-900 text-gray-200';
    }
  };

  // Show locked chapter component if chapter is locked and not purchased
  const shouldShowLockedChapter = chapter?.is_locked && !isChapterUnlocked && user;
  const shouldShowLoginPrompt = chapter?.is_locked && !user;

  return (
    <div className={`min-h-screen ${getThemeStyles()}`}>
      {/* Top Navigation Bar */}
      <div className={`sticky top-0 z-10 ${settings.theme === 'light' ? 'bg-white' : settings.theme === 'dark' ? 'bg-black' : 'bg-amber-100'} border-b ${settings.theme === 'light' ? 'border-gray-200' : settings.theme === 'dark' ? 'border-gray-800' : 'border-amber-200'}`}>
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <Link 
            to={`/novel/${novelId}`} 
            className={`flex items-center ${settings.theme === 'light' ? 'text-blue-600' : settings.theme === 'dark' ? 'text-blue-400' : 'text-amber-800'}`}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            <span className="font-medium">Back to Novel</span>
          </Link>
          
          {/* Chapter Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {prevChapter && (
              <Link to={`/novel/${novelId}/chapter/${prevChapter.chapter_number}`}>
                <Button variant="outline" size="sm" className={settings.theme === 'dark' ? 'border-gray-700 text-gray-300' : ''}>
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
              </Link>
            )}
            
            <Link to={`/settings`} className="md:hidden">
              <Button variant="ghost" size="icon" className={settings.theme === 'dark' ? 'text-gray-300' : ''}>
                <Settings className="h-5 w-5" />
              </Button>
            </Link>
            
            {nextChapter && (
              <Link to={`/novel/${novelId}/chapter/${nextChapter.chapter_number}`}>
                <Button variant="outline" size="sm" className={settings.theme === 'dark' ? 'border-gray-700 text-gray-300' : ''}>
                  Next
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent 
              side="right" 
              className={`w-64 ${settings.theme === 'light' ? 'bg-white' : settings.theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-amber-50'}`}
            >
              <div className="py-6">
                <h3 className={`font-medium mb-4 ${settings.theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>
                  Chapter Navigation
                </h3>
                <ScrollArea className="h-[70vh]">
                  <div className="space-y-1 pr-4">
                    {chapters.map((c) => (
                      <Link
                        key={c.id}
                        to={`/novel/${novelId}/chapter/${c.chapter_number}`}
                        className={`block py-2 px-3 rounded-md ${
                          c.chapter_number.toString() === chapterId 
                          ? (settings.theme === 'dark' ? 'bg-blue-900 text-blue-100' : settings.theme === 'light' ? 'bg-blue-100 text-blue-800' : 'bg-amber-200 text-amber-900')
                          : settings.theme === 'dark' ? 'text-gray-300 hover:bg-gray-800' : settings.theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-amber-800 hover:bg-amber-100'
                        }`}
                        onClick={() => setMenuOpen(false)}
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
                
                <div className="mt-8 space-y-3">
                  <Link to={`/settings`} className="block">
                    <Button 
                      variant="outline" 
                      className="w-full flex items-center justify-center"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Reading Settings
                    </Button>
                  </Link>
                  
                  <Link to={`/novel/${novelId}`} className="block">
                    <Button 
                      variant="default" 
                      className="w-full"
                    >
                      Back to Novel
                    </Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div 
        className="container mx-auto px-4 py-8 max-w-3xl"
        style={{
          fontFamily: settings.font_family,
          fontSize: `${settings.font_size}px`,
          lineHeight: settings.line_height
        }}
      >
        {loading ? (
          <div className="text-center py-12">Loading chapter...</div>
        ) : chapter ? (
          <>
            <h1 className="text-3xl font-bold mb-2">{chapter.title}</h1>
            <h2 className="text-lg mb-8">{novel?.title}</h2>
            
            {/* Show locked chapter component */}
            {shouldShowLockedChapter ? (
              <LockedChapter
                chapterId={chapter.id}
                chapterTitle={chapter.title}
                coinPrice={chapter.coin_price}
                novelId={novelId!}
                onUnlock={handleChapterUnlock}
              />
            ) : shouldShowLoginPrompt ? (
              <Card className="p-8 text-center">
                <h2 className="text-xl font-bold mb-4">Chapter Locked</h2>
                <p className="mb-6">This chapter requires coins to unlock. Please sign in to continue.</p>
                <Link to="/auth">
                  <Button>Sign In</Button>
                </Link>
              </Card>
            ) : (
              <>
                {/* Chapter Content */}
                <div className="prose max-w-none prose-lg">
                  {chapter.content.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="mb-6">{paragraph}</p>
                  ))}
                </div>
                
                {/* Bottom Navigation */}
                <div className="mt-12 flex justify-between items-center">
                  {prevChapter ? (
                    <Link to={`/novel/${novelId}/chapter/${prevChapter.chapter_number}`}>
                      <Button className={`flex items-center ${settings.theme === 'dark' ? 'bg-blue-800 hover:bg-blue-700' : settings.theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Previous Chapter
                      </Button>
                    </Link>
                  ) : (
                    <div></div>
                  )}
                  
                  {nextChapter && (
                    <Link to={`/novel/${novelId}/chapter/${nextChapter.chapter_number}`}>
                      <Button className={`flex items-center ${settings.theme === 'dark' ? 'bg-blue-800 hover:bg-blue-700' : settings.theme === 'light' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-600 hover:bg-amber-700 text-white'}`}>
                        Next Chapter
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  )}
                </div>
              </>
            )}
          </>
        ) : (
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4">Chapter Not Found</h2>
            <p className="mb-6">The chapter you're looking for doesn't exist.</p>
            <Link to={`/novel/${novelId}`}>
              <Button>Back to Novel</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ChapterReader;
