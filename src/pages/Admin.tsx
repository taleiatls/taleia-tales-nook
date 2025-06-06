
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Users, BookOpen, FileText, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import NovelManagement from "@/components/admin/NovelManagement";
import ChapterManagement from "@/components/admin/ChapterManagement";
import UserManagement from "@/components/admin/UserManagement";
import SEOManagement from "@/components/admin/SEOManagement";

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAccess = async () => {
      console.log("Checking admin access for user:", user?.id);
      
      if (!user) {
        console.log("No user found, redirecting to auth");
        navigate("/auth");
        return;
      }

      try {
        console.log("Calling is_super_admin function...");
        const { data, error } = await supabase.rpc('is_super_admin', {
          check_user_id: user.id
        });

        console.log("is_super_admin result:", { data, error });

        if (error) {
          console.error("Error checking admin access:", error);
          navigate("/");
          return;
        }

        if (!data) {
          console.log("User is not a super admin");
          navigate("/");
          return;
        }

        console.log("User is a super admin, setting access");
        setIsAdmin(true);
      } catch (error) {
        console.error("Error in checkAdminAccess:", error);
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    checkAdminAccess();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-black">
        <Navbar />
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-gray-300">
          <p>Access denied. Super admin privileges required.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-2 flex items-center">
            <Shield className="mr-3 h-8 w-8 text-blue-400" />
            Admin Dashboard
          </h1>
          <p className="text-gray-400">Manage novels, chapters, users, and SEO</p>
        </div>

        <Tabs defaultValue="novels" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="novels" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Novels
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Chapters
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users
            </TabsTrigger>
            <TabsTrigger value="seo" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO
            </TabsTrigger>
          </TabsList>

          <TabsContent value="novels">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Novel Management</CardTitle>
              </CardHeader>
              <CardContent>
                <NovelManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chapters">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">Chapter Management</CardTitle>
              </CardHeader>
              <CardContent>
                <ChapterManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">User Management</CardTitle>
              </CardHeader>
              <CardContent>
                <UserManagement />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-100">SEO Management</CardTitle>
              </CardHeader>
              <CardContent>
                <SEOManagement />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
