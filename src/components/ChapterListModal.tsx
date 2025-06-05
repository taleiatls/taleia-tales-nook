
import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { BookOpen, ArrowUpDown, Lock } from "lucide-react";

interface Chapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  views: number;
  created_at: string;
  is_locked: boolean;
  coin_price: number;
}

interface ChapterListModalProps {
  chapters: Chapter[];
  novelSlug: string;
}

const ChapterListModal = ({ chapters, novelSlug }: ChapterListModalProps) => {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === "asc" ? a.chapter_number - b.chapter_number : b.chapter_number - a.chapter_number;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
          <BookOpen className="mr-2 h-4 w-4" />
          Chapter List
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-800 border-gray-700 text-gray-100">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-gray-100">
              Chapter List ({chapters.length} chapters)
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortOrder === "asc" ? "Oldest First" : "Newest First"}
            </Button>
          </div>
        </DialogHeader>
        
        <ScrollArea className="h-96">
          <div className="space-y-2 pr-4">
            {sortedChapters.length > 0 ? (
              sortedChapters.map((chapter) => (
                <Link
                  key={chapter.id}
                  to={`/novel/${novelSlug}/chapter/${chapter.chapter_number}`}
                  className="block"
                >
                  <div className="p-4 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-200">
                            Chapter {chapter.chapter_number}: {chapter.title}
                          </h4>
                          {chapter.is_locked && (
                            <div className="flex items-center gap-1">
                              <Lock className="h-4 w-4 text-yellow-400" />
                              <Badge variant="secondary" className="bg-yellow-600 text-black text-xs">
                                {chapter.coin_price} coins
                              </Badge>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{formatDate(chapter.created_at)}</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-4 text-gray-400">
                No chapters available yet.
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ChapterListModal;
