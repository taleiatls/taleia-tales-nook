
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Star, TrendingUp, Clock, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string;
  cover_image_url: string;
  total_views: number;
  total_chapters: number;
  updated_at: string;
}

const Index = () => {
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Novel[]>([]);
  const [popularThisWeek, setPopularThisWeek] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    const fetchNovels = async () => {
      try {
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
          // Set featured novels (first 6 for slider)
          setFeaturedNovels(novels.slice(0, 6));

          // Recently updated (sorted by updated_at)
          const recentlyUpdatedNovels = [...novels]
            .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
          setRecentlyUpdated(recentlyUpdatedNovels);

          // Popular this week (sorted by total_views)
          const popularNovels = [...novels]
            .sort((a, b) => (b.total_views || 0) - (a.total_views || 0))
            .slice(0, 6);
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

  // Pagination for recently updated
  const totalPages = Math.ceil(recentlyUpdated.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = recentlyUpdated.slice(startIndex, endIndex);

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

      {/* Featured Novels Slider */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8">Featured Novels</h2>
          <Carousel className="w-full">
            <CarouselContent>
              {featuredNovels.map((novel) => (
                <CarouselItem key={novel.id} className="md:basis-1/2 lg:basis-1/3">
                  <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition-colors h-full">
                    <CardHeader className="pb-3">
                      <div className="aspect-[3/4] bg-gray-700 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={novel.cover_image_url} 
                          alt={novel.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-xl text-white line-clamp-2">{novel.title}</CardTitle>
                      <CardDescription className="text-gray-400">by {novel.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300 mb-4 line-clamp-3">{novel.synopsis}</p>
                      <div className="flex justify-center mb-4">
                        <span className="text-sm text-gray-500">{novel.total_chapters} chapters</span>
                      </div>
                      <Link to={`/novel/${slugify(novel.title)}`}>
                        <Button className="w-full">Start Reading</Button>
                      </Link>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </div>
      </section>

      {/* Recently Updated List */}
      <section className="py-16 bg-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Clock className="mr-3 h-6 w-6 text-blue-400" />
              <h2 className="text-3xl font-bold">Recently Updated</h2>
            </div>
          </div>
          
          <div className="space-y-4">
            {currentItems.map((novel) => (
              <Card key={novel.id} className="bg-gray-700 border-gray-600 hover:border-blue-500 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link to={`/novel/${slugify(novel.title)}`}>
                        <h3 className="text-lg font-semibold text-white hover:text-blue-400 transition-colors">
                          {novel.title}
                        </h3>
                      </Link>
                      <p className="text-gray-400 text-sm">by {novel.author}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>{novel.total_chapters} chapters</span>
                        <span className="text-green-400">{formatTimeAgo(novel.updated_at)}</span>
                      </div>
                    </div>
                    <Link to={`/novel/${slugify(novel.title)}`}>
                      <Button size="sm">Read Now</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              
              <span className="text-gray-400 px-4">
                Page {currentPage} of {totalPages}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* Popular This Week */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center mb-8">
            <TrendingUp className="mr-3 h-6 w-6 text-orange-400" />
            <h2 className="text-3xl font-bold">Popular This Week</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularThisWeek.map((novel, index) => (
              <Card key={novel.id} className="bg-gray-800 border-gray-700 hover:border-orange-500 transition-colors relative">
                <div className="absolute top-2 left-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                <CardHeader className="pb-3">
                  <div className="aspect-[3/4] bg-gray-700 rounded-lg mb-4 overflow-hidden">
                    <img 
                      src={novel.cover_image_url} 
                      alt={novel.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-lg text-white line-clamp-2">{novel.title}</CardTitle>
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
    </div>
  );
};

export default Index;
