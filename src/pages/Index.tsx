import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import HomeBannerAd from "@/components/ads/HomeBannerAd";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  cover_image_url: string | null;
  created_at: string;
}

const Index = () => {
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<Novel[]>([]);
  const [popularNovels, setPopularNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchNovels = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching novels from Supabase...");
      
      const { data, error } = await supabase
        .from('novels')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Fetched novels:", data);
      const novels = data || [];
      
      // Set featured novels (first 5)
      setFeaturedNovels(novels.slice(0, 5));
      
      // Set recently updated (next 10)
      setRecentlyUpdated(novels.slice(5, 15));
      
      // Set popular novels (random selection)
      setPopularNovels(novels.slice(0, 6));
    } catch (error) {
      console.error("Error fetching novels:", error);
      toast.error("Failed to fetch novels");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNovels();
  }, [fetchNovels]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.max(1, featuredNovels.length));
    }, 5000);
    return () => clearInterval(timer);
  }, [featuredNovels.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredNovels.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredNovels.length) % featuredNovels.length);
  };

  const totalPages = Math.ceil(recentlyUpdated.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedNovels = recentlyUpdated.slice(startIndex, startIndex + itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Loading novels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      {/* Featured Novels Slider */}
      <section className="relative max-w-6xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Featured Novels</h2>
        <div className="relative overflow-hidden rounded-lg bg-gray-800 h-96">
          {featuredNovels.length > 0 && (
            <div 
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {featuredNovels.map((novel) => (
                <Link 
                  key={novel.id} 
                  to={`/novel/${novel.id}`}
                  className="flex-shrink-0 w-full h-full relative block"
                >
                  <div className="flex h-full">
                    {novel.cover_image_url && (
                      <div className="w-1/3 h-full">
                        <img
                          src={novel.cover_image_url}
                          alt={`Cover of ${novel.title}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1 p-8 flex flex-col justify-center">
                      <h3 className="text-3xl font-bold text-white mb-2">{novel.title}</h3>
                      <p className="text-gray-300 mb-4">By {novel.author}</p>
                      <p className="text-gray-400 text-lg leading-relaxed">
                        {novel.synopsis?.substring(0, 200)}...
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {featuredNovels.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {featuredNovels.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-colors ${
                      index === currentSlide ? "bg-white" : "bg-gray-500"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Ad Banner - Placed between featured content and main content */}
      <HomeBannerAd />

      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recently Updated */}
        <section className="lg:col-span-2">
          <h2 className="text-2xl font-bold text-white mb-6">Recently Updated</h2>
          <div className="space-y-4">
            {paginatedNovels.map((novel) => (
              <Link key={novel.id} to={`/novel/${novel.id}`}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-100">{novel.title}</h3>
                        <p className="text-gray-400">By {novel.author}</p>
                        <p className="text-gray-300 text-sm mt-2">
                          {novel.synopsis?.substring(0, 150)}...
                        </p>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(novel.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
          
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent className="bg-gray-800 rounded-lg">
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer text-gray-300 hover:text-white"}
                  />
                </PaginationItem>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer text-gray-300 hover:text-white"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer text-gray-300 hover:text-white"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </section>

        {/* Popular This Week */}
        <section>
          <h2 className="text-2xl font-bold text-white mb-6">Popular This Week</h2>
          <div className="space-y-4">
            {popularNovels.map((novel) => (
              <Link key={novel.id} to={`/novel/${novel.id}`}>
                <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex space-x-3">
                      {novel.cover_image_url && (
                        <img
                          src={novel.cover_image_url}
                          alt={`Cover of ${novel.title}`}
                          className="w-16 h-20 object-cover rounded"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-100 text-sm truncate">{novel.title}</h4>
                        <p className="text-gray-400 text-xs">By {novel.author}</p>
                        <p className="text-gray-300 text-xs mt-1 line-clamp-3">
                          {novel.synopsis?.substring(0, 80)}...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>

      <div className="text-center mt-12 mb-8">
        <Link to="/search">
          <Button className="bg-blue-500 text-white hover:bg-blue-600">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse All Novels
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Index;
