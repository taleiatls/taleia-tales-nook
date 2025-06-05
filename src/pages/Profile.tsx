
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "@/components/ui/sonner";
import { User, Star, BookOpen } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url: string | null;
}

interface UserReview {
  id: string;
  novel_id: string;
  rating: number;
  comment: string;
  created_at: string;
  novel: {
    title: string;
  };
}

const Profile = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [userReviews, setUserReviews] = useState<UserReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);

  // Redirect if not logged in
  if (!user && !isLoading) {
    return <Navigate to="/auth" replace />;
  }

  useEffect(() => {
    const fetchProfileAndReviews = async () => {
      if (user) {
        try {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .maybeSingle();

          if (profileError) throw profileError;
          
          if (profileData) {
            setProfile(profileData);
            setUsername(profileData.username || "");
            setAvatarUrl(profileData.avatar_url);
          }

          // Fetch user reviews
          const { data: reviewsData, error: reviewsError } = await supabase
            .from('reviews')
            .select(`
              *,
              novel:novel_id (
                title
              )
            `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

          if (reviewsError) throw reviewsError;
          setUserReviews(reviewsData || []);
          setReviewsLoading(false);

        } catch (error) {
          console.error("Error fetching profile or reviews:", error);
          toast.error("Could not load profile data");
        } finally {
          setIsProfileLoading(false);
        }
      }
    };

    fetchProfileAndReviews();
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error("Avatar image must be less than 2MB");
        return;
      }
      
      setAvatarFile(file);
      // Create temporary URL for preview
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  const uploadAvatar = async (): Promise<string | null> => {
    if (!avatarFile || !user) return avatarUrl;
    
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    try {
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to upload avatar image");
      return null;
    }
  };

  const saveProfile = async () => {
    if (!user || !profile) return;
    
    setIsSaving(true);
    try {
      // First upload avatar if changed
      let newAvatarUrl = avatarUrl;
      if (avatarFile) {
        newAvatarUrl = await uploadAvatar();
      }

      // Then update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username,
          avatar_url: newAvatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setProfile({
        ...profile,
        username,
        avatar_url: newAvatarUrl
      });
      
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const getUserInitials = () => {
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    return user?.email ? user.email.substring(0, 2).toUpperCase() : "??";
  };

  // Format date function
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (isLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="container max-w-4xl mx-auto pt-16 px-4">
          <div className="text-center text-gray-300">Loading profile...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container max-w-4xl mx-auto pt-16 px-4">
        <h1 className="text-3xl font-bold text-white mb-8 font-serif">Your Profile</h1>
        
        <div className="grid md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <Card className="bg-gray-900 border-gray-700 md:col-span-1">
            <CardHeader>
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="h-28 w-28 mb-4 bg-blue-900">
                    {avatarUrl ? (
                      <AvatarImage src={avatarUrl} alt="User avatar" />
                    ) : null}
                    <AvatarFallback className="text-2xl">{getUserInitials()}</AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="avatar-upload" 
                    className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 bg-black/50 flex items-center justify-center text-white cursor-pointer transition-opacity"
                  >
                    Change
                  </label>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="sr-only"
                  />
                </div>
                <CardTitle className="text-white text-xl mb-1">{username || "User"}</CardTitle>
                <CardDescription className="text-gray-400">{user?.email}</CardDescription>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-gray-300">Username</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-gray-300">Email</Label>
                <Input
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-800 border-gray-700 text-gray-400"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                onClick={saveProfile}
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>

          {/* User Reviews */}
          <Card className="bg-gray-900 border-gray-700 md:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <Star className="mr-2 h-5 w-5" />
                Your Reviews
              </CardTitle>
              <CardDescription className="text-gray-400">
                Reviews you've left for novels
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {reviewsLoading ? (
                <div className="text-center py-8 text-gray-400">Loading your reviews...</div>
              ) : userReviews.length > 0 ? (
                <div className="space-y-6">
                  {userReviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-700 pb-4 last:border-b-0">
                      <div className="flex items-center justify-between mb-2">
                        <button 
                          onClick={() => navigate(`/novel/${review.novel_id}`)}
                          className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {review.novel.title}
                        </button>
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
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 flex flex-col items-center">
                  <div className="p-4 rounded-full bg-gray-800 mb-4">
                    <Star className="h-8 w-8 text-gray-600" />
                  </div>
                  <p>You haven't written any reviews yet</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/search')}
                    className="mt-4 border-gray-700 text-gray-300 hover:bg-gray-800"
                  >
                    <BookOpen className="mr-2 h-4 w-4" />
                    Browse Novels
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
