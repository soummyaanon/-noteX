import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, deleteDocument, getCurrentUser } from '../../Services/appwrite';
import { marked } from 'marked';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Button } from '../ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '../ui/alert-dialog';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { ChevronLeft, Pencil, Trash2, Clock, Eye, Code, Volume2, Share2, Maximize2, Minimize2, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Toggle } from "../ui/toggle";
import { motion, AnimatePresence } from 'framer-motion';
import TextToSpeech from '../Text-Speach/TextToSpeech';

const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export default function Component() {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [showTextToSpeech, setShowTextToSpeech] = useState(false);
  const [activeTab, setActiveTab] = useState('preview');
  const [zenMode, setZenMode] = useState(false);
  const [textAlignment, setTextAlignment] = useState('left');

  const fetchNoteAndUser = useCallback(async () => {
    try {
      const [fetchedNote, user] = await Promise.all([
        getDocument(NOTES_COLLECTION_ID, noteId),
        getCurrentUser()
      ]);
      setNote(fetchedNote);
      setCurrentUser(user);
    } catch (err) {
      console.error('Error fetching note:', err);
      if (err.code === 404) {
        setError('Note not found. It may have been deleted or you may not have permission to view it.');
      } else {
        setError('An error occurred while fetching the note. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  useEffect(() => {
    fetchNoteAndUser();
  }, [fetchNoteAndUser]);

  const handleDelete = async () => {
    try {
      await deleteDocument(NOTES_COLLECTION_ID, noteId);
      navigate('/notes', { state: { message: 'Note deleted successfully' } });
    } catch (err) {
      setError('Failed to delete the note. Please try again.');
      console.error('Error deleting note:', err);
    }
  };

  const toggleZenMode = () => {
    setZenMode(!zenMode);
  };

  const handleAlignmentChange = (alignment) => {
    setTextAlignment(alignment);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
          url: window.location.href
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      alert('Sharing is not supported on this browser. You can copy the URL to share.');
    }
  };

  if (loading) {
    return (
      <Card className="w-full mx-auto mt-4 shadow-lg">
        <CardContent className="p-4">
          <Skeleton className="h-6 w-3/4 mb-3" />
          <Skeleton className="h-4 w-1/2 mb-6" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="w-full mx-auto mt-4">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <Button 
          variant="outline" 
          onClick={() => navigate('/notes')} 
          className="mt-4 w-full transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Button>
      </Alert>
    );
  }

  if (!note) {
    return (
      <Alert className="w-full mx-auto mt-4">
        <AlertTitle>Note not found</AlertTitle>
        <AlertDescription>The requested note could not be found.</AlertDescription>
        <Button 
          variant="outline" 
          onClick={() => navigate('/notes')} 
          className="mt-4 w-full transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Notes
        </Button>
      </Alert>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`p-2 sm:p-4 md:p-6 ${zenMode ? 'bg-background min-h-screen' : ''}`}
    >
      <Card className={`w-full mx-auto shadow-lg overflow-hidden transition-all duration-300 ease-in-out ${zenMode ? 'max-w-4xl bg-background border-none shadow-none' : 'bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/20'}`}>
        <CardContent className={`p-3 sm:p-4 md:p-6 ${zenMode ? 'max-w-2xl mx-auto' : ''}`}>
          <motion.div 
            className={`flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 ${zenMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 sm:mb-0">{note.title}</h1>
            <div className="flex items-center space-x-2 mt-2 sm:mt-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle pressed={textAlignment === 'left'} onPressedChange={() => handleAlignmentChange('left')} aria-label="Align Left">
                      <AlignLeft className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Align Left</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle pressed={textAlignment === 'center'} onPressedChange={() => handleAlignmentChange('center')} aria-label="Align Center">
                      <AlignCenter className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Align Center</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle pressed={textAlignment === 'right'} onPressedChange={() => handleAlignmentChange('right')} aria-label="Align Right">
                      <AlignRight className="h-4 w-4" />
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>Align Right</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Toggle pressed={zenMode} onPressedChange={toggleZenMode} aria-label="Toggle Zen Mode">
                      {zenMode ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                    </Toggle>
                  </TooltipTrigger>
                  <TooltipContent>
                    {zenMode ? 'Exit Zen Mode' : 'Enter Zen Mode'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </motion.div>
          <motion.div 
            className={`flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 ${zenMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Clock className="h-4 w-4" />
            <span>Last updated: {new Date(note.$updatedAt).toLocaleString()}</span>
          </motion.div>
          <motion.div 
            className={`flex flex-wrap justify-center sm:justify-start gap-2 mb-4 sm:mb-6 ${zenMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/edit-note/${noteId}`)}>
                    <Pencil className="h-4 w-4 mr-2" /> Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit Note</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={() => setShowTextToSpeech(!showTextToSpeech)}>
                    <Volume2 className="h-4 w-4 mr-2" /> Listen
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Text to Speech</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" /> Share
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Share Note</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
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
                </TooltipTrigger>
                <TooltipContent>Delete Note</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
          <Tabs value={activeTab} onValueChange={setActiveTab} className={`w-full ${zenMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="preview" className="flex items-center justify-center space-x-2">
                <Eye className="h-4 w-4" />
                <span>Preview</span>
              </TabsTrigger>
              <TabsTrigger value="source" className="flex items-center justify-center space-x-2">
                <Code className="h-4 w-4" />
                <span>Source</span>
              </TabsTrigger>
            </TabsList>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
              >
                <TabsContent value="preview" className="mt-4">
                  <div 
                    className={`prose dark:prose-invert max-w-none ${zenMode ? 'text-base sm:text-lg leading-relaxed' : 'text-sm sm:text-base'}`} 
                    style={{ textAlign: textAlignment }}
                    dangerouslySetInnerHTML={{ __html: marked(note.content || '') }} 
                  />
                </TabsContent>
                <TabsContent value="source" className="mt-4">
                  <pre className={`p-2 sm:p-4 rounded-md overflow-x-auto bg-muted ${zenMode ? 'text-xs sm:text-sm' : 'text-xs'}`}>
                    <code>{note.content || ''}</code>
                  </pre>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
          <AnimatePresence>
            {showTextToSpeech && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 sm:mt-6"
              >
                <TextToSpeech text={note.content || ''} />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
        <CardFooter className={`bg-muted/50 p-3 sm:p-4 md:p-6 ${zenMode ? 'opacity-0 hover:opacity-100 transition-opacity duration-300' : ''}`}>
          <Button 
            variant="outline" 
            onClick={() => navigate('/notes')} 
            className="w-full transition-all duration-200 ease-in-out transform hover:scale-105 hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to Notes
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}