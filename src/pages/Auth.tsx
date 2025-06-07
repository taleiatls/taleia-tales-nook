
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { z } from "zod";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { secureSignIn, cleanupAuthState } from "@/utils/authCleanup";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  username: z.string().min(3, "Username must be at least 3 characters"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const { user, signUp, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("login");
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Register form state
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [username, setUsername] = useState("");
  
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (user && !isLoading) {
    return <Navigate to="/" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const result = loginSchema.safeParse({ email: loginEmail, password: loginPassword });
      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach(error => {
          errors[error.path[0]] = error.message;
        });
        setFormErrors(errors);
        return;
      }

      const { error } = await secureSignIn(supabase, loginEmail, loginPassword);
      if (error) {
        // Don't expose detailed error messages for security
        toast.error("Invalid email or password. Please try again.");
        console.error("Login error:", error);
      }
    } catch (error) {
      console.error("Login error:", error);
      toast.error("An error occurred during login. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    try {
      const result = registerSchema.safeParse({
        email: registerEmail,
        password: registerPassword,
        confirmPassword,
        username,
      });

      if (!result.success) {
        const errors: Record<string, string> = {};
        result.error.errors.forEach(error => {
          errors[error.path[0]] = error.message;
        });
        setFormErrors(errors);
        return;
      }

      // Clean up any existing auth state before registration
      cleanupAuthState();

      await signUp(registerEmail, registerPassword, username);
      setActiveTab("login");
      toast.success("Account created! Please check your email to confirm your registration.");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("An error occurred during registration. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      
      <div className="container max-w-md mx-auto pt-16 px-4">
        <div className="flex justify-center mb-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <BookOpen className="h-12 w-12 text-blue-400 mb-4" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 font-serif">TaleiaTLS</h1>
            <p className="text-gray-400">Access your account to read and review novels</p>
          </div>
        </div>

        <Card className="bg-gray-900 border-gray-700">
          <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
            <CardHeader>
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger value="login" className="data-[state=active]:bg-blue-600">Login</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-blue-600">Register</TabsTrigger>
              </TabsList>
            </CardHeader>
            
            <CardContent>
              <TabsContent value="login" className="mt-0">
                <form onSubmit={handleLogin}>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-gray-300">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="you@example.com"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="email"
                      />
                      {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="login-password" className="text-gray-300">Password</Label>
                      </div>
                      <Input
                        id="login-password"
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="current-password"
                      />
                      {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                    </div>
                  </div>
                  
                  <CardFooter className="px-0 pt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Signing In..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
              
              <TabsContent value="register" className="mt-0">
                <form onSubmit={handleRegister}>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="username" className="text-gray-300">Username</Label>
                      <Input
                        id="username"
                        placeholder="coolreader123"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="username"
                      />
                      {formErrors.username && <p className="text-sm text-red-500">{formErrors.username}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-email" className="text-gray-300">Email</Label>
                      <Input
                        id="register-email"
                        type="email"
                        placeholder="you@example.com"
                        value={registerEmail}
                        onChange={(e) => setRegisterEmail(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="email"
                      />
                      {formErrors.email && <p className="text-sm text-red-500">{formErrors.email}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="register-password" className="text-gray-300">Password</Label>
                      <Input
                        id="register-password"
                        type="password"
                        placeholder="••••••••"
                        value={registerPassword}
                        onChange={(e) => setRegisterPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="new-password"
                      />
                      {formErrors.password && <p className="text-sm text-red-500">{formErrors.password}</p>}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-gray-300">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="bg-gray-800 border-gray-700 text-white"
                        autoComplete="new-password"
                      />
                      {formErrors.confirmPassword && <p className="text-sm text-red-500">{formErrors.confirmPassword}</p>}
                    </div>
                  </div>
                  
                  <CardFooter className="px-0 pt-6">
                    <Button 
                      type="submit" 
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating Account..." : "Create Account"}
                    </Button>
                  </CardFooter>
                </form>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
