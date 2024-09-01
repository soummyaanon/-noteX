import React, { useState, useEffect } from 'react';
import { getCurrentUser, updateUserProfile, uploadProfileImage, getProfileImage, deleteProfileImage, deleteUserAccount } from '../../Services/appwrite';
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { Loader2, Camera, User, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState(null);
    const [name, setName] = useState('');
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [profileImageUrl, setProfileImageUrl] = useState('');
    const [profileImageId, setProfileImageId] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchUserData();
    }, []);

    /**
     * Fetches the current user data and updates the state.
     */
    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const currentUser = await getCurrentUser();
            if (!currentUser) {
                throw new Error('No user found');
            }

            setUser(currentUser);
            setName(currentUser.name || '');
            setUsername(currentUser.username || '');
            setEmail(currentUser.email || '');
            setProfileImageId(currentUser.profileImageId || '');

            if (currentUser.profileImageId) {
                try {
                    const imageUrl = await getProfileImage(currentUser.profileImageId);
                    setProfileImageUrl(imageUrl);
                } catch (error) {
                    console.error('Error fetching profile image:', error);
                    setProfileImageUrl('');
                }
            }
        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles the change of the name input field.
     * @param {Event} e - The input change event.
     */
    const handleNameChange = (e) => setName(e.target.value);

    /**
     * Handles the change of the username input field.
     * @param {Event} e - The input change event.
     */
    const handleUsernameChange = (e) => setUsername(e.target.value);

    /**
     * Handles the upload of a new profile image.
     * @param {Event} e - The file input change event.
     */
    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file) {
            try {
                setIsSaving(true);
                const uploadedFile = await uploadProfileImage(file);

                if (profileImageId) {
                    await deleteProfileImage(profileImageId);
                }

                const newImageUrl = await getProfileImage(uploadedFile.$id);
                setProfileImageUrl(newImageUrl);
                setProfileImageId(uploadedFile.$id);

                await updateUserProfile(user.$id, {
                    name,
                    username,
                    profileImageId: uploadedFile.$id
                });

                alert('Profile image updated successfully!');
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
            } finally {
                setIsSaving(false);
            }
        }
    };

    /**
     * Handles the submission of the profile update form.
     * @param {Event} e - The form submit event.
     */
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSaving(true);
            await updateUserProfile(user.$id, {
                name,
                username,
                profileImageId
            });
            alert('Profile updated successfully!');
            fetchUserData();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setIsSaving(false);
        }
    };

    /**
     * Handles the deletion of the user account.
     */
    const handleDeleteAccount = async () => {
        try {
            setIsSaving(true);
            await deleteUserAccount();
            navigate('/login'); // Redirect to login page after successful deletion
        } catch (error) {
            console.error('Error deleting account:', error);
            if (error.message.includes("Invalid query: Attribute not found in schema: userId")) {
                alert('There was an issue deleting your notes, but your account has been deleted. Please contact support if you continue to see your account.');
                navigate('/login');
            } else {
                alert('Failed to delete account. Please try again or contact support.');
            }
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <Card className="w-full max-w-2xl mx-auto">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
                        <CardDescription>Manage your account information and settings</CardDescription>
                    </div>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="ghost" size="icon">
                                <Settings className="h-5 w-5" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-56">
                            <div className="space-y-2">
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
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                        Deleting...
                                                    </>
                                                ) : (
                                                    'Yes, delete my account'
                                                )}
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </PopoverContent>
                    </Popover>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="flex flex-col items-center space-y-4">
                            <Avatar className="h-24 w-24">
                                <AvatarImage src={profileImageUrl} alt={name} />
                                <AvatarFallback>{name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="relative">
                                <Input 
                                    id="profileImage" 
                                    type="file" 
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <Label htmlFor="profileImage" className="cursor-pointer flex items-center space-x-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md">
                                    <Camera className="h-4 w-4" />
                                    <span>Change Photo</span>
                                </Label>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input id="name" value={name} onChange={handleNameChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="username">Username</Label>
                            <Input id="username" value={username} onChange={handleUsernameChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" value={email} disabled />
                        </div>
                        <Button type="submit" className="w-full" disabled={isSaving}>
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Changes'
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default UserProfile;