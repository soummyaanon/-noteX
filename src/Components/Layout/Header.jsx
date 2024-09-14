import React, { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { logout, getProfileImage } from '../../Services/appwrite'
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { ModeToggle } from "../ui/mode-toggle"
import { Menu } from "lucide-react"
import { Progress } from "../ui/progress"
import Logo from '../Logo/Logo'
import { FiHome, FiLogIn, FiFileText, FiPlusSquare, FiUser, FiLogOut, FiInfo } from 'react-icons/fi'
import { motion, AnimatePresence } from 'framer-motion'

export default function Component({ user, setUser }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [profileImageUrl, setProfileImageUrl] = useState(null)
  const [loading, setLoading] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [loadingProgress, setLoadingProgress] = useState(0)

  const fetchProfileImage = useCallback(async () => {
    if (user?.profileImageId) {
      try {
        const imageUrl = await getProfileImage(user.profileImageId)
        setProfileImageUrl(imageUrl)
      } catch (error) {
        console.error('Error fetching profile image:', error)
      }
    } else {
      setProfileImageUrl(null)
    }
  }, [user])

  useEffect(() => {
    fetchProfileImage()
    const refreshInterval = setInterval(fetchProfileImage, 1000) // Refresh every 5 seconds
    return () => clearInterval(refreshInterval)
  }, [fetchProfileImage])

  useEffect(() => {
    setLoading(true)
    setLoadingProgress(0)
    const timer = setInterval(() => {
      setLoadingProgress((oldProgress) => {
        if (oldProgress === 100) {
          clearInterval(timer)
          setLoading(false)
          return 100
        }
        const diff = Math.random() * 20
        return Math.min(oldProgress + diff, 100)
      })
    }, 50)
    return () => clearInterval(timer)
  }, [location])

  const handleLogout = useCallback(async () => {
    try {
      setLoading(true)
      await logout()
      setUser(null)
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setLoading(false)
    }
  }, [navigate, setUser])

  const NavItem = useCallback(({ to, icon: Icon, label }) => (
    <Link to={to} className="relative group flex flex-col items-center">
      <Button variant="ghost" size="icon" className="relative">
        <Icon className="h-5 w-5" />
        <span className="sr-only">{label}</span>
        <motion.div
          className="absolute -bottom-1 left-0 right-0 h-0.5 bg-primary origin-left"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: location.pathname === to ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </Button>
      <span className="text-xs mt-1 hidden md:inline">{label}</span>
    </Link>
  ), [location.pathname])

  const navItems = (
    <>
      <NavItem to="/" icon={FiHome} label="Home" />
      {user ? (
        <>
          <NavItem to="/notes" icon={FiFileText} label="Notes" />
          <NavItem to="/new-note" icon={FiPlusSquare} label="New" />
        </>
      ) : (
        <NavItem to="/login" icon={FiLogIn} label="Login" />
      )}
    </>
  )

  return (
    <header className="sticky top-0 z-50">
      {loading && (
        <Progress value={loadingProgress} className="h-1 w-full absolute top-0 left-0 z-50" />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-full blur-3xl"></div>
      <nav className="relative container mx-auto px-4 py-2">
        <div className="flex items-center justify-between bg-background/30 backdrop-blur-md rounded-full p-2 shadow-lg">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <Logo />
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            {navItems}
          </div>

          <div className="flex items-center space-x-2">
            <ModeToggle />
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative h-8 w-8 rounded-full overflow-hidden">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profileImageUrl} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/40 to-secondary/40 mix-blend-overlay"></div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <FiUser className="mr-2 h-4 w-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/about')}>
                    <FiInfo className="mr-2 h-4 w-4" />
                    About
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <FiLogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="ghost" size="icon" className="md:hidden rounded-full" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-background/30 backdrop-blur-md rounded-full shadow-lg py-2 mt-2 mx-4"
          >
            <div className="container mx-auto px-2 flex justify-around">
              {navItems}
              {user && (
                <>
                  <NavItem to="/profile" icon={FiUser} label="Profile" />
                  <NavItem to="/about" icon={FiInfo} label="About" />
                  <Button variant="ghost" size="sm" onClick={handleLogout} className="flex flex-col items-center">
                    <FiLogOut className="h-5 w-5" />
                    <span className="text-xs mt-1">Logout</span>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}