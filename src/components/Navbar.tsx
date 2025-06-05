
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Search, 
  Menu, 
  BookOpen, 
  Home, 
  LogIn,
  LogOut,
  User,
  Settings
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
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "Browse", href: "/search", icon: Search },
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
            <BookOpen className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white font-serif">TaleiaTLS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-1 text-gray-300 hover:text-blue-400 transition-colors"
              >
                <item.icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            ))}

            {/* Reading Settings Menu */}
            {user && (
              <Menubar className="bg-transparent border-none">
                <MenubarMenu>
                  <MenubarTrigger className="text-gray-300 hover:text-blue-400 transition-colors cursor-pointer">
                    <Settings className="h-4 w-4 mr-1" />
                    Reading
                  </MenubarTrigger>
                  <MenubarContent className="bg-gray-900 border-gray-700 text-gray-300">
                    <MenubarItem onClick={() => navigate("/settings")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Reading Settings
                    </MenubarItem>
                    <MenubarSeparator className="bg-gray-700" />
                    <MenubarItem onClick={() => navigate("/store")}>
                      Store
                    </MenubarItem>
                  </MenubarContent>
                </MenubarMenu>
              </Menubar>
            )}
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
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center space-x-3 text-gray-300 hover:text-blue-400 transition-colors p-2 rounded-lg hover:bg-gray-900"
                      onClick={() => setIsOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-lg">{item.name}</span>
                    </Link>
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
