
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Search as SearchIcon, Filter, Star, Eye, Clock, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular");
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [showFilters, setShowFilters] = useState(false);

  const genres = [
    "Fantasy", "Romance", "Sci-Fi", "Adventure", "Mystery", "Horror", 
    "Drama", "Comedy", "Action", "School", "Magic", "Isekai"
  ];

  const novels = [
    {
      id: 1,
      title: "The Mystic Chronicles",
      author: "Elena Brightwater",
      cover: "/placeholder.svg",
      rating: 4.8,
      tags: ["Fantasy", "Adventure", "Magic"],
      status: "Ongoing",
      views: 125000,
      chapters: 145,
      lastUpdate: "2 hours ago",
      synopsis: "A young mage discovers her rare powers in a world where magic is forbidden."
    },
    {
      id: 2,
      title: "Digital Hearts",
      author: "Alex Chen",
      cover: "/placeholder.svg",
      rating: 4.6,
      tags: ["Sci-Fi", "Romance", "Drama"],
      status: "Complete",
      views: 98000,
      chapters: 78,
      lastUpdate: "1 week ago",
      synopsis: "In a future where emotions can be digitized, two AIs fall in love."
    },
    {
      id: 3,
      title: "Academy of Shadows",
      author: "Morgan Vale",
      cover: "/placeholder.svg",
      rating: 4.9,
      tags: ["Fantasy", "School", "Mystery"],
      status: "Ongoing",
      views: 156000,
      chapters: 203,
      lastUpdate: "1 day ago",
      synopsis: "Students at a magical academy uncover dark secrets hidden in its halls."
    },
    {
      id: 4,
      title: "Starship Commander",
      author: "Riley Storm",
      cover: "/placeholder.svg",
      rating: 4.4,
      tags: ["Sci-Fi", "Action", "Adventure"],
      status: "Ongoing",
      views: 87000,
      chapters: 92,
      lastUpdate: "3 days ago",
      synopsis: "A reluctant captain must lead her crew through dangerous space battles."
    }
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (searchTerm) {
      params.set("q", searchTerm);
    } else {
      params.delete("q");
    }
    setSearchParams(params);
  };

  const handleGenreToggle = (genre: string) => {
    setSelectedGenres(prev => 
      prev.includes(genre) 
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const filteredNovels = novels.filter(novel => {
    const matchesSearch = !searchTerm || 
      novel.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      novel.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      novel.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesGenre = selectedGenres.length === 0 || 
      selectedGenres.some(genre => novel.tags.includes(genre));
    
    const matchesStatus = statusFilter === "all" || novel.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesGenre && matchesStatus;
  });

  const sortedNovels = [...filteredNovels].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "views":
        return b.views - a.views;
      case "recent":
        return a.id - b.id; // Mock recent sorting
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return b.views - a.views; // Default to popular
    }
  });

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter === "popular") setSortBy("views");
    else if (filter === "latest") setSortBy("recent");
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-6 text-center font-serif">
            Discover Amazing Stories
          </h1>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search novels, authors, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-6 text-lg bg-gray-900 border-gray-700 text-white focus:border-blue-400"
              />
              <Button 
                type="submit" 
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-blue-600 hover:bg-blue-700"
              >
                Search
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap justify-center gap-4">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="recent">Recently Updated</SelectItem>
                <SelectItem value="views">Most Views</SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-8 bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Genres */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-200">Genres</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map((genre) => (
                      <div key={genre} className="flex items-center space-x-2">
                        <Checkbox
                          id={genre}
                          checked={selectedGenres.includes(genre)}
                          onCheckedChange={() => handleGenreToggle(genre)}
                        />
                        <label htmlFor={genre} className="text-sm text-gray-300">
                          {genre}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <h3 className="font-medium mb-3 text-gray-200">Status</h3>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="bg-gray-800 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-gray-700">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="ongoing">Ongoing</SelectItem>
                      <SelectItem value="complete">Complete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-400">
            {sortedNovels.length} novel{sortedNovels.length !== 1 ? 's' : ''} found
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedNovels.map((novel) => (
            <Card key={novel.id} className="h-full hover:shadow-lg transition-shadow bg-gray-900 border-gray-700">
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
              <CardContent className="flex-1 flex flex-col">
                <p className="text-sm text-gray-300 mb-4 line-clamp-3">{novel.synopsis}</p>
                
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium text-gray-300">{novel.rating}</span>
                  </div>
                  <Badge variant={novel.status === "Ongoing" ? "default" : "secondary"}>
                    {novel.status}
                  </Badge>
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    {(novel.views / 1000).toFixed(0)}K
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    {novel.chapters} ch
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {novel.lastUpdate}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                  {novel.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="mt-auto">
                  <Link to={`/novel/${novel.title.toLowerCase().replace(/\s+/g, '-')}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Read Now
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedNovels.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-300 mb-2">No novels found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
