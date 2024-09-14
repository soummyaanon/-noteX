'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getCurrentUser, updateUserProfile, uploadProfileImage, getProfileImage, deleteProfileImage, deleteUserAccount } from '../../Services/appwrite'
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Loader2, Camera, User, Settings, Mail, Phone, Edit2, Upload, RefreshCw } from 'lucide-react'

const DICEBEAR_API_URL = 'https://api.dicebear.com/6.x'
const AVATAR_STYLES = ['adventurer', 'avataaars', 'big-ears', 'bottts', 'croodles', 'fun-emoji', 'lorelei', 'miniavs', 'open-peeps', 'personas', 'pixel-art']

export default function UserProfile() {
  const [user, setUser] = useState(null)
  const [profileData, setProfileData] = useState({ 
    name: '', 
    username: '', 
    profileImageUrl: '', 
    profileImageId: '',
    email: '',
    phone: '',
    signInMethod: ''
  })
  const [originalData, setOriginalData] = useState({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false)
  const [cartoonAvatars, setCartoonAvatars] = useState([])
  const [selectedStyle, setSelectedStyle] = useState(AVATAR_STYLES[0])
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const fetchUserData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) throw new Error('No user found')

      const userData = {
        name: currentUser.name || '',
        username: currentUser.username || '',
        profileImageId: currentUser.profileImageId || '',
        profileImageUrl: currentUser.profileImageId ? await getProfileImage(currentUser.profileImageId) : '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        signInMethod: currentUser.email ? 'email' : 'phone'
      }

      setUser(currentUser)
      setProfileData(userData)
      setOriginalData(userData)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const generateCartoonAvatars = useCallback(() => {
    const newAvatars = Array.from({ length: 8 }, () => 
      `${DICEBEAR_API_URL}/${selectedStyle}/png?size=200&seed=${Math.random()}`
    )
    setCartoonAvatars(newAvatars)
  }, [selectedStyle])

  useEffect(() => {
    generateCartoonAvatars()
  }, [generateCartoonAvatars])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarSelect = async (avatarUrl) => {
    setIsSaving(true)
    setError(null)
    try {
      if (profileData.profileImageId) {
        await deleteProfileImage(profileData.profileImageId)
      }

      const response = await fetch(avatarUrl)
      const blob = await response.blob()
      const file = new File([blob], 'avatar.png', { type: 'image/png' })

      const uploadedFile = await uploadProfileImage(file)
      const newImageUrl = await getProfileImage(uploadedFile.$id)

      const updatedProfileData = {
        ...profileData,
        profileImageUrl: newImageUrl,
        profileImageId: uploadedFile.$id
      }

      await updateUserProfile(user.$id, updatedProfileData)

      setProfileData(updatedProfileData)
      setOriginalData(updatedProfileData)

      setIsAvatarDialogOpen(false)
    } catch (error) {
      setError('Failed to update avatar. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setIsSaving(true)
    setError(null)
    try {
      if (profileData.profileImageId) {
        await deleteProfileImage(profileData.profileImageId)
      }

      const uploadedFile = await uploadProfileImage(file)
      const newImageUrl = await getProfileImage(uploadedFile.$id)

      const updatedProfileData = {
        ...profileData,
        profileImageUrl: newImageUrl,
        profileImageId: uploadedFile.$id
      }

      await updateUserProfile(user.$id, updatedProfileData)

      setProfileData(updatedProfileData)
      setOriginalData(updatedProfileData)

      setIsAvatarDialogOpen(false)
    } catch (error) {
      setError('Failed to upload image. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)
    try {
      await updateUserProfile(user.$id, profileData)
      setOriginalData(profileData)
    } catch (error) {
      setError('Failed to update profile. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsSaving(true)
    setError(null)
    try {
      await deleteUserAccount()
      navigate('/login')
    } catch (error) {
      if (error.message.includes("Invalid query: Attribute not found in schema: userId")) {
        setError('There was an issue deleting your notes, but your account has been deleted. Please contact support if you continue to see your account.')
        navigate('/login')
      } else {
        setError('Failed to delete account. Please try again or contact support.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const encodeContact = (contact) => {
    if (!contact) return ''
    const visiblePart = contact.slice(-4)
    const hiddenPart = '*'.repeat(contact.length - 4)
    return hiddenPart + visiblePart
  }

  const isProfileChanged = useMemo(() => {
    return profileData.name !== originalData.name || profileData.username !== originalData.username
  }, [profileData, originalData])

  if (error) {
    return <div className="text-red-500 text-center mt-8">Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto relative">
        {isLoading ? (
          <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <>
            <CardHeader className="text-center relative pb-2">
              <CardTitle className="text-3xl font-bold">User Profile</CardTitle>
              <CardDescription>Manage your account information and settings</CardDescription>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="absolute top-4 right-4">
                    <Settings className="h-5 w-5" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="w-full justify-start">
                        <User className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account,
                          all your notes, and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-red-600 hover:bg-red-700">
                          {isSaving ? 'Deleting...' : 'Yes, delete my account'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </PopoverContent>
              </Popover>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
                <div className="flex-shrink-0 w-full md:w-auto text-center">
                  <div className="relative">
                    <Avatar className="h-40 w-40 mx-auto">
                      <AvatarImage 
                        src={profileData.profileImageUrl} 
                        alt={profileData.name} 
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.src = `${DICEBEAR_API_URL}/initials/svg?seed=${profileData.name}`
                        }}
                      />
                      <AvatarFallback>{profileData.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {isSaving && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center rounded-full">
                        <Loader2 className="h-8 w-8 animate-spin" />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <Dialog open={isAvatarDialogOpen} onOpenChange={setIsAvatarDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Camera className="mr-2 h-4 w-4" />
                          Change Avatar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Choose an Avatar</DialogTitle>
                          <DialogDescription>
                            Select a cartoon avatar or upload your own image.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-4 gap-4 py-4">
                          {cartoonAvatars.map((avatar, index) => (
                            <Avatar
                              key={index}
                              className="h-20 w-20 mx-auto cursor-pointer"
                              onClick={() => handleAvatarSelect(avatar)}
                            >
                              <AvatarImage src={avatar} alt={`Cartoon Avatar ${index + 1}`} />
                            </Avatar>
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-4">
                          <select
                            value={selectedStyle}
                            onChange={(e) => setSelectedStyle(e.target.value)}
                            className="px-2 py-1 border rounded"
                          >
                            {AVATAR_STYLES.map((style) => (
                              <option key={style} value={style}>
                                {style}
                              </option>
                            ))}
                          </select>
                          <Button onClick={generateCartoonAvatars} variant="outline">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Refresh Avatars
                          </Button>
                        </div>
                        <div className="flex justify-center mt-4">
                          <Label htmlFor="custom-avatar" className="cursor-pointer">
                            <div className="flex items-center justify-center w-full h-20 border-2 border-dashed rounded-lg hover:bg-secondary">
                              <Upload className="mr-2 h-6 w-6" />
                              <span>Upload custom image</span>
                            </div>
                            <Input
                              id="custom-avatar"
                              type="file"
                              className="hidden"
                              onChange={handleImageUpload}
                              accept="image/*"
                            />
                          </Label>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
                <form onSubmit={handleSubmit} className="flex-grow space-y-6 w-full max-w-md mx-auto">
                  <Tabs defaultValue="personal" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="personal">Personal Info</TabsTrigger>
                      <TabsTrigger value="contact">Contact Info</TabsTrigger>
                    </TabsList>
                    <TabsContent value="personal" className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-center block">Name</Label>
                        <Input id="name" name="name" value={profileData.name} onChange={handleInputChange} className="w-full text-center" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="username" className="text-center block">Username</Label>
                        <Input id="username" name="username" value={profileData.username} onChange={handleInputChange} className="w-full text-center" />
                      </div>
                    </TabsContent>
                    <TabsContent value="contact" className="space-y-4">
                      {profileData.signInMethod === 'email' && (
                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-center block">Email</Label>
                          <div className="flex items-center space-x-2">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <Input id="email" name="email" value={encodeContact(profileData.email)} readOnly className="w-full bg-muted text-center" />
                          </div>
                        </div>
                      )}
                      {profileData.signInMethod === 'phone' && (
                        <div className="space-y-2">
                          <Label htmlFor="phone" className="text-center block">Phone</Label>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-5 w-5 text-muted-foreground" />
                            <Input id="phone" name="phone" value={encodeContact(profileData.phone)} readOnly className="w-full bg-muted text-center" />
                          </div>
                        </div>
                      )}
                      <p className="text-sm text-muted-foreground text-center">
                        Contact information is partially hidden for security. To update, please contact support.
                      </p>
                    </TabsContent>
                  </Tabs>
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isSaving || !isProfileChanged}
                  >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Edit2 className="mr-2 h-4 w-4" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  )
}