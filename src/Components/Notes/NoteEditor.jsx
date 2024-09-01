import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getDocument, createDocument, updateDocument } from '../../Services/appwrite';
import { getAISuggestion, getContentImprovements, generateTitleSuggestion, getContentRecommendations } from '../../Services/aiService';
import { marked } from 'marked';
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Alert, AlertDescription } from "../ui/alert";
import { 
  Loader2, Bold, Italic, List, ListOrdered, Link, Image, Code, Quote, 
  Heading1, Heading2, Heading3, Sparkles, Menu, Save, Eye, Edit, BookOpen,
  ChevronDown, ChevronUp, X, Maximize2, Minimize2, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { ScrollArea } from "../ui/scroll-area";
import { Slider } from "../ui/slider";
import debounce from 'lodash.debounce';
import AIWritingAssistant from '../AI/AIWritingAssistant';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';

const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;

export default function Component({ userId }) {
  const { noteId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPreview, setIsPreview] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [showToolbar, setShowToolbar] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const editorRef = useRef(null);
  const fullscreenRef = useRef(null);

  const progress = useMotionValue(0);
  const opacity = useTransform(progress, [0, 100], [0, 1]);

  useEffect(() => {
    if (noteId) {
      fetchNote();
    }
  }, [noteId]);

  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
    });
    setPreview(marked(content));
    updateProgress();
  }, [content]);

  const fetchNote = async () => {
    setLoading(true);
    try {
      const note = await getDocument(NOTES_COLLECTION_ID, noteId);
      setTitle(note.title);
      setContent(note.content);
    } catch (error) {
      setError('Failed to fetch note. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaveStatus('Saving...');
    setError(null);
    try {
      const noteData = {
        title,
        content,
        owner: userId,
        updated_at: new Date().toISOString(),
        isFavorite: false,
      };

      if (noteId) {
        await updateDocument(NOTES_COLLECTION_ID, noteId, noteData);
      } else {
        noteData.created_at = new Date().toISOString();
        const result = await createDocument(NOTES_COLLECTION_ID, noteData);
        navigate(`/notes/${result.$id}`);
      }
      setSaveStatus('Saved');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (error) {
      setError(`Failed to save note: ${error.message}`);
      setSaveStatus('');
    } finally {
      setLoading(false);
    }
  };

  const debouncedSave = useCallback(
    debounce(() => {
      handleSave();
    }, 3000),
    [title, content]
  );

  useEffect(() => {
    if (title || content) {
      setSaveStatus('Saving...');
      debouncedSave();
    }
    return () => {
      debouncedSave.cancel();
    };
  }, [title, content, debouncedSave]);

  const insertMarkdown = (markdownSymbol, placeholder = '') => {
    const textarea = editorRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const selectedText = content.substring(selectionStart, selectionEnd);
    const newContent = `${content.substring(0, selectionStart)}${markdownSymbol}${selectedText || placeholder}${markdownSymbol}${content.substring(selectionEnd)}`;
    setContent(newContent);
    textarea.focus();
    textarea.setSelectionRange(selectionStart + markdownSymbol.length, selectionEnd + markdownSymbol.length);
  };

  const insertAISuggestion = (suggestion) => {
    const textarea = editorRef.current;
    const { selectionStart, selectionEnd } = textarea;
    const newContent = `${content.substring(0, selectionStart)}${suggestion}${content.substring(selectionEnd)}`;
    setContent(newContent);
    textarea.focus();
    textarea.setSelectionRange(selectionStart + suggestion.length, selectionStart + suggestion.length);
  };

  const handleImproveContent = async () => {
    setLoading(true);
    try {
      const improvedContent = await getContentImprovements(content);
      setContent(improvedContent);
    } catch (error) {
      setError('Failed to improve content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTitle = async () => {
    setLoading(true);
    try {
      const suggestedTitle = await generateTitleSuggestion(content);
      setTitle(suggestedTitle);
    } catch (error) {
      setError('Failed to generate title. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGetRecommendations = async () => {
    setLoading(true);
    try {
      const contentRecommendations = await getContentRecommendations(content);
      setRecommendations(contentRecommendations.split('\n').filter(item => item.trim() !== ''));
      setShowRecommendations(true);
    } catch (error) {
      setError('Failed to get recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = () => {
    const wordCount = content.trim().split(/\s+/).length;
    const targetWordCount = 500; // Adjust this value as needed
    const percentage = Math.min((wordCount / targetWordCount) * 100, 100);
    progress.set(percentage);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const markdownButtons = [
    { icon: Bold, action: () => insertMarkdown('**', 'bold text'), tooltip: 'Bold' },
    { icon: Italic, action: () => insertMarkdown('*', 'italic text'), tooltip: 'Italic' },
    { icon: Heading1, action: () => insertMarkdown('# ', 'Heading 1'), tooltip: 'Heading 1' },
    { icon: Heading2, action: () => insertMarkdown('## ', 'Heading 2'), tooltip: 'Heading 2' },
    { icon: Heading3, action: () => insertMarkdown('### ', 'Heading 3'), tooltip: 'Heading 3' },
    { icon: List, action: () => insertMarkdown('\n- ', 'list item'), tooltip: 'Unordered List' },
    { icon: ListOrdered, action: () => insertMarkdown('\n1. ', 'list item'), tooltip: 'Ordered List' },
    { icon: Link, action: () => insertMarkdown('[', 'link text](https://example.com)'), tooltip: 'Link' },
    { icon: Image, action: () => insertMarkdown('![', 'alt text](https://example.com/image.jpg)'), tooltip: 'Image' },
    { icon: Code, action: () => insertMarkdown('`', 'code'), tooltip: 'Inline Code' },
    { icon: Quote, action: () => insertMarkdown('\n> ', 'quote'), tooltip: 'Blockquote' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="p-2 sm:p-4 md:p-6 lg:p-8"
        ref={fullscreenRef}
      >
        <Card className="w-full max-w-7xl mx-auto shadow-lg overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Note"
                className="text-xl sm:text-2xl md:text-3xl font-bold border-none focus:ring-0 p-0 bg-transparent flex-grow mr-2 mb-2 sm:mb-0 w-full sm:w-auto"
              />
              <div className="flex items-center space-x-2 flex-shrink-0 w-full sm:w-auto justify-end">
                {saveStatus && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-muted-foreground hidden sm:inline"
                  >
                    {saveStatus}
                  </motion.span>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)} className="w-full sm:w-auto">
                        {isPreview ? <Edit className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                        {isPreview ? 'Edit' : 'Preview'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPreview ? 'Switch to Edit mode' : 'Switch to Preview mode'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={toggleFullscreen} className="hidden sm:flex">
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
              <div className={`flex-grow transition-all duration-300 ${showSidebar ? 'lg:w-3/4' : 'w-full'}`}>
                <motion.div
                  initial={false}
                  animate={{ height: showToolbar ? 'auto' : 0, opacity: showToolbar ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  {!isPreview && (
                    <div className="flex flex-wrap items-center justify-between mb-4 bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                      <div className="flex flex-wrap items-center space-x-1 mb-2 sm:mb-0">
                        <TooltipProvider>
                          {markdownButtons.map(({ icon: Icon, action, tooltip }, index) => (
                            <Tooltip key={index}>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={action} className="text-gray-700 dark:text-gray-300">
                                  <Icon className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{tooltip}</p>
                              </TooltipContent>
                            </Tooltip>
                          ))}
                        </TooltipProvider>
                      </div>
                      <div className="flex flex-wrap items-center space-x-2 mt-2 sm:mt-0">
                        <Button onClick={handleGenerateTitle} disabled={loading || !content} size="sm" variant="outline" className="mb-2 sm:mb-0 w-full sm:w-auto">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Generate Title
                        </Button>
                        <Button onClick={handleImproveContent} disabled={loading || !content} size="sm" variant="outline" className="mb-2 sm:mb-0 w-full sm:w-auto">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Improve
                        </Button>
                        <Button onClick={handleGetRecommendations} disabled={loading || !content} size="sm" variant="outline" className="w-full sm:w-auto">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Get Recommendations
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>

                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 z-10"
                    onClick={() => setShowToolbar(!showToolbar)}
                  >
                    {showToolbar ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  {isPreview ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[300px] sm:min-h-[400px] overflow-auto mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner"
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      <div dangerouslySetInnerHTML={{ __html: preview }} />
                    </motion.div>
                  ) : (
                    <Textarea
                      ref={editorRef}
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Start writing your note here..."
                      className="min-h-[300px] sm:min-h-[400px] resize-none w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      style={{ fontSize: `${fontSize}px` }}
                    />
                  )}
                </div>

                <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-2 w-full sm:w-auto">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Font Size:</span>
                    <Slider
                      min={12}
                      max={24}
                      step={1}
                      value={[fontSize]}
                      onValueChange={(value) => setFontSize(value[0])}
                      className="w-32"
                    />
                    <span className="text-sm text-gray-500 dark:text-gray-400">{fontSize}px</span>
                  </div>
                  <motion.div
                    className="w-full sm:w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                    style={{ opacity }}
                  >
                    <motion.div
                      className="h-full bg-blue-500"
                      style={{ width: progress }}
                    />
                  </motion.div>
                </div>
              </div>

              <AnimatePresence>
                {showSidebar && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                    className="w-full lg:w-1/4 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg"
                  >
                    <Tabs defaultValue="ai" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="ai">AI Assistant</TabsTrigger>
                        <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ai" className="mt-4">
                        <AIWritingAssistant onInsert={insertAISuggestion} currentContent={content} onUpdateTitle={setTitle} />
                      </TabsContent>
                      <TabsContent value="recommendations" className="mt-4">
                        <ScrollArea className="h-[200px] sm:h-[300px] rounded-md border p-4">
                          {recommendations.map((recommendation, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.1 }}
                              className="mb-2 p-2 bg-white dark:bg-gray-700 rounded-md"
                            >
                              <p className="text-sm mb-1">{recommendation}</p>
                              <Button
                                onClick={() => insertAISuggestion(recommendation)}
                                size="sm"
                                variant="ghost"
                                className="w-full justify-start text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Sparkles className="h-3 w-3 mr-1" />
                                Insert
                              </Button>
                            </motion.div>
                          ))}
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                className="absolute top-1/2 right-2 transform -translate-y-1/2 hidden lg:flex"
                onClick={() => setShowSidebar(!showSidebar)}
              >
                {showSidebar ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
              </Button>
            </div>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {loading && (
              <div className="flex justify-center mt-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}