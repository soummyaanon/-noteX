import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Loader2, Wand2, Sparkles, AlertCircle, Clipboard, Send, Eraser, ArrowRight, FileText, Tags, Maximize, BookOpen, MessageSquare, Languages, GitBranch } from 'lucide-react';
import { getAISuggestion, getContentImprovements, generateTitleSuggestion, summarizeNote, suggestTags, expandNote, getContentRecommendations, analyzeSentiment, translateText, generateMindMap } from '../../Services/aiService';
import { useToast } from "../ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Alert, AlertDescription } from "../ui/alert";
import { ScrollArea } from "../ui/scroll-area";
import { motion, AnimatePresence } from 'framer-motion';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { Badge } from "../ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

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
  const [copiedText, setCopiedText] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    console.log("Current content:", currentContent);
  }, [currentContent]);

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
      setCopiedText(aiSuggestion);
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

  return (
    <Card className="w-full mt-4 shadow-md bg-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-xl font-medium text-blue-400">
          <Sparkles className="h-5 w-5 mr-2 text-yellow-300 animate-pulse" />
          AI Writing Assistant
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
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Input
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Enter a prompt for AI assistance"
                    className="bg-gray-700 text-white flex-grow"
                  />
                  <div className="flex space-x-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => handleAction('suggest')}
                            disabled={loading || !prompt}
                            className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
                          >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Generate Detailed Outline</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            onClick={() => setPrompt('')}
                            variant="outline"
                            className="w-full sm:w-auto bg-gray-700 hover:bg-gray-600"
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
                </div>
              </TabsContent>
              <TabsContent value="enhance" className="space-y-3">
                {!isContentAvailable ? (
                  <Alert variant="warning" className="bg-yellow-800 text-yellow-100 border-yellow-600">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please add some content to your note before using the enhance features.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {Object.entries(actions).filter(([key]) => key !== 'suggest' && key !== 'translateText').map(([key, { label, icon: Icon }]) => (
                        <TooltipProvider key={key}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                onClick={() => handleAction(key)}
                                disabled={loading}
                                variant="outline"
                                size="icon"
                                className="w-full h-12 bg-gray-700 text-gray-200 hover:bg-gray-600"
                              >
                                {loading ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <Icon className="h-5 w-5" />
                                )}
                                <span className="sr-only">{label}</span>
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
                        <SelectTrigger className="w-[180px] bg-gray-700 text-gray-200">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="english">English</SelectItem>
                          <SelectItem value ="hindi">Hindi</SelectItem>
                          <SelectItem value="portuguese">Portuguese</SelectItem>
                          <SelectItem value="french">French</SelectItem>
                          <SelectItem value="spanish">Spanish</SelectItem>
                          <SelectItem value="german">German</SelectItem>
                          <SelectItem value="italian">Italian</SelectItem>
                          <SelectItem value="japanese">Japanese</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={() => handleAction('translateText')}
                        disabled={loading || !targetLanguage}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4 mr-2" />}
                        Translate
                      </Button>
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
              <Card className="mt-4 border-t bg-gray-700">
                <CardHeader>
                  <CardTitle className="text-sm font-medium flex items-center justify-between text-gray-200">
                    AI Suggestion
                    <Badge variant="secondary" className="bg-blue-600 text-white">
                      {actions[activeTab === 'generate' ? 'suggest' : Object.keys(actions).find(key => actions[key].label === aiSuggestion.split('\n')[0])]?.label || 'Suggestion'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px] w-full rounded-md border border-gray-600 p-2 bg-gray-800">
                    <p className="text-sm leading-relaxed whitespace-pre-wrap text-gray-300">{aiSuggestion}</p>
                  </ScrollArea>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2 mt-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button onClick={handleCopyContent} size="sm" variant="outline" className="w-full sm:w-auto bg-gray-600 text-gray-200 hover:bg-gray-500">
                          <Clipboard className="h-4 w-4 mr-1" />
                          Copy
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
                        <Button onClick={handleInsertContent} size="sm" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700">
                          <ArrowRight className="h-4 w-4 mr-1" />
                          Insert
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
  );
}