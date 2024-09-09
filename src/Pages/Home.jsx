import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "../Components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../Components/ui/card";
import { Pencil, Bot, Lock, Share2, Zap, FileText, Search, Star } from 'lucide-react';
import { cn } from "../lib/utils";
import { motion, AnimatePresence } from 'framer-motion';
import AuroraBackground from "../Components/ui/aurora-background";
import { FlipWords } from "../Components/ui/flip-words";
import { getCurrentUser } from '../Services/appwrite';
import { Cover } from "../Components/ui/cover";
import { PulseLoader } from 'react-spinners';
import { BorderBeam } from "../Components/magicui/border-beam";

const FeatureIcon = React.memo(({ Icon }) => (
  <motion.div
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="rounded-full bg-gradient-to-br from-primary/20 to-primary/30 p-2 w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center"
  >
    <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" aria-hidden="true" />
  </motion.div>
));

const features = [
  { title: "noteX Bot", description: "AI-powered by Gemini Pro", Icon: Bot },
  { title: "Create Note", description: "Start fresh, write now", Icon: Pencil },
  { title: "Recent Notes", description: "Your latest work at a glance", Icon: FileText },
  { title: "Search", description: "Find anything instantly", Icon: Search },
  { title: "Favorites", description: "Your top notes, one click away", Icon: Star },
  { title: "Share Your Note", description: "Effortless sharing", Icon: Share2 },
];

const notLoggedInFeatures = [
  { title: "noteX Bot", description: "AI assistance at your service", Icon: Bot },
  { title: "Smart Organization", description: "Keep thoughts in order", Icon: Zap },
  { title: "Secure and Private", description: "Your data, your control", Icon: Lock }
];

const loggedInWords = [
  "Boost productivity",
  "Get AI-powered assistance",
  "Organize thoughts",
  "Gemini Pro insights",
  "Secure your ideas",
  "Access anywhere"
];

const notLoggedInWords = [
  "Organize your thoughts",
  "Secure your notes",
  "Gemini Pro assistance",
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
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.3 }}
    className="relative bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-3 sm:p-4 hover:from-blue-800/40 hover:to-purple-800/40 transition-all duration-300 cursor-pointer group backdrop-blur-md h-full"
    onClick={onClick}
  >
    <BorderBeam
      duration={3}
      rgb="0,255,255"
      className="absolute inset-0 z-0 rounded-lg opacity-50"
    />
    <div className="relative z-10 flex items-center space-x-2 sm:space-x-3">
      <FeatureIcon Icon={feature.Icon} />
      <div>
        <h3 className="font-semibold text-xs sm:text-sm text-gray-200 group-hover:text-white transition-colors">{feature.title}</h3>
        <p className="text-xs text-gray-400 group-hover:text-gray-200 transition-colors hidden sm:block">{feature.description}</p>
      </div>
    </div>
  </motion.div>
));

export default function HomePage() {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-6"
    >
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <FeatureCard 
              feature={feature} 
              onClick={feature.title === "Create Note" ? handleNavigation('/new-note') : undefined}
            />
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4 sm:mt-8 text-center"
      >
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-200 mb-2 sm:mb-3">Ready to boost your productivity?</h2>
        <p className="text-sm sm:text-lg text-gray-300 mb-3 sm:mb-5">Start by creating a new note or accessing your recent work.</p>
        <Button
          onClick={handleNavigation('/new-note')}
          size="lg"
          className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          <motion.span
            className="flex items-center justify-center"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Pencil className="mr-2 h-4 w-4 sm:h-5 sm:w-5 transition-transform group-hover:rotate-45" aria-hidden="true" />
            Create New Note
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
  ), [handleNavigation]);

  const renderNotLoggedInContent = useCallback(() => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 sm:space-y-8"
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4">
        {notLoggedInFeatures.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <FeatureCard feature={feature} />
          </motion.div>
        ))}
      </div>
      <motion.div
        className="flex flex-col items-center justify-center space-y-4 sm:space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-sm sm:text-xl text-center text-gray-200 max-w-2xl">
          Experience the future of note-taking with AI-powered insights and the noteX Assistance Bot.
        </p>
        <Button
          onClick={handleNavigation('/login')}
          size="lg"
          className="group bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 w-full sm:w-auto"
        >
          <motion.span
            className="flex items-center justify-center text-base sm:text-lg"
            whileHover={{ x: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            Get Started
            <span className="ml-2 transition-transform group-hover:translate-x-1" aria-hidden="true">→</span>
          </motion.span>
        </Button>
      </motion.div>
    </motion.div>
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
            <PulseLoader color="#4F46E5" size={15} margin={2} />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className={cn("min-h-screen flex items-center justify-center p-2 sm:p-4")}
          >
            <div className="relative w-full max-w-5xl">
              <Card className={cn("w-full bg-blue-900/20 backdrop-blur-lg shadow-xl relative z-10 overflow-hidden")}>
                <CardHeader className="pb-4 sm:pb-6">
                  <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-light font-Orbitron text-center bg-gradient-to-r from-blue-400 to-purple-400 text-transparent bg-clip-text">
                    <Cover>
                      {authState.isLoggedIn ? `Welcome back, ${authState.userName}!` : "Welcome to noteX"}
                    </Cover>
                  </CardTitle>
                  <FlipWords
                    words={authState.isLoggedIn ? loggedInWords : notLoggedInWords}
                    duration={3000}
                    className="text-base sm:text-lg md:text-xl font-light text-center mt-2 sm:mt-4 text-gray-200 font-Orbitron"
                  />
                </CardHeader>
                <CardContent>
                  {authState.isLoggedIn ? renderLoggedInContent() : renderNotLoggedInContent()}
                </CardContent>
                <CardFooter className="justify-center mt-4 sm:mt-6">
                  <p className="text-xs sm:text-sm text-gray-400">Discover the power of AI-powered note-taking with noteX</p>
                </CardFooter>
              </Card>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuroraBackground>
  );
}