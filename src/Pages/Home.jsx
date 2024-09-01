import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../Components/ui/card";
import { Pencil, Users, Lock, Zap, FileText, Search, Star } from 'lucide-react';
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import AuroraBackground from "../Components/ui/aurora-background";
import { FlipWords } from "../Components/ui/flip-words";
import { getCurrentUser } from '../Services/appwrite';
import { Cover } from "../Components/ui/cover";

const FeatureIcon = React.memo(({ Icon }) => (
  <div className="rounded-full bg-primary/10 p-2 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
    <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" aria-hidden="true" />
  </div>
));

const features = [
  { title: "Create Note", description: "Start a new note or document", Icon: Pencil },
  { title: "Recent Notes", description: "Access your latest work", Icon: FileText },
  { title: "Search", description: "Find notes quickly", Icon: Search },
  { title: "Collaborate", description: "Invite others to your notes", Icon: Users },
  { title: "Favorites", description: "Access your starred notes", Icon: Star },
  { title: "Smart AI", description: "Get AI-powered suggestions", Icon: Zap },
];

const notLoggedInFeatures = [
  { title: "Collaborative Note-Taking", description: "Work together in real-time", Icon: Users },
  { title: "Smart Organization", description: "Keep your thoughts in order", Icon: Zap },
  { title: "Secure and Private", description: "Your data, your control", Icon: Lock }
];

const loggedInWords = [
  "Boost productivity",
  "Collaborate seamlessly",
  "Organize thoughts",
  "AI-powered assistance",
  "Secure your ideas",
  "Access anywhere"
];

const notLoggedInWords = [
  "Organize your thoughts",
  "Secure your notes",
  "AI-powered assistance",
  "Smart Semantic Search",
  "Your notes, your way",
  "Enhanced productivity",
  "Seamless experience",
  "Innovative features"
];

const FeatureCard = React.memo(({ feature, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    className="bg-white/5 rounded-lg p-3 sm:p-4 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
    onClick={onClick}
  >
    <div className="flex items-center space-x-3">
      <div className="rounded-full bg-primary/20 p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
        <feature.Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary group-hover:text-white transition-colors" aria-hidden="true" />
      </div>
      <div>
        <h3 className="font-semibold text-sm sm:text-base text-gray-200 group-hover:text-white transition-colors">{feature.title}</h3>
        <p className="text-xs sm:text-sm text-gray-400 group-hover:text-gray-200 transition-colors">{feature.description}</p>
      </div>
    </div>
  </motion.div>
));

const HomePage = () => {
  const [authState, setAuthState] = useState({ isLoggedIn: false, isLoading: true, userName: '' });
  const navigate = useNavigate();

  const checkLoginStatus = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setAuthState({ 
        isLoggedIn: !!user, 
        isLoading: false, 
        userName: user ? user.name : '' 
      });
    } catch (error) {
      console.error('Failed to authenticate', error);
      setAuthState({ isLoggedIn: false, isLoading: false, userName: '' });
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, [checkLoginStatus]);

  const handleNavigation = useCallback((path) => () => navigate(path), [navigate]);

  const renderLoggedInContent = useCallback(() => (
    <div className="space-y-4 sm:space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {features.map((feature) => (
          <FeatureCard 
            key={feature.title} 
            feature={feature} 
            onClick={feature.title === "Create Note" ? handleNavigation('/new-note') : undefined}
          />
        ))}
      </div>
      <div className="mt-6 sm:mt-8 text-center">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-2">Ready to boost your productivity?</h2>
        <p className="text-sm sm:text-base text-gray-400 mb-4">Start by creating a new note or accessing your recent work.</p>
        <Button onClick={handleNavigation('/new-note')} size="lg" className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
          <Pencil className="mr-2 h-4 w-4 transition-transform group-hover:rotate-45" aria-hidden="true" />
          Create New Note
        </Button>
      </div>
    </div>
  ), [handleNavigation]);

  const renderNotLoggedInContent = useCallback(() => (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {notLoggedInFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="flex flex-col items-center text-center space-y-2 group"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <FeatureIcon Icon={feature.Icon} />
            <h3 className="font-semibold text-sm sm:text-base group-hover:text-white transition-colors">{feature.title}</h3>
            <p className="text-xs sm:text-sm text-muted-foreground group-hover:text-gray-300 transition-colors">{feature.description}</p>
          </motion.div>
        ))}
      </div>
      <div className="flex justify-center">
        <Button onClick={handleNavigation('/login')} size="lg" className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105">
          Get Started
          <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
        </Button>
      </div>
    </div>
  ), [handleNavigation]);

  return (
    <AuroraBackground>
      <AnimatePresence>
        {authState.isLoading ? (
          <motion.div
            key="loader"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn("min-h-screen flex items-center justify-center")}
          >
            <div className="loader text-lg sm:text-xl" aria-live="polite">Loading...</div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={cn("min-h-screen flex items-center justify-center p-4")}
          >
            <Card className={cn("w-full max-w-4xl bg-black/10 backdrop-blur-lg shadow-xl")}>
              <CardHeader>
                <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold text-center bg-gradient-to-r from-blue-500 to-purple-500 text-transparent bg-clip-text">
                  <Cover>
                    {authState.isLoggedIn ? `Welcome back, ${authState.userName}!` : "Welcome to noteX"}
                  </Cover>
                </CardTitle>
                <FlipWords
                  words={authState.isLoggedIn ? loggedInWords : notLoggedInWords}
                  duration={3000}
                  className="text-lg sm:text-xl md:text-2xl font-semibold text-center mt-4 text-gray-200 font-suse"
                />
              </CardHeader>
              <CardContent>
                {authState.isLoggedIn ? renderLoggedInContent() : renderNotLoggedInContent()}
              </CardContent>
              <CardFooter className="justify-center mt-4 sm:mt-6">
                <p className="text-xs sm:text-sm text-gray-400">Discover the power of collaborative note-taking with noteX</p>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </AuroraBackground>
  );
};

export default HomePage;