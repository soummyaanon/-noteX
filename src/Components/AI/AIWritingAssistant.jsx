import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { Loader2, Wand2, Sparkles, AlertCircle, Clipboard, Send, Eraser, ArrowRight, FileText, Tags, Maximize, BookOpen, MessageSquare, Languages, GitBranch, BotMessageSquare  } from 'lucide-react';
import { getAISuggestion, getContentImprovements, generateTitleSuggestion, summarizeNote, suggestTags, expandNote, getContentRecommendations, analyzeSentiment, translateText, generateMindMap } from '../../Services/aiService';
import { useToast } from "../ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

import ShimmerButton from '../magicui/shimmer-button';

const MODELS = {
  TEXT_GENERATION: 'gemini-pro',
  SUMMARIZATION: 'gemini-pro',
  TITLE_GENERATION: 'gemini-pro',
  TAG_SUGGESTION: 'gemini-pro',
};

const fadeInOut = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.3 }
};

export default function AIWritingAssistant({ onInsert, currentContent, onUpdateTitle = () => {} }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [activeTab, setActiveTab] = useState('generate');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [isBotExpanded, setIsBotExpanded] = useState(false);
  const { toast } = useToast();
  const botRef = useRef(null);
  const dragControls = useDragControls();

  const actions = {
    suggest: { fn: getAISuggestion, arg: prompt, label: 'Generate Outline', icon: Wand2, needsPrompt: true },
    improve: { fn: getContentImprovements, arg: currentContent, label: 'Enhance Note', icon: Sparkles },
    title: { fn: generateTitleSuggestion, arg: currentContent, label: 'Generate Title', icon: FileText },
    summarize: { fn: summarizeNote, arg: currentContent, label: 'Summarize', icon: AlertCircle },
    tags: { fn: suggestTags, arg: currentContent, label: 'Suggest Tags', icon: Tags },
    expand: { fn: expandNote, arg: currentContent, label: 'Expand Content', icon: Maximize },
    recommend: { fn: getContentRecommendations, arg: currentContent, label: 'Get Recommendations', icon: BookOpen },
    analyzeSentiment: { fn: analyzeSentiment, arg: currentContent, label: 'Analyze Sentiment', icon: MessageSquare },
    translateText: { fn: translateText, arg: currentContent, label: 'Translate', icon: Languages, needsLanguage: true },
    generateMindMap: { fn: generateMindMap, arg: currentContent, label: 'Generate Mind Map', icon: GitBranch },
  };

  const handleAction = useCallback(async (actionKey) => {
    const action = actions[actionKey];
    if (!action) {
      console.error(`Action "${actionKey}" is not defined.`);
      return;
    }

    if (loading || (action.needsPrompt && !prompt) || (!action.needsPrompt && !currentContent?.trim())) return;

    if (action.needsLanguage && !targetLanguage) {
      toast({ title: "Error", description: "Please select a target language for translation.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setAiSuggestion('');

    try {
      let result;
      if (action.needsLanguage) {
        result = await action.fn(action.arg, targetLanguage);
      } else {
        result = await action.fn(action.arg, MODELS.TEXT_GENERATION);
      }

      if (result?.trim()) {
        setAiSuggestion(result);
        toast({ title: "Success", description: `AI ${action.label} generated successfully.` });
      } else {
        throw new Error('No content generated');
      }
    } catch (error) {
      console.error(`Failed to ${actionKey}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${action.label}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [actions, loading, prompt, currentContent, targetLanguage, toast]);

  const handleCopyContent = useCallback(() => {
    navigator.clipboard.writeText(aiSuggestion).then(() => {
      toast({ title: "Copied", description: "AI suggestion copied to clipboard." });
    }).catch((error) => {
      console.error('Failed to copy content:', error);
      toast({
        title: "Error",
        description: "Failed to copy content. Please try again.",
        variant: "destructive",
      });
    });
  }, [aiSuggestion, toast]);

  const handleInsertContent = useCallback(() => {
    onInsert(aiSuggestion);
    toast({ title: "Inserted", description: "AI suggestion inserted into your note." });
  }, [aiSuggestion, onInsert, toast]);

  const isContentAvailable = currentContent?.trim().length > 0;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (botRef.current && !botRef.current.contains(event.target)) {
        setIsBotExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={botRef}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
          <motion.div
  className="cursor-pointer"
  onClick={() => setIsBotExpanded(!isBotExpanded)}
  whileHover={{
    scale: 1.05,
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
    background: 'linear-gradient(135deg, #66a6ff 0%, #89f7fe 100%)',
    transition: {
      duration: 0.3,
      ease: 'easeInOut'
    }
  }}
  whileTap={{
    scale: 0.95,
    boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.2,
      ease: 'easeInOut'
    }
  }}
  style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)',
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)'
  }}
>
  <ShimmerButton>
    <BotMessageSquare size={80} className="text-white" />
  </ShimmerButton>
</motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <p> noteX Bot </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AnimatePresence>
        {isBotExpanded && (
          <motion.div
            drag
            dragControls={dragControls}
            dragMomentum={false}
            dragElastic={0.1}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="absolute bottom-24 right-0 w-80"
          >
            <Card className="w-full shadow-lg bg-gray-800 border-gray-700 border-2 border-opacity-50">
              <CardHeader className="pb-2 cursor-move" onPointerDown={(e) => dragControls.start(e)}>
                <CardTitle className="flex items-center text-xl font-medium text-blue-400">
                  <Sparkles className="h-5 w-5 mr-2 text-yellow-300 animate-pulse" />
                  AI Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="generate" className="text-gray-300">Generate</TabsTrigger>
                    <TabsTrigger value="enhance" className="text-gray-300">Enhance</TabsTrigger>
                  </TabsList>
                  <AnimatePresence mode="wait">
                    <motion.div key={activeTab} {...fadeInOut}>
                      <TabsContent value="generate" className="space-y-4">
                        <Textarea
                          value={prompt}
                          onChange={(e) => setPrompt(e.target.value)}
                          placeholder="Enter a prompt for AI assistance"
                          className="bg-gray-700 text-white min-h-[100px] resize-y"
                        />
                        <div className="flex justify-end space-x-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => handleAction('suggest')}
                                  disabled={loading || !prompt}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Generate Outline</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  onClick={() => setPrompt('')}
                                  variant="outline"
                                  className="bg-gray-700 hover:bg-gray-600"
                                >
                                  <Eraser className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Clear Prompt</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </TabsContent>
                      <TabsContent value="enhance" className="space-y-3">
                        {!isContentAvailable ? (
                          <Alert variant="warning" className="bg-yellow-800 text-yellow-100 border-yellow-600">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              Please add content to your note first.
                            </AlertDescription>
                          </Alert>
                        ) : (
                          <div className="space-y-4">
                            <div className="grid grid-cols-4 gap-2">
                              {Object.entries(actions).filter(([key]) => key !== 'suggest' && key !== 'translateText').map(([key, { label, icon: Icon }]) => (
                                <TooltipProvider key={key}>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        onClick={() => handleAction(key)}
                                        disabled={loading}
                                        variant="outline"
                                        className="w-full h-10 bg-gray-700 text-gray-200 hover:bg-gray-600 border border-blue-400 border-opacity-50"
                                      >
                                        <Icon className="h-4 w-4" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>{label}</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              ))}
                            </div>
                            <div className="flex space-x-2">
                              <Select onValueChange={setTargetLanguage} value={targetLanguage}>
                                <SelectTrigger className="w-full bg-gray-700 text-gray-200 border border-blue-400 border-opacity-50">
                                  <SelectValue placeholder="Language" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="english">English</SelectItem>
                                  <SelectItem value="spanish">Spanish</SelectItem>
                                  <SelectItem value="french">French</SelectItem>
                                  <SelectItem value="german">German</SelectItem>
                                  <SelectItem value="chinese">Chinese</SelectItem>
                                  <SelectItem value="japanese">Japanese</SelectItem>
                                </SelectContent>
                              </Select>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      onClick={() => handleAction('translateText')}
                                      disabled={loading || !targetLanguage}
                                      className="bg-green-600 hover:bg-green-700"
                                    >
                                      <Languages className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Translate</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                    </motion.div>
                  </AnimatePresence>
                </Tabs>

                <AnimatePresence>
                  {aiSuggestion && (
                    <motion.div {...fadeInOut}>
                      <Card className="mt-4 border-t bg-gray-700 border border-blue-400 border-opacity-50">
                        <CardHeader>
                          <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-200">
                            AI Suggestion
                            <Badge variant="secondary" className="bg-blue-600 text-white">
                              {actions[activeTab === 'generate' ? 'suggest' : Object.keys(actions).find(key => actions[key].label === aiSuggestion.split('\n')[0])]?.label || 'Suggestion'}
                            </Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <ScrollArea className="h-[150px] w-full rounded-md border border-gray-600 p-2 bg-gray-800">
                            <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">{aiSuggestion}</p>
                          </ScrollArea>
                        </CardContent>
                        <CardFooter className="flex justify-end space-x-2 mt-2">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={handleCopyContent} size="sm" variant="outline" className="bg-gray-600 text-gray-200 hover:bg-gray-500">
                                  <Clipboard className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Copy to Clipboard</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button onClick={handleInsertContent} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                  <ArrowRight className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>Insert into Note</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
