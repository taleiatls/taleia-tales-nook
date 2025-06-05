import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface Novel {
  id: string;
  title: string;
  author: string;
  synopsis: string | null;
  cover_image_url: string | null;
  created_at: string;
}

const Index = () => {
  const [novels, setNovels] = useState<Novel[]>([]);
  const [loading, setLoading] = useState(true);

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
      setNovels(data || []);
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
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-6">Latest Novels</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {novels.map((novel) => (
            <Link key={novel.id} to={`/novel/${novel.id}`}>
              <Card className="bg-gray-800 border-gray-700 hover:bg-gray-700 transition-colors">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-100 font-semibold">{novel.title}</CardTitle>
                  <CardDescription className="text-gray-400">By {novel.author}</CardDescription>
                </CardHeader>
                <CardContent>
                  {novel.cover_image_url && (
                    <img
                      src={novel.cover_image_url}
                      alt={`Cover of ${novel.title}`}
                      className="w-full h-48 object-cover mb-4 rounded-md"
                    />
                  )}
                  <p className="text-gray-300 text-sm">{novel.synopsis?.substring(0, 100)}...</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/search">
            <Button className="bg-blue-500 text-white hover:bg-blue-600">
              <BookOpen className="mr-2 h-4 w-4" />
              Browse All Novels
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
