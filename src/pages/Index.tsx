
import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Search, BookOpen, Star, Clock, TrendingUp } from "lucide-react";
import Navbar from "@/components/Navbar";

const featuredNovels = [
  {
    id: 1,
    title: "The Mystic Chronicles",
    author: "Elena Brightwater",
    cover: "/placeholder.svg",
    rating: 4.8,
    tags: ["Fantasy", "Adventure"],
    status: "Ongoing"
  },
  {
    id: 2,
    title: "Digital Hearts",
    author: "Alex Chen",
    cover: "/placeholder.svg",
    rating: 4.6,
    tags: ["Sci-Fi", "Romance"],
    status: "Complete"
  },
  {
    id: 3,
    title: "Academy of Shadows",
    author: "Morgan Vale",
    cover: "/placeholder.svg",
    rating: 4.9,
    tags: ["Fantasy", "School"],
    status: "Ongoing"
  }
];

// Extended recently updated list with 15 items
const allRecentlyUpdated = [
  { id: 1, title: "The Mystic Chronicles", chapter: "Chapter 145: The Final Stand", time: "2 hours ago" },
  { id: 2, title: "Digital Hearts", chapter: "Chapter 78: Unexpected Reunion", time: "5 hours ago" },
  { id: 3, title: "Academy of Shadows", chapter: "Chapter 203: Hidden Truths", time: "1 day ago" },
  { id: 4, title: "Starship Commander", chapter: "Chapter 92: Last Hope", time: "2 days ago" },
  { id: 5, title: "Magic Academy Elite", chapter: "Chapter 156: Ancient Secrets", time: "3 days ago" },
  { id: 6, title: "Virtual Reality Love", chapter: "Chapter 67: Digital Dreams", time: "4 days ago" },
  { id: 7, title: "Shadow Hunter", chapter: "Chapter 234: Night Raid", time: "5 days ago" },
  { id: 8, title: "Elemental Princess", chapter: "Chapter 89: Fire and Ice", time: "6 days ago" },
  { id: 9, title: "Cyber Detective", chapter: "Chapter 123: Data Trail", time: "1 week ago" },
  { id: 10, title: "Mystic Realm", chapter: "Chapter 178: Portal Gateway", time: "1 week ago" },
  { id: 11, title: "Dragon Slayer Academy", chapter: "Chapter 145: Final Exam", time: "1 week ago" },
  { id: 12, title: "Space Mercenary", chapter: "Chapter 201: Galactic War", time: "1 week ago" },
  { id: 13, title: "Time Traveler's Diary", chapter: "Chapter 56: Past Mistakes", time: "2 weeks ago" },
  { id: 14, title: "Immortal Cultivator", chapter: "Chapter 267: Heavenly Breakthrough", time: "2 weeks ago" },
  { id: 15, title: "Dark Magic Academy", chapter: "Chapter 134: Forbidden Spells", time: "2 weeks ago" },
];

const popularThisWeek = [
  { id: 1, title: "The Mystic Chronicles", views: "125K", rating: 4.8 },
  { id: 2, title: "Digital Hearts", views: "98K", rating: 4.6 },
  { id: 3, title: "Academy of Shadows", views: "156K", rating: 4.9 },
];

const Index = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showAllUpdated, setShowAllUpdated] = useState(false);
  const itemsPerPage = 5;

  const displayedUpdated = showAllUpdated 
    ? allRecentlyUpdated.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : allRecentlyUpdated.slice(0, 3);

  const totalPages = Math.ceil(allRecentlyUpdated.length / itemsPerPage);

  const handleShowMore = () => {
    setShowAllUpdated(true);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 font-serif">
            Welcome to <span className="text-blue-400">TaleiaTLS</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Translated Light Stories Nest - Your cozy corner for immersive novel reading
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg">
                <Search className="mr-2 h-5 w-5" />
                Explore Novels
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="px-8 py-6 text-lg border-blue-600 text-blue-400 hover:bg-blue-950">
              <BookOpen className="mr-2 h-5 w-5" />
              Latest Updates
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Novels Carousel */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center font-serif">Featured Novels</h2>
          <Carousel className="w-full max-w-xs sm:max-w-sm md:max-w-4xl mx-auto">
            <CarouselContent>
              {featuredNovels.map((novel) => (
                <CarouselItem key={novel.id} className="basis-full sm:basis-1/2 lg:basis-1/3">
                  <Card className="h-full hover:shadow-lg transition-shadow bg-gray-950 border-gray-800">
                    <CardHeader className="pb-2">
                      <div className="aspect-[3/4] bg-gray-800 rounded-lg mb-4 overflow-hidden">
                        <img 
                          src={novel.cover} 
                          alt={novel.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <CardTitle className="text-lg font-serif line-clamp-2 text-white">{novel.title}</CardTitle>
                      <CardDescription className="text-gray-400">by {novel.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                          <span className="text-sm font-medium text-gray-300">{novel.rating}</span>
                        </div>
                        <Badge variant={novel.status === "Ongoing" ? "default" : "secondary"}>
                          {novel.status}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        {novel.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Link to={`/novel/${novel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                          Read Now
                        </Button>
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

      {/* Content Sections */}
      <section className="py-16 px-4 bg-gray-950/50">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Recently Updated */}
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <Clock className="mr-2 h-5 w-5" />
                  Recently Updated
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {displayedUpdated.map((item) => (
                  <div key={item.id} className="border-b border-gray-800 pb-3 last:border-b-0">
                    <Link to={`/novel/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-400">
                      <h4 className="font-medium mb-1 text-white">{item.title}</h4>
                      <p className="text-sm text-gray-400 mb-1">{item.chapter}</p>
                      <p className="text-xs text-gray-500">{item.time}</p>
                    </Link>
                  </div>
                ))}
                
                {!showAllUpdated && (
                  <Button 
                    variant="outline" 
                    className="w-full mt-4 border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={handleShowMore}
                  >
                    Show More
                  </Button>
                )}
                
                {showAllUpdated && totalPages > 1 && (
                  <Pagination className="mt-6">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage > 1) setCurrentPage(currentPage - 1);
                          }}
                          className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              setCurrentPage(page);
                            }}
                            isActive={currentPage === page}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      <PaginationItem>
                        <PaginationNext 
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (currentPage < totalPages) setCurrentPage(currentPage + 1);
                          }}
                          className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </CardContent>
            </Card>

            {/* Popular This Week */}
            <Card className="bg-gray-950 border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center text-blue-400">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  Popular This Week
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {popularThisWeek.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 border-b border-gray-800 pb-3 last:border-b-0">
                    <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-blue-400 font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <Link to={`/novel/${item.title.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-blue-400">
                        <h4 className="font-medium text-white">{item.title}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span>{item.views} views</span>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {item.rating}
                          </div>
                        </div>
                      </Link>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
