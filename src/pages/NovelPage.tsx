import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Star, BookOpen, Calendar, User, Tag, ArrowUpDown } from "lucide-react";
import Navbar from "@/components/Navbar";

const NovelPage = () => {
  const { id } = useParams();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [reviewText, setReviewText] = useState("");
  const [userRating, setUserRating] = useState(0);

  // Mock data - in a real app, this would come from an API
  const novel = {
    id: 1,
    title: "The Mystic Chronicles",
    author: "Elena Brightwater",
    cover: "/placeholder.svg",
    rating: 4.8,
    totalRatings: 1254,
    tags: ["Fantasy", "Adventure", "Magic", "Romance"],
    status: "Ongoing",
    language: "English",
    synopsis: "In a world where magic and technology coexist, young mage Aria discovers she possesses a rare and dangerous power that could either save or destroy everything she holds dear. Join her on an epic journey through mystical realms, ancient prophecies, and unexpected alliances as she learns to master her abilities while facing the greatest threat her world has ever known.",
    lastUpdated: "2024-01-15",
    totalChapters: 145,
    views: "1.2M"
  };

  const chapters = Array.from({ length: 20 }, (_, i) => ({
    id: i + 1,
    title: `Chapter ${i + 1}: ${["The Beginning", "First Steps", "Hidden Powers", "The Academy", "New Friends", "Dark Secrets", "The Test", "Revelation", "Ancient Magic", "The Quest", "Dangerous Path", "Allies", "The Enemy", "Battle", "Victory", "New Challenges", "Growth", "The Truth", "Final Stand", "New Beginnings"][i] || "Untitled"}`,
    releaseDate: new Date(2024, 0, 15 - i).toLocaleDateString(),
    views: Math.floor(Math.random() * 50000) + 10000
  }));

  const reviews = [
    {
      id: 1,
      user: "BookLover123",
      rating: 5,
      comment: "Amazing story with great character development! Can't wait for the next chapter.",
      date: "2024-01-10"
    },
    {
      id: 2,
      user: "FantasyFan",
      rating: 4,
      comment: "Love the world-building and magic system. The plot keeps getting better!",
      date: "2024-01-08"
    }
  ];

  const sortedChapters = [...chapters].sort((a, b) => {
    return sortOrder === "asc" ? a.id - b.id : b.id - a.id;
  });

  const handleReviewSubmit = () => {
    if (reviewText.trim() && userRating > 0) {
      // TODO: Implement review submission when user system is added
      console.log("Review submitted:", { rating: userRating, comment: reviewText });
      setReviewText("");
      setUserRating(0);
    }
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
                    src={novel.cover} 
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
                    <span className="font-medium text-gray-300">{novel.rating}</span>
                    <span className="text-gray-500 ml-1">({novel.totalRatings})</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Status:</span>
                    <Badge variant={novel.status === "Ongoing" ? "default" : "secondary"} className="ml-2">
                      {novel.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="text-gray-500">Chapters:</span>
                    <span className="ml-2 text-gray-300">{novel.totalChapters}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Views:</span>
                    <span className="ml-2 text-gray-300">{novel.views}</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1 mb-2">
                    <Tag className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-500">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {novel.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-300">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Calendar className="h-4 w-4" />
                  Last updated: {novel.lastUpdated}
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
                            to={`/novel/${id}/chapter/${chapter.id}`}
                            className="block"
                          >
                            <div className="p-4 rounded-lg border border-gray-700 hover:bg-gray-700 transition-colors">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-medium text-gray-200">{chapter.title}</h4>
                                  <p className="text-sm text-gray-500">{chapter.releaseDate}</p>
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
                    {/* Add Review Form */}
                    <div className="mb-6 p-4 bg-gray-700 rounded-lg">
                      <h4 className="font-medium mb-3 text-gray-200">Add Your Review</h4>
                      <div className="mb-3">
                        <label className="text-sm text-gray-300 mb-2 block">Rating:</label>
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setUserRating(i + 1)}
                              className="transition-colors"
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
                        disabled={!reviewText.trim() || userRating === 0}
                      >
                        Submit Review
                      </Button>
                    </div>

                    {/* Existing Reviews */}
                    <div className="space-y-6">
                      {reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-gray-200">{review.user}</span>
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
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                      ))}
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
