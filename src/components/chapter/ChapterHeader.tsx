
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import SettingsModal from "@/components/SettingsModal";
import ChapterListSlider from "@/components/ChapterListSlider";

interface ReadingSettings {
  font_size: number;
  font_family: string;
  line_height: number;
  theme: 'light' | 'dark' | 'comfort';
}

interface ChapterListItem {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
  is_locked: boolean;
  coin_price: number;
}

interface ChapterHeaderProps {
  novelSlug: string;
  novelTitle: string;
  chapterTitle: string;
  chapterNumber: number;
  totalChapters: number;
  readingSettings: ReadingSettings;
  allChapters: ChapterListItem[];
  onSettingsChange: (settings: ReadingSettings) => void;
}

const ChapterHeader = ({
  novelSlug,
  novelTitle,
  chapterTitle,
  chapterNumber,
  totalChapters,
  readingSettings,
  allChapters,
  onSettingsChange
}: ChapterHeaderProps) => {
  return (
    <div className="mb-6">
      <Link to={`/novel/${novelSlug}`}>
        <Button variant="outline" className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">Back to {novelTitle}</span>
          <span className="sm:hidden">Back</span>
        </Button>
      </Link>
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">{chapterTitle}</h1>
          <p className="text-gray-400 text-sm md:text-base">
            Chapter {chapterNumber} of {totalChapters}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <SettingsModal 
            currentSettings={readingSettings}
            onSettingsChange={onSettingsChange} 
          />
          <ChapterListSlider
            chapters={allChapters}
            currentChapter={chapterNumber}
            novelTitle={novelTitle}
            novelSlug={novelSlug}
          />
        </div>
      </div>
    </div>
  );
};

export default ChapterHeader;
