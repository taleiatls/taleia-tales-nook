
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import SEO from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import HomeBannerAd from "@/components/ads/HomeBannerAd";
import { slugify } from "@/lib/slugify";
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
  updated_at: string;
}

interface Chapter {
  id: string;
  title: string;
  chapter_number: number;
  created_at: string;
}

interface NovelWithChapters extends Novel {
  latest_chapters: Chapter[];
}

const Index = () => {
  const [featuredNovels, setFeaturedNovels] = useState<Novel[]>([]);
  const [recentlyUpdated, setRecentlyUpdated] = useState<NovelWithChapters[]>([]);
  const [popularNovels, setPopularNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Function to format relative time
  const formatRelativeTime = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "a minute ago";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return minutes === 1 ? "a minute ago" : `${minutes} minutes ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return hours === 1 ? "an hour ago" : `${hours} hours ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return days === 1 ? "1 day ago" : `${days} days ago`;
    } else if (diffInSeconds < 2419200) {
      const weeks = Math.floor(diffInSeconds / 604800);
      return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
    } else {
      const months = Math.floor(diffInSeconds / 2419200);
      return months === 1 ? "1 month ago" : `${months} months ago`;
    }
  };

  const fetchNovels = useCallback(async () => {
    setLoading(true);
    try {
      console.log("Fetching novels from Supabase...");
      
      // Fetch featured novels (newest novels)
      const { data: featuredData, error: featuredError } = await supabase
        .from('novels')
        .select('*')
        .eq('is_hidden', false)
        .order('created_at', { ascending: false })
        .limit(5);

      if (featuredError) {
        console.error("Error fetching featured novels:", featuredError);
        throw featuredError;
      }

      // Fetch recently updated novels with their latest 3 chapters
      const { data: recentlyUpdatedData, error: recentlyUpdatedError } = await supabase
        .from('novels')
        .select(`
          *,
          chapters!inner(
            id,
            title,
            chapter_number,
            created_at
          )
        `)
        .eq('is_hidden', false)
        .order('updated_at', { ascending: false })
        .limit(15);

      if (recentlyUpdatedError) {
        console.error("Error fetching recently updated novels:", recentlyUpdatedError);
        // Fall back to basic novel fetch if the join fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('novels')
          .select('*')
          .eq('is_hidden', false)
          .order('updated_at', { ascending: false })
          .limit(15);
        
        if (fallbackError) throw fallbackError;
        setRecentlyUpdated((fallbackData || []).map(novel => ({ ...novel, latest_chapters: [] })));
      } else {
        // Process the data to get unique novels with their latest 3 chapters
        const novelsMap = new Map<string, NovelWithChapters>();
        
        recentlyUpdatedData?.forEach((item: any) => {
          const novelId = item.id;
          
          if (!novelsMap.has(novelId)) {
            novelsMap.set(novelId, {
              id: item.id,
              title: item.title,
              author: item.author,
              synopsis: item.synopsis,
              cover_image_url: item.cover_image_url,
              created_at: item.created_at,
              updated_at: item.updated_at,
              latest_chapters: []
            });
          }
          
          const novel = novelsMap.get(novelId)!;
          if (item.chapters && novel.latest_chapters.length < 3) {
            novel.latest_chapters.push({
              id: item.chapters.id,
              title: item.chapters.title,
              chapter_number: item.chapters.chapter_number,
              created_at: item.chapters.created_at
            });
          }
        });

        // Sort chapters by creation date for each novel
        Array.from(novelsMap.values()).forEach(novel => {
          novel.latest_chapters.sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
        });
        
        setRecentlyUpdated(Array.from(novelsMap.values()));
      }

      // Fetch popular novels
      const { data: popularData, error: popularError } = await supabase
        .from('novels')
        .select('*')
        .eq('is_hidden', false)
        .order('total_views', { ascending: false })
        .limit(6);

      if (popularError) {
        console.error("Error fetching popular novels:", popularError);
        throw popularError;
      }

      console.log("Fetched featured novels:", featuredData);
      console.log("Fetched recently updated novels:", recentlyUpdatedData);
      console.log("Fetched popular novels:", popularData);
      
      setFeaturedNovels(featuredData || []);
      setPopularNovels(popularData || []);
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
        <SEO />
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Loading novels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <SEO 
        title="TaleiaTLS Novel Reader - Read Web Novels Online"
        description="Discover and read amazing web novels on TaleiaTLS. Explore fantasy, romance, adventure stories and more in our extensive novel library."
        keywords="web novels, online reading, fantasy novels, romance novels, adventure stories, light novels, fiction"
      />
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
              {featuredNovels.map((novel) => {
                const novelSlug = slugify(novel.title);
                return (
                  <Link 
                    key={novel.id} 
                    to={`/novel/${novelSlug}`}
                    className="flex-shrink-0 w-full h-full relative block"
                  >
                    <div className="flex h-full">
                      {novel.cover_image_url && (
                        <div className="w-1/3 h-full flex items-center justify-center">
                          <img
                            src={novel.cover_image_url}
                            alt={`Cover of ${novel.title}`}
                            className="object-cover rounded-lg shadow-lg"
                            style={{ width: '864px', height: '480px', maxWidth: '100%', maxHeight: '100%' }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                            onLoad={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'block';
                            }}
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
                );
              })}
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
            {paginatedNovels.map((novel) => {
              const novelSlug = slugify(novel.title);
              return (
                <Link key={novel.id} to={`/novel/${novelSlug}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                    <CardContent className="p-4">
                      <div className="flex space-x-4">
                        {/* Novel Image */}
                        <div className="flex-shrink-0">
                          {novel.cover_image_url ? (
                            <img
                              src={novel.cover_image_url}
                              alt={`Cover of ${novel.title}`}
                              className="w-20 h-28 object-cover rounded"
                            />
                          ) : (
                            <div className="w-20 h-28 bg-gray-600 rounded flex items-center justify-center">
                              <BookOpen className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        
                        {/* Novel Info and Chapters */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-100 mb-1">{novel.title}</h3>
                          <p className="text-gray-400 text-sm mb-3">By {novel.author}</p>
                          
                          {/* Latest Chapters */}
                          <div className="space-y-1">
                            {novel.latest_chapters.length > 0 ? (
                              novel.latest_chapters.map((chapter) => (
                                <div key={chapter.id} className="flex justify-between items-center text-sm">
                                  <span className="text-gray-300 truncate mr-2">
                                    Chapter {chapter.chapter_number}: {chapter.title}
                                  </span>
                                  <span className="text-gray-500 text-xs whitespace-nowrap">
                                    {formatRelativeTime(chapter.created_at)}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="text-gray-500 text-sm">No chapters available</div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
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
            {popularNovels.map((novel) => {
              const novelSlug = slugify(novel.title);
              return (
                <Link key={novel.id} to={`/novel/${novelSlug}`}>
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
              );
            })}
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
