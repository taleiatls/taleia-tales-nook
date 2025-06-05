
import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import LockedChapter from "@/components/LockedChapter";
import ChapterListSlider from "@/components/ChapterListSlider";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCoins } from "@/hooks/useCoins";
import { isUUID, slugify } from "@/lib/slugify";

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
}

interface ChapterListItem {
  id: string;
  chapter_number: number;
  title: string;
  created_at: string;
  is_locked: boolean;
  coin_price: number;
}

const ChapterReader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const { user } = useAuth();
  const { checkChapterPurchased } = useCoins();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [allChapters, setAllChapters] = useState<ChapterListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

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
          .select('id, title, author, total_chapters')
          .eq('id', id)
          .maybeSingle();

        if (error) throw error;
        novelData = data;
      } else {
        // Search by slug
        const { data: allNovels, error } = await supabase
          .from('novels')
          .select('id, title, author, total_chapters');

        if (error) throw error;

        novelData = allNovels?.find(novel => slugify(novel.title) === id) || null;
      }

      if (!novelData) {
        toast.error("Novel not found");
        navigate("/");
        return;
      }

      setNovel(novelData);

      // Fetch all chapters for the slider
      const { data: allChaptersData, error: allChaptersError } = await supabase
        .from('chapters')
        .select('id, chapter_number, title, created_at, is_locked, coin_price')
        .eq('novel_id', novelData.id)
        .order('chapter_number', { ascending: true });

      if (allChaptersError) throw allChaptersError;
      setAllChapters(allChaptersData || []);

      // Fetch the specific chapter
      const { data: chapterData, error: chapterError } = await supabase
        .from('chapters')
        .select('*')
        .eq('novel_id', novelData.id)
        .eq('chapter_number', parseInt(chapterId || '1'))
        .maybeSingle();

      if (chapterError) throw chapterError;

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
          await supabase
            .from('chapters')
            .update({ views: (chapterData.views || 0) + 1 })
            .eq('id', chapterData.id);
        }
      }

    } catch (error) {
      console.error("Error fetching chapter data:", error);
      toast.error("Failed to load chapter");
    } finally {
      setLoading(false);
      setCheckingAccess(false);
    }
  }, [id, chapterId, navigate, checkChapterPurchased]);

  useEffect(() => {
    fetchChapterData();
  }, [id, chapterId]);

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    toast.success("Chapter unlocked! You can now read it.");
  };

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
      
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={`/novel/${novelSlug}`}>
            <Button variant="outline" className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to {novel.title}</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-100 mb-2">{chapter.title}</h1>
              <p className="text-gray-400 text-sm md:text-base">
                Chapter {chapter.chapter_number} of {novel.total_chapters}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
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
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-4 md:p-8">
            <div className="prose prose-invert max-w-none text-gray-200 text-base md:text-lg leading-relaxed md:leading-loose">
              {chapter.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation - Mobile Friendly */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="w-full sm:w-auto">
            {prevChapter ? (
              <Link to={`/novel/${novelSlug}/chapter/${prevChapter}`} className="block">
                <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Previous Chapter</span>
                  <span className="sm:hidden">Previous</span>
                </Button>
              </Link>
            ) : (
              <div className="w-full sm:w-auto"></div>
            )}
          </div>

          <div className="w-full sm:w-auto order-first sm:order-none">
            <Link to={`/novel/${novelSlug}`} className="block">
              <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700">
                <BookOpen className="mr-2 h-4 w-4" />
                Novel Details
              </Button>
            </Link>
          </div>

          <div className="w-full sm:w-auto">
            {nextChapter ? (
              <Link to={`/novel/${novelSlug}/chapter/${nextChapter}`} className="block">
                <Button variant="outline" className="w-full sm:w-auto border-gray-600 text-gray-300 hover:bg-gray-700">
                  <span className="hidden sm:inline">Next Chapter</span>
                  <span className="sm:hidden">Next</span>
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            ) : (
              <div className="w-full sm:w-auto"></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;
