
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { Search as SearchIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/slugify";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  cover_image_url: string | null;
  created_at: string;
}

const Search = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initial load of novels (empty search)
    searchNovels("");
  }, []);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    searchNovels(searchTerm);
  };

  const searchNovels = useCallback(async (query: string) => {
    setLoading(true);
    try {
      let queryBuilder = supabase
        .from('novels')
        .select('*')
        .eq('is_hidden', false);

      if (query.trim()) {
        queryBuilder = queryBuilder.or(`title.ilike.%${query}%,author.ilike.%${query}%`);
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false });

      if (error) throw error;
      setNovels(data || []);
    } catch (error) {
      console.error("Error searching novels:", error);
      toast.error("Failed to search novels");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="mb-8 flex items-center">
          <Input
            type="text"
            placeholder="Search for novels..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="mr-4 bg-gray-800 border-gray-700 text-gray-300 placeholder-gray-500 focus-visible:ring-blue-500"
          />
          <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
            <SearchIcon className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center text-gray-400">Loading...</div>
        ) : novels.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {novels.map((novel) => {
              const novelSlug = slugify(novel.title);

              return (
                <Link key={novel.id} to={`/novel/${novelSlug}`}>
                  <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-gray-100">{novel.title}</CardTitle>
                      <CardDescription className="text-sm text-gray-400">By {novel.author}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {novel.cover_image_url && (
                        <img
                          src={novel.cover_image_url}
                          alt={novel.title}
                          className="w-full h-48 object-cover rounded-md mb-4"
                        />
                      )}
                      <p className="text-gray-300 text-sm line-clamp-3">{novel.synopsis || "No synopsis available."}</p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-400">No novels found.</div>
        )}
      </div>
    </div>
  );
};

export default Search;
