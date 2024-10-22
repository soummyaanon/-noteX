import React, { useState, useEffect } from 'react';
import { PuffLoader } from 'react-spinners';
import { Progress } from "../ui/progress";

const NoteXSimpleLoader = () => {
  const [progress, setProgress] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) =>
        prevProgress < 100 ? prevProgress + 1 : 0
      );
    }, 300);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDarkMode(mediaQuery.matches);
    const handleChange = (e) => setIsDarkMode(e.matches);
    mediaQuery.addListener(handleChange);

    return () => {
      clearInterval(timer);
      mediaQuery.removeListener(handleChange);
    };
  }, []);

  const bgColor = isDarkMode ? 'bg-black' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-black';
  const subTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-600';

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen ${bgColor} p-4 transition-colors duration-300`}>
      <h1 className={`text-4xl font-bold mb-2 ${textColor}`}>
        noteX
      </h1>

      <PuffLoader color={isDarkMode ? "#ffffff" : "#000000"} size={60} />
      <div className="w-64 mt-6">
        <Progress value={progress} className="w-full" />
      </div>
      <p className={`mt-4 text-sm ${subTextColor}`}>
        Initializing AI-powered notes... {progress}%
      </p>
    </div>
  );
};

export default NoteXSimpleLoader;