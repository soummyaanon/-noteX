import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getDocument, deleteDocument, toggleNoteFavorite } from '../../Services/appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { ArrowLeft, Edit, Trash2, Star, Share2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { toast } from "../ui/use-toast"
import { Skeleton } from "../ui/skeleton"
import { motion } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const NoteView = () => {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNote = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedNote = await getDocument(NOTES_COLLECTION_ID, noteId);
      setNote(fetchedNote);
    } catch (error) {
      console.error('Error fetching note:', error);
      toast({
        title: "Error",
        description: "Failed to fetch the note. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNote();
  }, [fetchNote]);

  const handleEdit = () => {
    navigate(`/edit-note/${noteId}`);
  };

  const handleDelete = async () => {
    try {
      await deleteDocument(NOTES_COLLECTION_ID, noteId);
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error while deleting the note.",
        variant: "destructive",
      });
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const updatedNote = await toggleNoteFavorite(noteId);
      setNote(prevNote => ({ ...prevNote, isFavorite: updatedNote.isFavorite }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      toast({
        title: "Error",
        description: "Failed to update favorite status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
          url: window.location.href
        });
        toast({
          title: "Shared successfully",
          description: "The note has been shared.",
        });
      } catch (error) {
        console.error('Error sharing:', error);
        toast({
          title: "Sharing failed",
          description: "There was an error while sharing the note.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Sharing not supported",
        description: "Your browser doesn't support sharing. You can copy the URL to share.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardContent className="pt-6">
          <div className="animate-pulse space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!note) {
    return (
      <Card className="w-full max-w-3xl mx-auto mt-8">
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">Note not found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-3xl mx-auto mt-8"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">{note.title}</CardTitle>
          <div className="flex space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={handleToggleFavorite}>
                    <Star className={`h-4 w-4 ${note.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <Button variant="outline" size="icon" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="icon">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                  <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Last updated: {new Date(note.$updatedAt).toLocaleString()}
          </p>
          <div className="prose max-w-none">
            {note.content}
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Notes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default NoteView;