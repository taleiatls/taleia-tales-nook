
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, TrendingUp, Clock, Lock } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover_image_url: string;
  total_views: number;
  total_chapters: number;
  updated_at: string;
  locked_chapters?: number;
}

const Index = () => {
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Novel[]>([]);
  const [popularThisWeek, setPopularThisWeek] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNovels = async () => {
      try {
        // Fetch all novels with their chapter counts
        const { data: novels, error } = await supabase
          .from('novels')
          .select(`
            id,
            title,
            author,
            synopsis,
            cover_image_url,
            total_views,
            total_chapters,
            updated_at
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (novels) {
          // For each novel, count locked chapters
          const novelsWithLockInfo = await Promise.all(
            novels.map(async (novel) => {
              const { data: lockedChapters, error: chapterError } = await supabase
                .from('chapters')
                .select('id')
                .eq('novel_id', novel.id)
                .eq('is_locked', true);

              if (chapterError) {
                console.error('Error fetching locked chapters:', chapterError);
                return { ...novel, locked_chapters: 0 };
              }

              return {
                ...novel,
                locked_chapters: lockedChapters?.length || 0
              };
            })
          );

          // Set featured novels (first 3)
          setFeaturedNovels(novelsWithLockInfo.slice(0, 3));

          // Recently updated (sorted by updated_at)
          const recentlyUpdatedNovels = [...novelsWithLockInfo]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
            .slice(0, 4);
          setRecentlyUpdated(recentlyUpdatedNovels);

          // Popular this week (sorted by total_views)
          const popularNovels = [...novelsWithLockInfo]
            .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
            .slice(0, 4);
          setPopularThisWeek(popularNovels);
        }
      } catch (error) {
        console.error('Error fetching novels:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNovels();
  }, []);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return `${Math.floor(diffInDays / 7)}w ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">Discover Amazing Stories</h1>
          <p className="text-xl mb-8 text-gray-300">
            Immerse yourself in captivating novels and support your favorite authors
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                <BookOpen className="mr-2 h-5 w-5" />
                Browse Novels
              </Button>
            </Link>
            <Link to="/store">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Get Coins
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Novels */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Novels</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {featuredNovels.map((novel) => (
              <Card key={novel.id} className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-xl text-white line-clamp-2">{novel.title}</CardTitle>
                    {novel.locked_chapters && novel.locked_chapters > 0 && (
                      <Badge variant="secondary" className="bg-yellow-600 text-black">
                        <Lock className="h-3 w-3 mr-1" />
                        {novel.locked_chapters} Premium
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">by {novel.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-4 line-clamp-3">{novel.synopsis}</p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-500">{novel.total_chapters} chapters</span>
                    <span className="text-sm text-gray-500">{novel.total_views} views</span>
                  </div>
                  <Link to={`/novel/${slugify(novel.title)}`}>
                    <Button className="w-full">Start Reading</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Recently Updated */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <Clock className="mr-3 h-6 w-6 text-blue-400" />
            <h2 className="text-3xl font-bold">Recently Updated</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentlyUpdated.map((novel) => (
              <Card key={novel.id} className="bg-gray-700 border-gray-600 hover:border-blue-500 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg text-white line-clamp-2">{novel.title}</CardTitle>
                    {novel.locked_chapters && novel.locked_chapters > 0 && (
                      <Lock className="h-4 w-4 text-yellow-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <CardDescription className="text-gray-400 text-sm">by {novel.author}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>{novel.total_chapters} chapters</span>
                    <span className="text-green-400">{formatTimeAgo(novel.updated_at)}</span>
                  </div>
                  <Link to={`/novel/${slugify(novel.title)}`}>
                    <Button size="sm" className="w-full">Read Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular This Week */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <TrendingUp className="mr-3 h-6 w-6 text-orange-400" />
            <h2 className="text-3xl font-bold">Popular This Week</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {popularThisWeek.map((novel, index) => (
              <Card key={novel.id} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors relative">
                <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </div>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start pt-6">
                    <CardTitle className="text-lg text-white line-clamp-2">{novel.title}</CardTitle>
                    {novel.locked_chapters && novel.locked_chapters > 0 && (
                      <Lock className="h-4 w-4 text-yellow-400 flex-shrink-0 ml-2" />
                    )}
                  </div>
                  <CardDescription className="text-gray-400 text-sm">by {novel.author}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <span>{novel.total_chapters} chapters</span>
                    <div className="flex items-center text-orange-400">
                      <Star className="h-3 w-3 mr-1" />
                      <span>{novel.total_views}</span>
                    </div>
                  </div>
                  <Link to={`/novel/${slugify(novel.title)}`}>
                    <Button size="sm" className="w-full">Read Now</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-r from-purple-900 to-blue-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Reading?</h2>
          <p className="text-xl mb-8 text-gray-300">
            Join thousands of readers and discover your next favorite story
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                Sign Up Free
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-gray-900">
                Browse All Novels
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
