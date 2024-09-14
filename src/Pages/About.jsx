import React from 'react';
import { motion } from 'framer-motion';
import { TextGenerateEffectDemo } from '../Components/ui/Abouttext';
import { FaLinkedin, FaInstagram, FaGlobe, FaFileAlt, FaDiscord, FaGithub } from 'react-icons/fa';
import { useTheme } from 'next-themes';

const About = () => {
  const githubUsername = 'soummyaanon';
  const { theme } = useTheme();

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const featuredPlatforms = [
    {
      name: 'Product Hunt',
      href: 'https://www.producthunt.com/posts/notex-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-notex&#0045;2',
      image: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=487462&theme=dark'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black text-gray-800 dark:text-white transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="max-w-3xl mx-auto"
        >
          <h1 className="text-4xl font-bold font-Orbitron mb-6 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">About NoteX</h1>
          <div className="text-center text-lg">
            <TextGenerateEffectDemo />
          </div>
        </motion.section>
        
        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold mb-6 font-Orbitron text-center">Meet the Creator</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8">
              <img
                src={`https://github.com/${githubUsername}.png`}
                alt="Profile"
                className="w-40 h-40 rounded-full border-4 border-blue-500 shadow-lg"
              />
              <div className="flex flex-col items-center sm:items-start">
                <h3 className="text-2xl font-bold font-Orbitron mb-2">Soumyaranjan Panda</h3>
                <p className="text-gray-600  dark:text-gray-400 mb-4 font-semibold font-Orbitron   ">Fullstack Developer / Tech Enthusiast</p>
                <div className="flex space-x-4 mb-6">
                  <SocialLink href="https://github.com/soummyaanon" icon={<FaGithub />} label="GitHub" />
                  <SocialLink href="https://www.linkedin.com/in/soumyaranjan-panda-33496a179/" icon={<FaLinkedin />} label="LinkedIn" />
                  <SocialLink href="https://www.instagram.com/anonymous__warior/" icon={<FaInstagram />} label="Instagram" />
                  <SocialLink href="https://soumya-ranjan.tech/" icon={<FaGlobe />} label="Portfolio" />
                  <SocialLink href="https://drive.google.com/file/d/1tO0jIv9wThvdWw6v-ANUkygzPX9HdsJJ/view?usp=share_link" icon={<FaFileAlt />} label="Resume" />
                </div>
                <a
                  href="https://discord.gg/wvmnHCHM" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-blue-700 transition duration-300 transform hover:scale-105 flex items-center shadow-lg hover:shadow-xl"
                >
                  <FaDiscord className="mr-2  " />
                  <p className='font-thin text-sm font-Orbitron' >
                  Contact Me on Discord
                  </p>
              
                </a>
              </div>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="max-w-3xl mx-auto"
        >
          <h2 className="text-3xl font-bold font-Orbitron mb-6 text-center">Featured On</h2>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-wrap justify-center gap-6">
              {featuredPlatforms.map((platform, index) => (
                <a 
                  key={index}
                  href={platform.href} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="transform hover:scale-105 transition duration-300"
                >
                  <img 
                    src={platform.image} 
                    alt={`${platform.name} - Discover the power of AI-powered note-taking with noteX`} 
                    className="h-14"
                  />
                </a>
              ))}
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

const SocialLink = ({ href, icon, label }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition duration-300 transform hover:scale-110"
      aria-label={label}
    >
      {React.cloneElement(icon, { size: 28 })}
    </a>
  );
};

export default About;