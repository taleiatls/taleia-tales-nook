import { useState, useEffect } from "react";
import { useParams, Link, Navigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Star, BookOpen, Calendar, User, Tag, ArrowUpDown } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Novel {
  id: string;
  title: string;
  author: string;
  cover_image_url: string;
  synopsis: string;
  status: string;
  language: string;
  total_chapters: number;
  total_views: number;
  average_rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
  tags?: {
    tags: {
      name: string;
    };
  }[];
}

interface Chapter {
  id: string;
  novel_id: string;
  chapter_number: number;
  title: string;
  views: number;
  created_at: string;
}

interface Review {
  id: string;
  user_id: string;
  novel_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const NovelPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);
  const [novel, setNovel] = useState<Novel | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [existingUserReview, setExistingUserReview] = useState<Review | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNovelData = async () => {
      setLoading(true);
      try {
        // Fetch novel details
        const { data: novelData, error: novelError } = await supabase
          .from('novels')
          .select(`
            *,
            tags:novel_tags(
              tags:tag_id(name)
            )
          `)
          .eq('id', id)
          .maybeSingle();

        if (novelError) throw novelError;
        if (!novelData) {
          toast.error("Novel not found");
          navigate("/");
          return;
        }

        setNovel(novelData);

        // Fetch chapters
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('*')
          .eq('novel_id', novelData.id)
          .order('chapter_number', { ascending: true });

        if (chaptersError) throw chaptersError;
        setChapters(chaptersData || []);

        // Fetch reviews with user information
        const { data: reviewsData, error: reviewsError } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles:user_id(username)
          `)
          .eq('novel_id', novelData.id)
          .order('created_at', { ascending: false });

        if (reviewsError) throw reviewsError;
        setReviews(reviewsData || []);

        // Check if user has already reviewed this novel
        if (user && reviewsData) {
          const userReview = reviewsData.find(review => review.user_id === user.id);
          if (userReview) {
            setExistingUserReview(userReview);
            setUserRating(userReview.rating);
            setReviewText(userReview.comment || '');
          }
        }

      } catch (error) {
        console.error("Error fetching novel data:", error);
        toast.error("Failed to load novel data");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchNovelData();
    }
  }, [id, user, navigate]);

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === "asc" ? a.chapter_number - b.chapter_number : b.chapter_number - a.chapter_number;
  });

  const handleReviewSubmit = async () => {
    if (!user) {
      toast.error("You must be logged in to submit a review");
      navigate("/auth");
      return;
    }

    if (!reviewText.trim() || userRating === 0) {
      toast.error("Please enter a comment and rating");
      return;
    }

    setSubmittingReview(true);
    try {
      if (existingUserReview) {
        // Update existing review
        const { error } = await supabase
          .from('reviews')
          .update({
            rating: userRating,
            comment: reviewText.trim(),
            updated_at: new Date().toISOString()
          })
          .eq('id', existingUserReview.id);

        if (error) throw error;
        toast.success("Your review has been updated");
      } else {
        // Create new review
        const { error } = await supabase
          .from('reviews')
          .insert({
            user_id: user.id,
            novel_id: id,
            rating: userRating,
            comment: reviewText.trim()
          });

        if (error) throw error;
        toast.success("Your review has been submitted");
      }

      // Refetch reviews
      const { data: updatedReviews, error: reviewsError } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles:user_id(username)
        `)
        .eq('novel_id', id)
        .order('created_at', { ascending: false });

      if (reviewsError) throw reviewsError;
      setReviews(updatedReviews || []);

      // Update user's review state
      const userReview = updatedReviews?.find(review => review.user_id === user.id) || null;
      setExistingUserReview(userReview);

    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Loading novel information...</p>
        </div>
      </div>
    );
  }

  if (!novel) {
    return <Navigate to="/" replace />;
  }

  // Format the updated date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Novel Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="text-center">
                <div className="aspect-[3/4] bg-gray-700 rounded-lg mb-4 overflow-hidden mx-auto max-w-64">
                  <img 
                    src={novel.cover_image_url} 
                    alt={novel.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <CardTitle className="text-2xl font-serif text-gray-100">{novel.title}</CardTitle>
                <CardDescription className="flex items-center justify-center gap-1 text-gray-400">
                  <User className="h-4 w-4" />
                  by {novel.author}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="flex items-center">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium text-gray-300">{novel.average_rating.toFixed(1)}</span>
                    <span className="text-gray-500 ml-1">({novel.total_ratings})</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={novel.status === "ongoing" ? "default" : "secondary"} className="ml-2">
                      {novel.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Chapters:</span>
                    <span className="ml-2 text-gray-300">{novel.total_chapters}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Views:</span>
                    <span className="ml-2 text-gray-300">{novel.total_views}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {novel.tags && novel.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {tag.tags.name}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Last updated: {formatDate(novel.updated_at)}
                </div>

                <Link to={`/novel/${id}/chapter/1`}>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6">
                    <BookOpen className="mr-2 h-5 w-5" />
                    Start Reading
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
                <TabsTrigger value="description" className="data-[state=active]:bg-blue-600">Description</TabsTrigger>
                <TabsTrigger value="chapters" className="data-[state=active]:bg-blue-600">Chapters</TabsTrigger>
                <TabsTrigger value="reviews" className="data-[state=active]:bg-blue-600">Reviews</TabsTrigger>
              </TabsList>
              
              <TabsContent value="description" className="mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 leading-relaxed">{novel.synopsis}</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chapters" className="mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-gray-100">Chapter List</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      <ArrowUpDown className="h-4 w-4 mr-2" />
                      {sortOrder === "asc" ? "Oldest First" : "Newest First"}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-96">
                      <div className="space-y-2">
                        {sortedChapters.map((chapter) => (
                          <Link
                            key={chapter.id}
                            to={`/novel/${id}/chapter/${chapter.chapter_number}`}
                            className="block"
                          >
                            <div className="p-4 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-200">{chapter.title}</h4>
                                  <p className="text-sm text-gray-500">{formatDate(chapter.created_at)}</p>
                                </div>
                                <span className="text-xs text-gray-400">{chapter.views.toLocaleString()} views</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reviews" className="mt-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-100">Reader Reviews</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Add Review Form for logged-in users */}
                    {user ? (
                      <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                        <h4 className="font-medium mb-3 text-gray-200">
                          {existingUserReview ? "Edit Your Review" : "Add Your Review"}
                        </h4>
                        <div className="mb-3">
                          <label className="text-sm text-gray-300 mb-2 block">Rating:</label>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <button
                                key={i}
                                onClick={() => setUserRating(i + 1)}
                                className="transition-colors"
                                aria-label={`Rate ${i + 1} stars`}
                              >
                                <Star
                                  className={`h-6 w-6 ${
                                    i < userRating
                                      ? "fill-yellow-400 text-yellow-400"
                                      : "text-gray-500 hover:text-yellow-300"
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>
                        <Textarea
                          placeholder="Write your review..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          className="mb-3 bg-gray-800 border-gray-600 text-gray-200"
                        />
                        <Button 
                          onClick={handleReviewSubmit}
                          className="bg-blue-600 hover:bg-blue-700"
                          disabled={!reviewText.trim() || userRating === 0 || submittingReview}
                        >
                          {submittingReview ? "Submitting..." : existingUserReview ? "Update Review" : "Submit Review"}
                        </Button>
                      </div>
                    ) : (
                      <div className="mb-6 p-4 bg-gray-700 rounded-lg text-center">
                        <p className="text-gray-300 mb-4">Sign in to leave a review</p>
                        <Link to="/auth">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <LogIn className="mr-2 h-4 w-4" /> Sign In
                          </Button>
                        </Link>
                      </div>
                    )}

                    {/* Existing Reviews */}
                    <div className="space-y-6">
                      {reviews.length > 0 ? (
                        reviews.map((review) => (
                          <div key={review.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-200">
                                {review.profiles?.username || "Anonymous User"}
                              </span>
                              <div className="flex items-center">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-600"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-300 mb-2">{review.comment}</p>
                            <span className="text-xs text-gray-500">{formatDate(review.created_at)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-400">
                          No reviews yet. Be the first to review!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NovelPage;
