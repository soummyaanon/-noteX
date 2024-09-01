import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles } from 'lucide-react';

const NoteXSimpleLoader = () => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => 
        prevProgress < 100 ? prevProgress + 1 : 0
      );
    }, 30);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
      <motion.div
        className="mb-8 text-white"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <FileText size={64} />
      </motion.div>
      
      <motion.h1
        className="text-4xl font-bold mb-2 text-white"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        noteX
      </motion.h1>
      
      <motion.p
        className="text-xl font-semibold mb-6 text-gray-300"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        powered by Gemini Pro
      </motion.p>
      
      <div className="w-64 h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>
      
      <motion.div
        className="mt-4 text-sm text-gray-400 flex items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Sparkles size={16} className="mr-2" />
        Initializing AI-powered notes...
      </motion.div>
    </div>
  );
};

export default NoteXSimpleLoader;