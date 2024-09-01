import React, { useMemo, useEffect, useState, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { logout, getProfileImage } from '../../Services/appwrite';
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { ModeToggle } from "../ui/mode-toggle";
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Progress } from "../ui/progress";
import Logo from '../Logo/Logo';
import { FiHome, FiLogIn, FiFileText, FiPlusSquare } from 'react-icons/fi'; // Import icons

const Header = React.memo(({ user, setUser }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const fetchProfileImage = useCallback(async () => {
    if (user?.profileImageId) {
      try {
        const imageUrl = await getProfileImage(user.profileImageId);
        setProfileImageUrl(imageUrl);
      } catch (error) {
        console.error('Error fetching profile image:', error);
      }
    } else {
      setProfileImageUrl(null);
    }
  }, [user]);

  useEffect(() => {
    fetchProfileImage();
  }, [fetchProfileImage, user]);

  useEffect(() => {
    setLoading(true);
    setLoadingProgress(0);
    const timer = setInterval(() => {
      setLoadingProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer);
          setLoading(false);
          return 100;
        }
        const diff = Math.random() * 20; // Increase the increment
        return Math.min(oldProgress + diff, 100);
      });
    }, 50); // Reduce the interval duration
    return () => clearInterval(timer);
  }, [location]);

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true);
      await logout();
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setLoading(false);
    }
  }, [navigate, setUser]);

  const NavItem = useCallback(({ to, icon }) => (
    <Link to={to} className="relative group">
      <Button variant="ghost" className="text-base font-medium">
        {icon}
      </Button>
      <motion.div
        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
        initial={{ scaleX: 0 }}
        animate={{ scaleX: location.pathname === to ? 1 : 0 }}
        transition={{ duration: 0.2 }}
      />
    </Link>
  ), [location.pathname]);

  const menuItems = useMemo(() => (
    <>
      <NavItem to="/" icon={<FiHome />} />
      {user ? (
        <>
          <NavItem to="/notes" icon={<FiFileText />} />
          <NavItem to="/new-note" icon={<FiPlusSquare />} />
        </>
      ) : (
        <NavItem to="/login" icon={<FiLogIn />} />
      )}
    </>
  ), [user, NavItem]);

  return (
    <header className="sticky top-0 backdrop-blur-lg bg-background/80 shadow-lg rounded-b-lg z-50">
      {loading && (
        <Progress value={loadingProgress} className="h-1 w-full absolute top-0 left-0 z-50" />
      )}
      <nav className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <Logo />
        </Link>
        
        <div className="hidden md:flex items-center space-x-4">
          {menuItems}
          <ModeToggle />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={profileImageUrl} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <ModeToggle />
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/80 backdrop-blur-lg shadow-lg py-2"
          >
            <div className="container mx-auto px-2 flex flex-col space-y-2">
              {menuItems}
              {user && (
                <>
                  <Button variant="ghost" size="sm" onClick={() => navigate('/profile')}>Profile</Button>
                  <Button variant="ghost" size="sm" onClick={handleLogout}>Logout</Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
});

export default Header;