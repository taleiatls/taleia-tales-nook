
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Menu, 
  Home, 
  LogIn,
  LogOut,
  User,
  Settings,
  Coins
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        const { data } = await supabase.rpc('is_super_admin', {
          check_user_id: user.id
        });
        setIsAdmin(data || false);
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleStoreClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/store");
    }
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/search", icon: Search },
    { name: "Store", href: "/store", icon: Coins, onClick: handleStoreClick },
    ...(isAdmin ? [{ name: "Admin", href: "/admin", icon: Settings }] : []),
  ];

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user) return "??";
    // Try to get from metadata if available
    const username = user.user_metadata?.username;
    if (username) {
      return username.substring(0, 2).toUpperCase();
    }
    // Fallback to email
    return user.email ? user.email.substring(0, 2).toUpperCase() : "??";
  };

  return (
    <nav className="bg-black/80 backdrop-blur-md border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/ff222b8a-1c63-4a30-92ca-ee02bd543023.png" 
              alt="TaleiaTLS Logo" 
              className="h-8 w-8"
            />
            <span className="text-2xl font-bold text-white font-serif">TaleiaTLS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              item.onClick ? (
                <button
                  key={item.name}
                  onClick={item.onClick}
                  className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </button>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              )
            ))}
          </div>

          {/* Auth Buttons / User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {!user ? (
              <Link to="/auth">
                <Button variant="outline" size="sm" className="text-gray-300 border-gray-600 hover:bg-gray-800">
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8 bg-blue-900">
                      <AvatarFallback>{getUserInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-gray-900 border-gray-700 text-gray-300" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-white">{user.user_metadata?.username || "User"}</p>
                      <p className="text-xs leading-none text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 cursor-pointer" 
                    onClick={() => navigate("/profile")}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 cursor-pointer"
                    onClick={() => navigate("/settings")}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Reading Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-gray-700" />
                  <DropdownMenuItem 
                    className="hover:bg-gray-800 text-red-400 hover:text-red-300 cursor-pointer" 
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 bg-black border-gray-800">
                <div className="flex flex-col space-y-4 mt-8">
                  {navItems.map((item) => (
                    item.onClick ? (
                      <button
                        key={item.name}
                        onClick={() => {
                          item.onClick();
                          setIsOpen(false);
                        }}
                        className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-900"
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-lg">{item.name}</span>
                      </button>
                    ) : (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-900"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-lg">{item.name}</span>
                      </Link>
                    )
                  ))}
                  
                  {/* Mobile Auth Links */}
                  {!user ? (
                    <Link
                      to="/auth"
                      className="flex items-center space-x-3 text-blue-400 hover:text-blue-300 transition-colors p-2 rounded-lg hover:bg-gray-900"
                      onClick={() => setIsOpen(false)}
                    >
                      <LogIn className="h-5 w-5" />
                      <span className="text-lg">Sign In</span>
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/profile"
                        className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-900"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="h-5 w-5" />
                        <span className="text-lg">Profile</span>
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-900"
                        onClick={() => setIsOpen(false)}
                      >
                        <Settings className="h-5 w-5" />
                        <span className="text-lg">Reading Settings</span>
                      </Link>
                      <div
                        className="flex items-center space-x-3 text-red-400 hover:text-red-300 transition-colors p-2 rounded-lg hover:bg-gray-900 cursor-pointer"
                        onClick={() => {
                          handleSignOut();
                          setIsOpen(false);
                        }}
                      >
                        <LogOut className="h-5 w-5" />
                        <span className="text-lg">Log Out</span>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
