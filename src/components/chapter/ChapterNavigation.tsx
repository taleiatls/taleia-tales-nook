
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface ChapterNavigationProps {
  novelSlug: string;
  prevChapter: number | null;
  nextChapter: number | null;
}

const ChapterNavigation = ({ novelSlug, prevChapter, nextChapter }: ChapterNavigationProps) => {
  return (
    <div className="flex justify-between items-center gap-4">
      {/* Previous Chapter */}
      {prevChapter ? (
        <Link to={`/novel/${novelSlug}/chapter/${prevChapter}`}>
          <Button
            variant="outline"
            className="min-w-[44px] px-3 sm:px-5 py-2 border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center justify-center"
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
            className="min-w-[44px] px-3 sm:px-5 py-2 border-gray-600 text-gray-300 hover:bg-gray-700 flex items-center justify-center"
          >
            <span className="hidden sm:inline mr-2">Next</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </Link>
      ) : (
        <div />
      )}
    </div>
  );
};

export default ChapterNavigation;
