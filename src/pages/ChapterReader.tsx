
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, BookOpen, Eye, Settings } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import LockedChapter from "@/components/LockedChapter";
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

const ChapterReader = () => {
  const { id, chapterId } = useParams<{ id: string; chapterId: string }>();
  const { user } = useAuth();
  const { checkChapterPurchased } = useCoins();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const navigate = useNavigate();

  // Reading settings state
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('serif');
  const [lineHeight, setLineHeight] = useState(1.6);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchChapterData = async () => {
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
    };

    if (id && chapterId) {
      fetchChapterData();
    }
  }, [id, chapterId, user, navigate, checkChapterPurchased]);

  // Load user reading settings
  useEffect(() => {
    const loadReadingSettings = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_reading_settings')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFontSize(data.font_size || 18);
          setFontFamily(data.font_family || 'serif');
          setLineHeight(data.line_height || 1.6);
        }
      } catch (error) {
        console.error("Error loading reading settings:", error);
      }
    };

    loadReadingSettings();
  }, [user]);

  const saveReadingSettings = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_reading_settings')
        .update({
          font_size: fontSize,
          font_family: fontFamily,
          line_height: lineHeight,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      toast.success("Reading settings saved");
    } catch (error) {
      console.error("Error saving reading settings:", error);
      toast.error("Failed to save settings");
    }
  };

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
        
        <div className="max-w-4xl mx-auto px-4 py-8">
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
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <Link to={`/novel/${novelSlug}`}>
            <Button variant="outline" className="mb-4 border-gray-600 text-gray-300 hover:bg-gray-700">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to {novel.title}
            </Button>
          </Link>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-100 mb-2">{chapter.title}</h1>
              <p className="text-gray-400">
                Chapter {chapter.chapter_number} of {novel.total_chapters}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-gray-400">
                <Eye className="h-4 w-4" />
                <span>{(chapter.views || 0).toLocaleString()} views</span>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Reading Settings */}
        {showSettings && (
          <Card className="mb-6 bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-100">Reading Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Size: {fontSize}px
                  </label>
                  <input
                    type="range"
                    min="14"
                    max="24"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Font Family
                  </label>
                  <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200"
                  >
                    <option value="serif">Serif</option>
                    <option value="sans-serif">Sans Serif</option>
                    <option value="monospace">Monospace</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Line Height: {lineHeight}
                  </label>
                  <input
                    type="range"
                    min="1.2"
                    max="2.0"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              
              <Button
                onClick={saveReadingSettings}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save Settings
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Chapter Content */}
        <Card className="mb-8 bg-gray-800 border-gray-700">
          <CardContent className="p-8">
            <div
              className="prose prose-invert max-w-none text-gray-200"
              style={{
                fontSize: `${fontSize}px`,
                fontFamily: fontFamily,
                lineHeight: lineHeight,
              }}
            >
              {chapter.content.split('\n').map((paragraph, index) => (
                <p key={index} className="mb-4">
                  {paragraph}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          {prevChapter ? (
            <Link to={`/novel/${novelSlug}/chapter/${prevChapter}`}>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous Chapter
              </Button>
            </Link>
          ) : (
            <div></div>
          )}

          <Link to={`/novel/${novelSlug}`}>
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
              <BookOpen className="mr-2 h-4 w-4" />
              Chapter List
            </Button>
          </Link>

          {nextChapter ? (
            <Link to={`/novel/${novelSlug}/chapter/${nextChapter}`}>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Next Chapter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterReader;
