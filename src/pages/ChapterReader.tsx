
import { useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import LockedChapter from "@/components/LockedChapter";
import ChapterSidebarAd from "@/components/ads/ChapterSidebarAd";
import MobileStatusBarAd from "@/components/ads/MobileStatusBarAd";
import ChapterHeader from "@/components/chapter/ChapterHeader";
import ChapterContent from "@/components/chapter/ChapterContent";
import ChapterNavigation from "@/components/chapter/ChapterNavigation";
import { slugify } from "@/lib/slugify";
import { useIsMobile } from "@/hooks/use-mobile";
import { useChapterData } from "@/hooks/useChapterData";
import { useReadingSettings } from "@/hooks/useReadingSettings";

const ChapterReader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const isMobile = useIsMobile();

  const {
    chapter,
    novel,
    allChapters,
    loading,
    isUnlocked,
    checkingAccess,
    setIsUnlocked
  } = useChapterData(id, chapterId);

  const { readingSettings, handleSettingsChange } = useReadingSettings();

  const handleUnlockSuccess = useCallback(() => {
    setIsUnlocked(true);
  }, [setIsUnlocked]);

  if (loading || checkingAccess) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Loading chapter...</p>
        </div>
      </div>
    );
  }

  if (!chapter || !novel) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Chapter not found</p>
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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
          {/* Navigation */}
          <div className="mb-6">
            <Link to={`/novel/${novelSlug}`}>
              <Button variant="outline" className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-700">
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className={`max-w-7xl mx-auto px-4 py-4 md:py-8 ${isMobile ? 'pb-40' : ''}`}>
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <ChapterHeader
              novelSlug={novelSlug}
              novelTitle={novel.title}
              chapterTitle={chapter.title}
              chapterNumber={chapter.chapter_number}
              totalChapters={novel.total_chapters}
              readingSettings={readingSettings}
              allChapters={allChapters}
              onSettingsChange={handleSettingsChange}
            />

            <ChapterContent
              content={chapter.content}
              readingSettings={readingSettings}
            />

            <ChapterNavigation
              novelSlug={novelSlug}
              prevChapter={prevChapter}
              nextChapter={nextChapter}
            />
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
