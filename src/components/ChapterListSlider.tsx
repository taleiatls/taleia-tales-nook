
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { List, Lock } from "lucide-react";
import { useReadingSettings } from "@/hooks/useReadingSettings";

interface ChapterListItem {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
  is_locked: boolean;
  coin_price: number;
}

interface ChapterListSliderProps {
  chapters: ChapterListItem[];
  currentChapter: number;
  novelTitle: string;
  novelSlug: string;
}

const ChapterListSlider = ({ chapters, currentChapter, novelTitle, novelSlug }: ChapterListSliderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { settings } = useReadingSettings();

  // Theme helper functions
  const getThemeButtonClasses = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50';
      case 'comfort':
        return 'bg-amber-25 border-amber-300 text-amber-800 hover:bg-amber-100';
      default:
        return 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700';
    }
  };

  const getThemeSheetClasses = () => {
    switch (settings.theme) {
      case 'light':
        return 'bg-white border-gray-200';
      case 'comfort':
        return 'bg-amber-50 border-amber-200';
      default:
        return 'bg-gray-900 border-gray-700';
    }
  };

  const getThemeTitleClasses = () => {
    switch (settings.theme) {
      case 'light':
        return 'text-gray-900';
      case 'comfort':
        return 'text-amber-900';
      default:
        return 'text-gray-100';
    }
  };

  const getThemeChapterClasses = (isCurrentChapter: boolean) => {
    if (isCurrentChapter) {
      switch (settings.theme) {
        case 'light':
          return 'border-blue-500 bg-blue-50';
        case 'comfort':
          return 'border-blue-500 bg-blue-50';
        default:
          return 'border-blue-500 bg-blue-900/20';
      }
    } else {
      switch (settings.theme) {
        case 'light':
          return 'border-gray-200 hover:bg-gray-50';
        case 'comfort':
          return 'border-amber-200 hover:bg-amber-100';
        default:
          return 'border-gray-700 hover:bg-gray-800';
      }
    }
  };

  const getThemeChapterTextClasses = (isCurrentChapter: boolean) => {
    if (isCurrentChapter) {
      switch (settings.theme) {
        case 'light':
          return 'text-blue-600';
        case 'comfort':
          return 'text-blue-600';
        default:
          return 'text-blue-400';
      }
    } else {
      switch (settings.theme) {
        case 'light':
          return 'text-gray-900';
        case 'comfort':
          return 'text-amber-900';
        default:
          return 'text-gray-200';
      }
    }
  };

  const getThemeSubtextClasses = () => {
    switch (settings.theme) {
      case 'light':
        return 'text-gray-500';
      case 'comfort':
        return 'text-amber-600';
      default:
        return 'text-gray-500';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const handleChapterClick = () => {
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className={getThemeButtonClasses()}>
          <List className="h-4 w-4 mr-2" />
          Chapters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className={`w-80 ${getThemeSheetClasses()}`}>
        <SheetHeader>
          <SheetTitle className={getThemeTitleClasses()}>
            {novelTitle} - Chapters
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          <div className="space-y-2 pr-4">
            {chapters.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/novel/${novelSlug}/chapter/${chapter.chapter_number}`}
                className="block"
                onClick={handleChapterClick}
              >
                <div className={`p-3 rounded-lg border transition-colors ${getThemeChapterClasses(chapter.chapter_number === currentChapter)}`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${getThemeChapterTextClasses(chapter.chapter_number === currentChapter)}`}>
                          Ch. {chapter.chapter_number}: {chapter.title}
                        </h4>
                        {chapter.is_locked && (
                          <div className="flex items-center gap-1">
                            <Lock className="h-3 w-3 text-yellow-400" />
                            <Badge variant="secondary" className="bg-yellow-600 text-black text-xs px-1 py-0">
                              {chapter.coin_price}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <p className={`text-xs ${getThemeSubtextClasses()}`}>{formatDate(chapter.created_at)}</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default ChapterListSlider;
