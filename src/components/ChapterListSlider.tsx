
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { List, Lock } from "lucide-react";

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
        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <List className="h-4 w-4 mr-2" />
          Chapters
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 bg-gray-900 border-gray-700">
        <SheetHeader>
          <SheetTitle className="text-gray-100">
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
                <div className={`p-3 rounded-lg border transition-colors ${
                  chapter.chapter_number === currentChapter
                    ? "border-blue-500 bg-blue-900/20"
                    : "border-gray-700 hover:bg-gray-800"
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className={`font-medium text-sm ${
                          chapter.chapter_number === currentChapter
                            ? "text-blue-400"
                            : "text-gray-200"
                        }`}>
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
                      <p className="text-xs text-gray-500">{formatDate(chapter.created_at)}</p>
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
