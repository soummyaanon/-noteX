'use client'

import React, { useEffect, useState } from 'react'
import { motion, useMotionValue, useTransform, useAnimation } from 'framer-motion'
import { TextGenerateEffectDemo } from '../Components/ui/Abouttext'
import { FaLinkedin, FaInstagram, FaGlobe, FaFileAlt, FaDiscord, FaGithub, FaStar } from 'react-icons/fa'
import { useTheme } from 'next-themes'

const About = () => {
  const githubUsername = 'soummyaanon'
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const sectionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  }

  const featuredPlatforms = [
    {
      name: 'Product Hunt',
      href: 'https://www.producthunt.com/posts/notex-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-notex&#0045;2',
      image: 'https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=487462&theme=dark'
    },
    {
      name: 'Top Free AI Tools',
      href: 'https://topfreeaitools.com/ai/notex',
      image: 'https://ff65dcf08ebd5eb1c022b44dd88016ac.cdn.bubble.io/f1724746116087x632750678197528400/badge%20white.png?_gl=1*1wvcbnr*_gcl_au*MTg3MzI0ODMyLjE3MjE2MjAzNjA.*_ga*NTIyODE4MzEyLjE3MDU5OTg0MTc.*_ga_BFPVR2DEE2*MTcyNDc0NTM2OS4yMjkuMS4xNzI0NzQ2MjY2LjYwLjAuMA..'
    },
    {
      name: 'AIPURE AI',
      href: 'https://aipure.ai/products/notex',
      image: 'https://via.placeholder.com/230x54.png?text=AIPURE+AI'
    },
    {
      name: 'Peerlist',
      href: 'https://peerlist.io/somyaranjan/project/notex',
      image: 'https://peerlist.io/images/Launch_Badge_Dark.svg'
    },
    {
      name: 'Product Hunt Top Post',
      href: 'https://www.producthunt.com/posts/notex-2?embed=true&utm_source=badge-top-post-topic-badge&utm_medium=badge&utm_souce=badge-notex&#0045;2',
      image: 'https://api.producthunt.com/widgets/embed-image/v1/top-post-topic-badge.svg?post_id=487462&theme=light&period=weekly&topic_id=237',
      width: 250,
      height: 54
    }
  ]

  if (!mounted) return null

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0d1117]' : 'bg-gray-100'} text-gray-800 dark:text-white transition-colors duration-300`}>
      <div className="container mx-auto px-4 py-16 space-y-24">
        <motion.section 
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-6xl font-bold font-Orbitron mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">About noteX</h1>
          <div className="text-center text-xl">
            <TextGenerateEffectDemo />
          </div>
        </motion.section>
        
        <CreatorCard githubUsername={githubUsername} />

        <motion.section
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl font-bold mb-12 font-Orbitron text-center text-indigo-700 dark:text-indigo-300">Featured On</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {featuredPlatforms.map((platform, index) => (
              <motion.a 
                key={index}
                href={platform.href} 
                target="_blank" 
                rel="noopener noreferrer"
                className="transform hover:scale-105 transition duration-300"
                whileHover={{ y: -5 }}
              >
                <img 
                  src={platform.image} 
                  alt={`${platform.name} - Discover the power of AI-powered note-taking with noteX`} 
                  width={platform.width}
                  height={platform.height}
                  className="h-12 w-auto object-contain rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                />
              </motion.a>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  )
}

const CreatorCard = ({ githubUsername }) => {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotateX = useTransform(y, [-100, 100], [30, -30])
  const rotateY = useTransform(x, [-100, 100], [-30, 30])

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = event.clientX - rect.left
    const mouseY = event.clientY - rect.top
    const xPct = (mouseX / width - 0.5) * 2
    const yPct = (mouseY / height - 0.5) * 2
    x.set(xPct * 100)
    y.set(yPct * 100)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
      }}
      className="max-w-4xl mx-auto"
    >
      <h2 className="text-4xl font-bold mb-12 font-Orbitron text-center text-indigo-700 dark:text-indigo-300">Meet the Creator</h2>
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl hover:shadow-3xl transition-shadow duration-300 cursor-pointer"
      >
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8" style={{ transform: "translateZ(75px)" }}>
          <img
            src={`https://github.com/${githubUsername}.png`}
            alt="Profile"
            className="w-48 h-48 rounded-full border-4 border-indigo-500 shadow-lg"
          />
          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-3xl font-bold font-Orbitron mb-3 text-indigo-700 dark:text-indigo-300">Soumyaranjan Panda</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-5 font-semibold font-Orbitron">Fullstack Developer / Tech Enthusiast</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
              <SocialLink href="https://github.com/soummyaanon" icon={<FaGithub />} label="GitHub" />
              <SocialLink href="https://www.linkedin.com/in/soumyaranjan-panda-33496a179/" icon={<FaLinkedin />} label="LinkedIn" />
              <SocialLink href="https://www.instagram.com/anonymous__warior/" icon={<FaInstagram />} label="Instagram" />
              <SocialLink href="https://soumya-ranjan.tech/" icon={<FaGlobe />} label="Portfolio" />
              <SocialLink href="https://drive.google.com/file/d/1tO0jIv9wThvdWw6v-ANUkygzPX9HdsJJ/view?usp=share_link" icon={<FaFileAlt />} label="Resume" />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.a
                href="https://discord.gg/wvmnHCHM" 
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-indigo-700 transition duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FaDiscord className="mr-2" />
                <p className='font-thin text-sm font-Orbitron'>
                  Contact Me on Discord
                </p>
              </motion.a>
              <GiveStarButton username={githubUsername} />
            </div>
          </div>
        </div>
      </motion.div>
    </motion.section>
  )
}

const SocialLink = ({ href, icon, label }) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition duration-300"
      aria-label={label}
      whileHover={{ scale: 1.2 }}
      whileTap={{ scale: 0.9 }}
    >
      {React.cloneElement(icon, { size: 32 })}
    </motion.a>
  )
}

const GiveStarButton = ({ username }) => {
  const controls = useAnimation()

  useEffect(() => {
    controls.start({
      rotate: [0, 360],
      transition: { duration: 2, repeat: Infinity, ease: "linear" }
    })
  }, [controls])

  return (
    <motion.a
      href={`https://github.com/soummyaanon/-noteX`}
      target="_blank"
      rel="noopener noreferrer"
      className="bg-yellow-400 text-gray-900 px-6 py-3 rounded-full font-semibold hover:bg-yellow-500 transition duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div animate={controls}>
        <FaStar className="mr-2 text-xl" />
      </motion.div>
      <p className='font-semibold text-sm font-Orbitron'>
        Give Me A Star
      </p>
    </motion.a>
  )
}

export default About