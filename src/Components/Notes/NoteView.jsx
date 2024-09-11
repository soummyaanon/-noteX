import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { listDocuments, toggleNoteFavorite, getCurrentUser, deleteDocument } from '../../Services/appwrite';
import { Query } from 'appwrite';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Plus, FileText, ArrowUpDown, Search, BarChart2, Star, Loader2, Share2, Pencil, Trash2, MoreVertical } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from 'framer-motion';
import * as tf from '@tensorflow/tfjs';
import * as use from '@tensorflow-models/universal-sentence-encoder';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Badge } from "../ui/badge"
import { Skeleton } from "../ui/skeleton"
import { toast } from "../ui/use-toast"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"

const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

const NoteList = ({ userId }) => {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [model, setModel] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showVisualization, setShowVisualization] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authState, setAuthState] = useState({ isLoggedIn: false, userName: '' });

  const navigate = useNavigate();

  const fetchUserData = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setAuthState({
        isLoggedIn: !!user,
        userName: user ? user.name : '',
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }, []);

  useEffect(() => {
    const fetchNotes = async () => {
      setIsLoading(true);
      try {
        const response = await listDocuments(NOTES_COLLECTION_ID, [
          Query.equal('owner', userId)
        ]);
        setNotes(response.documents);
      } catch (err) {
        console.error('Error fetching notes:', err);
        setError('Failed to fetch notes. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotes();

    const loadModel = async () => {
      try {
        const loadedModel = await use.load();
        setModel(loadedModel);
      } catch (err) {
        console.error('Error loading model:', err);
        setError('Failed to load search model. Semantic search may not work.');
      }
    };
    loadModel();
    fetchUserData();
  }, [userId, fetchUserData]);

  const performSemanticSearch = useCallback(async () => {
    if (!model || !searchQuery) return;

    setIsSearching(true);
    try {
      const sentences = [searchQuery, ...notes.map(note => `${note.title} ${note.content}`)];
      const embeddings = await model.embed(sentences);

      const queryEmbedding = embeddings.slice([0, 0], [1]);
      const noteEmbeddings = embeddings.slice([1, 0], [notes.length, -1]);

      const normalizedQuery = tf.div(queryEmbedding, tf.norm(queryEmbedding));
      const normalizedNotes = tf.div(noteEmbeddings, tf.norm(noteEmbeddings, 1, 1).expandDims(1));
      const similarities = tf.matMul(normalizedNotes, normalizedQuery.transpose()).dataSync();

      const searchResults = notes.map((note, index) => ({
        ...note,
        similarity: similarities[index],
      })).sort((a, b) => b.similarity - a.similarity);

      setNotes(searchResults);
      setShowVisualization(true);
    } catch (err) {
      console.error('Search failed:', err);
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  }, [model, searchQuery, notes]);

  const handleToggleFavorite = async (noteId) => {
    try {
      const updatedNote = await toggleNoteFavorite(noteId);
      setNotes(prevNotes => prevNotes.map(note => 
        note.$id === noteId ? { ...note, isFavorite: updatedNote.isFavorite } : note
      ));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError('Failed to update favorite status. Please try again.');
    }
  };

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (searchQuery) return 0;
      if (sortBy === 'isFavorite') {
        return sortOrder === 'asc' 
          ? (a.isFavorite === b.isFavorite ? 0 : a.isFavorite ? -1 : 1)
          : (a.isFavorite === b.isFavorite ? 0 : b.isFavorite ? -1 : 1);
      }
      const aValue = sortBy === 'title' ? a[sortBy] : new Date(a[`$${sortBy}`]);
      const bValue = sortBy === 'title' ? b[sortBy] : new Date(b[`$${sortBy}`]);
      return sortOrder === 'asc' ? aValue > bValue ? 1 : -1 : bValue > aValue ? 1 : -1;
    });
  }, [notes, sortBy, sortOrder, searchQuery]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'asc' ? 'desc' : 'asc');
  };

  const visualizationData = useMemo(() => {
    return sortedNotes.slice(0, 5).map(note => ({
      title: note.title,
      relevance: note.similarity ? note.similarity : 0,
    }));
  }, [sortedNotes]);

  const handleShare = async (note) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: note.title,
          text: note.content,
          url: `${window.location.origin}/notes/${note.$id}`
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

  const handleEdit = (noteId) => {
    navigate(`/edit-note/${noteId}`);
  };

  const handleDelete = async (noteId) => {
    try {
      await deleteDocument(NOTES_COLLECTION_ID, noteId);
      setNotes(prevNotes => prevNotes.filter(note => note.$id !== noteId));
      toast({
        title: "Note deleted",
        description: "The note has been successfully deleted.",
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: "Deletion failed",
        description: "There was an error while deleting the note.",
        variant: "destructive",
      });
    }
  };

  if (error) return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardContent className="pt-6">
        <p className="text-red-500">{error}</p>
      </CardContent>
    </Card>
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full min-h-screen p-2 sm:p-4 md:p-6 lg:p-8"
    >
      <Card className="bg-gradient-to-br from-primary/5 to-secondary/5 w-full h-full">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
            {authState.isLoggedIn ? `${authState.userName}'s Notes` : "Your Notes"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-4">
            <Button asChild className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-primary-foreground">
              <Link to="/new-note">
                <Plus className="mr-2 h-4 w-4" /> Create New Note
              </Link>
            </Button>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updatedAt">Last Updated</SelectItem>
                  <SelectItem value="createdAt">Created Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="isFavorite">Favorite</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" size="icon" onClick={toggleSortOrder}>
                <ArrowUpDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2 mb-4 sm:mb-6">
            <div className="relative w-full">
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10"
              />
              <Button 
                className="absolute right-1 top-1/2 -translate-y-1/2"
                size="sm"
                onClick={performSemanticSearch}
                disabled={isSearching || !searchQuery}
              >
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowVisualization(!showVisualization)}
              disabled={!searchQuery}
              className="w-full sm:w-auto"
            >
              <BarChart2 className="mr-2 h-4 w-4" />
              {showVisualization ? 'Hide' : 'Show'} Relevance
            </Button>
          </div>
          <AnimatePresence>
            {showVisualization && searchQuery && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 sm:mb-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Search Relevance</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {visualizationData.map((item, index) => (
                        <div key={index} className="flex items-center">
                          <div className="w-16 sm:w-24 truncate mr-2">{item.title}</div>
                          <div className="flex-grow bg-secondary/20 h-2 rounded-full overflow-hidden">
                            <div 
                              className="bg-primary h-full rounded-full" 
                              style={{ width: `${item.relevance * 100}%` }}
                            />
                          </div>
                          <div className="ml-2 text-xs sm:text-sm">{(item.relevance * 100).toFixed(0)}%</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="all">All Notes</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <NoteGrid 
                notes={sortedNotes} 
                isLoading={isLoading} 
                handleToggleFavorite={handleToggleFavorite} 
                handleShare={handleShare} 
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                searchQuery={searchQuery} 
              />
            </TabsContent>
            <TabsContent value="favorites">
              <NoteGrid 
                notes={sortedNotes.filter(note => note.isFavorite)} 
                isLoading={isLoading} 
                handleToggleFavorite={handleToggleFavorite} 
                handleShare={handleShare} 
                handleEdit={handleEdit}
                handleDelete={handleDelete}
                searchQuery={searchQuery} 
              />
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <p className="text-xs sm:text-sm text-muted-foreground">Total notes: {notes.length}</p>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const NoteGri = ({ notes, isLoading, handleToggleFavorite, handleShare, handleEdit, handleDelete, searchQuery }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index}>
            <CardContent className="pt-6">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (notes.length === 0) {
    return (
      <p className="text-center text-muted-foreground">No notes found. Try a different search or create a new note!</p>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-20rem)] sm:h-[calc(100vh-22rem)] md:h-[calc(100vh-24rem)]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {notes.map(note => (
          <motion.div
            key={note.$id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="h-full flex flex-col">
              <CardContent className="pt-6 flex-grow">
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/notes/${note.$id}`} className="flex items-center">
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="text-lg sm:text-xl font-semibold line-clamp-1">{note.title}</span>
                  </Link>
                  <div className="flex items-center">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleFavorite(note.$id)}
                          >
                            <Star className={`h-4 w-4 ${note.isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {note.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(note.$id)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(note)}>
                          <Share2 className="mr-2 h-4 w-4" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="sm" className="w-full justify-start">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete this note?</AlertDialogTitle>
                                <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(note.$id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Last updated: {new Date(note.$updatedAt).toLocaleString()}
                </p>
                {searchQuery && note.similarity !== undefined && (
                  <Badge variant="secondary" className="mb-2">
                    Relevance: {(note.similarity * 100).toFixed(2)}%
                  </Badge>
                )}
                <p className="text-xs sm:text-sm line-clamp-3">{note.content}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </ScrollArea>
  );
};

export default NoteList;