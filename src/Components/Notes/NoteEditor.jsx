import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDocument, createDocument, updateDocument } from '../../Services/appwrite'
import { getContentImprovements, generateTitleSuggestion } from '../../Services/aiService'
import { marked } from 'marked'
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Alert, AlertDescription } from "../ui/alert"
import { 
  Loader2, Bold, Italic, List, ListOrdered, Link, Image, Code, Quote, 
  Heading1, Heading2, Heading3, Sparkles, Menu, Save, Eye, Edit,
  ChevronDown, ChevronUp, X, Maximize2, Minimize2,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Mic, Type
} from 'lucide-react'
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Slider } from "../ui/slider"
import { Switch } from "../ui/switch"
import debounce from 'lodash.debounce'
import NoteXAssistant from '../AI/AIWritingAssistant'
import { motion, AnimatePresence } from 'framer-motion'
import { useToast } from "../ui/use-toast"

// Import Google Fonts
import '@fontsource/caveat'
import '@fontsource/dancing-script'
import '@fontsource/indie-flower'
import '@fontsource/pacifico'
import '@fontsource/permanent-marker'
import '@fontsource/shadows-into-light'
import '@fontsource/amatic-sc'

const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID

const fontOptions = [
  { name: 'Default', value: 'inherit' },
  { name: 'Caveat', value: 'Caveat' },
  { name: 'Dancing Script', value: 'Dancing Script' },
  { name: 'Indie Flower', value: 'Indie Flower' },
  { name: 'Pacifico', value: 'Pacifico' },
  { name: 'Permanent Marker', value: 'Permanent Marker' },
  { name: 'Shadows Into Light', value: 'Shadows Into Light' },
  { name: 'Amatic SC', value: 'Amatic SC' },
]

export default function NoteEditor({ userId }) {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const [note, setNote] = useState({ title: '', content: '' })
  const [preview, setPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isPreview, setIsPreview] = useState(false)
  const [saveStatus, setSaveStatus] = useState('')
  const [showToolbar, setShowToolbar] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [fontSize, setFontSize] = useState(16)
  const [theme, setTheme] = useState('light')
  const [undoStack, setUndoStack] = useState([])
  const [redoStack, setRedoStack] = useState([])
  const [speechRecognition, setSpeechRecognition] = useState({
    isListening: false,
    transcript: '',
    isSupported: false,
    interimTranscript: '',
    finalTranscript: '',
  })
  const [isAutoSaveEnabled, setIsAutoSaveEnabled] = useState(false)
  const [selectedFont, setSelectedFont] = useState('inherit')

  const editorRef = useRef(null)
  const fullscreenRef = useRef(null)
  const lastSavedRef = useRef({ title: '', content: '', selectedFont: 'inherit' })
  const recognitionRef = useRef(null)
  const { toast } = useToast()

  useEffect(() => {
    if (noteId) fetchNote()
    initializeSpeechRecognition()
  }, [noteId])

  useEffect(() => {
    setPreview(marked(note.content))
  }, [note.content])

  useEffect(() => {
    if (speechRecognition.finalTranscript) {
      setNote(prevNote => ({
        ...prevNote,
        content: prevNote.content + ' ' + speechRecognition.finalTranscript
      }))
      setSpeechRecognition(prev => ({ ...prev, finalTranscript: '' }))
    }
  }, [speechRecognition.finalTranscript])

  const fetchNote = async () => {
    setLoading(true)
    try {
      const fetchedNote = await getDocument(NOTES_COLLECTION_ID, noteId)
      setNote({ title: fetchedNote.title, content: fetchedNote.content })
      setSelectedFont(fetchedNote.selectedFont || 'inherit')
      setUndoStack([{ title: fetchedNote.title, content: fetchedNote.content }])
      lastSavedRef.current = { title: fetchedNote.title, content: fetchedNote.content, selectedFont: fetchedNote.selectedFont || 'inherit' }
    } catch (error) {
      setError('Failed to fetch note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const initializeSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      setSpeechRecognition(prev => ({ ...prev, isSupported: true }))
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true

      recognitionRef.current.onresult = (event) => {
        let interimTranscript = ''
        let finalTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          } else {
            interimTranscript += event.results[i][0].transcript
          }
        }

        setSpeechRecognition(prev => ({
          ...prev,
          interimTranscript,
          finalTranscript: prev.finalTranscript + finalTranscript
        }))
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error)
        setSpeechRecognition(prev => ({ ...prev, isListening: false }))
        toast({
          title: "Speech Recognition Error",
          description: `Error: ${event.error}. Please try again.`,
          variant: "destructive",
        })
      }

      recognitionRef.current.onend = () => {
        setSpeechRecognition(prev => ({ ...prev, isListening: false }))
      }
    } else {
      console.log('Speech recognition not supported')
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try a different browser.",
        variant: "destructive",
      })
    }
  }

  const handleSave = useCallback(async () => {
    if (note.title === lastSavedRef.current.title && 
        note.content === lastSavedRef.current.content && 
        selectedFont === lastSavedRef.current.selectedFont) {
      return
    }

    setLoading(true)
    setSaveStatus('Saving...')
    setError(null)
    try {
      const noteData = {
        ...note,
        owner: userId,
        updated_at: new Date().toISOString(),
        isFavorite: false,
        selectedFont: selectedFont,
      }

      if (noteId) {
        await updateDocument(NOTES_COLLECTION_ID, noteId, noteData)
      } else {
        noteData.created_at = new Date().toISOString()
        const newNote = await createDocument(NOTES_COLLECTION_ID, noteData)
        navigate(`/notes/${newNote.$id}`, { replace: true })
      }
      lastSavedRef.current = { ...note, selectedFont }
      setSaveStatus('Saved')
      setTimeout(() => setSaveStatus(''), 3000)
    } catch (error) {
      setError(`Failed to save note: ${error.message}`)
      setSaveStatus('')
    } finally {
      setLoading(false)
    }
  }, [note, userId, noteId, navigate, selectedFont])

  const debouncedSave = useCallback(debounce(handleSave, 3000), [handleSave])

  useEffect(() => {
    if (isAutoSaveEnabled && (
      note.title !== lastSavedRef.current.title || 
      note.content !== lastSavedRef.current.content ||
      selectedFont !== lastSavedRef.current.selectedFont
    )) {
      setSaveStatus('Saving...')
      debouncedSave()
    }
    return () => debouncedSave.cancel()
  }, [note, debouncedSave, isAutoSaveEnabled, selectedFont])

  const updateNote = useCallback((updates) => {
    setUndoStack(prevStack => [...prevStack, note])
    setRedoStack([])
    setNote(prevNote => ({ ...prevNote, ...updates }))
  }, [note])

  const insertMarkdown = (markdownSymbol, placeholder = '') => {
    const textarea = editorRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const selectedText = note.content.substring(selectionStart, selectionEnd)
    const newContent = `${note.content.substring(0, selectionStart)}${markdownSymbol}${selectedText || placeholder}${markdownSymbol}${note.content.substring(selectionEnd)}`
    updateNote({ content: newContent })
    textarea.focus()
    textarea.setSelectionRange(selectionStart + markdownSymbol.length, selectionEnd + markdownSymbol.length)
  }

  const handleImproveContent = async () => {
    setLoading(true)
    try {
      const improvedContent = await getContentImprovements(note.content)
      updateNote({ content: improvedContent })
      toast({
        title: "Content Improved",
        description: "Your note content has been enhanced by AI.",
      })
    } catch (error) {
      setError('Failed to improve content. Please try again.')
      toast({
        title: "Error",
        description: "Failed to improve content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTitle = async () => {
    setLoading(true)
    try {
      const suggestedTitle = await generateTitleSuggestion(note.content)
      updateNote({ title: suggestedTitle })
      toast({
        title: "Title Generated",
        description: "A new title has been generated for your note.",
      })
    } catch (error) {
      setError('Failed to generate title. Please try again.')
      toast({
        title: "Error",
        description: "Failed to generate title. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      fullscreenRef.current.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1]
      setRedoStack([...redoStack, note])
      setNote(previousState)
      setUndoStack(undoStack.slice(0, -1))
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1]
      setUndoStack([...undoStack, note])
      setNote(nextState)
      setRedoStack(redoStack.slice(0, -1))
    }
  }

  const handleAlignment = (alignment) => {
    const textarea = editorRef.current
    if (!textarea) return

    const { selectionStart, selectionEnd } = textarea
    const selectedText = note.content.substring(selectionStart, selectionEnd)
    const alignedText = `<div style="text-align: ${alignment}">${selectedText}</div>`
    const newContent = `${note.content.substring(0, selectionStart)}${alignedText}${note.content.substring(selectionEnd)}`
    updateNote({ content: newContent })
  }

  const toggleSpeechToText = () => {
    if (!speechRecognition.isSupported) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please try a different browser.",
        variant: "destructive",
      })
      return
    }

    if (speechRecognition.isListening) {
      recognitionRef.current.stop()
      setSpeechRecognition(prev => ({ ...prev, isListening: false }))
      toast({
        title: "Speech Recognition Stopped",
        description: "Speech-to-text has been stopped.",
      })
    } else {
      recognitionRef.current.start()
      setSpeechRecognition(prev => ({ ...prev, isListening: true }))
      toast({
        title: "Speech Recognition Started",
        description: "Start speaking. Your words will be transcribed into the note.",
      })
    }
  }

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
    { icon: AlignLeft, action: () => handleAlignment('left'), tooltip: 'Align Left' },
    { icon: AlignCenter, action: () => handleAlignment('center'), tooltip: 'Align Center' },
    { icon: AlignRight, action: () => handleAlignment('right'), tooltip: 'Align Right' },
    { 
      icon: Type, 
      action: () => {}, 
      tooltip: 'Select Font',
      dropdown: (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <Type className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {fontOptions.map((font) => (
              <DropdownMenuItem key={font.value} onSelect={() => setSelectedFont(font.value)}>
                <span style={{ fontFamily: font.value }}>{font.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`p-2 sm:p-4 ${theme === 'dark' ? 'dark' : ''}`}
        ref={fullscreenRef}
      >
        <Card className="w-full mx-auto shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardContent className="p-2 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <Input
                type="text"
                value={note.title}
                onChange={(e) => updateNote({ title: e.target.value })}
                placeholder="Untitled Note"
                className="text-xl sm:text-2xl font-bold border-none focus:ring-0 p-0 bg-transparent flex-grow mr-2 mb-2 sm:mb-0"
              />
              <div className="flex items-center space-x-2 flex-shrink-0">
                {saveStatus && (
                  <motion.span
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-sm text-gray-500 dark:text-gray-400"
                  >
                    {saveStatus}
                  </motion.span>
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)}>
                        {isPreview ? <Edit className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isPreview ? 'Edit' : 'Preview'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                        {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
                      Toggle Theme
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{ height: showToolbar ? 'auto' : 0, opacity: showToolbar ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              {!isPreview && (
                <div className="flex flex-wrap items-center justify-between mb-4 bg-gray-100 dark:bg-gray-700 p-2 rounded-lg">
                  <div className="flex flex-wrap items-center space-x-1 mb-2 sm:mb-0">
                    <TooltipProvider>
                      {markdownButtons.map(({ icon: Icon, action, tooltip, dropdown }, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            {dropdown || (
                              <Button variant="ghost" size="sm" onClick={action}>
                                <Icon className="h-4 w-4" />
                              </Button>
                            )}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{tooltip}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleUndo} disabled={undoStack.length === 0} size="sm" variant="ghost">
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleRedo} disabled={redoStack.length === 0} size="sm" variant="ghost">
                      <Redo className="h-4 w-4" />
                    </Button>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2 bg-blue-100 dark:bg-gray-500 px-2 py-1 rounded-2xl">
                            <Switch
                              id="auto-save"
                              checked={isAutoSaveEnabled}
                              onCheckedChange={setIsAutoSaveEnabled}
                            />
                            <label htmlFor="auto-save" className="text-sm font-medium text-blue-800 dark:text-blue-200">
                              Auto-save
                            </label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isAutoSaveEnabled ? 'Disable auto-save' : 'Enable auto-save'}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    {!isAutoSaveEnabled && (
                      <Button onClick={handleSave} disabled={loading} size="sm" variant="outline">
                        <Save className="h-4 w-4 mr-2" />
                        Save
                      </Button>
                    )}
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
                <div
                  className="prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[200px] sm:min-h-[300px] md:min-h-[400px] overflow-auto mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner"
                  style={{ fontSize: `${fontSize}px`, fontFamily: selectedFont }}
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <div className="relative">
                  <Textarea
                    ref={editorRef}
                    value={note.content}
                    onChange={(e) => updateNote({ content: e.target.value })}
                    placeholder="Start writing your note here..."
                    className="min-h-[200px] sm:min-h-[300px] md:min-h-[400px] resize-none w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: `${fontSize}px`, fontFamily: selectedFont }}
                  />
                  {speechRecognition.isListening && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute bottom-4 left-4 right-4 bg-blue-100 dark:bg-blue-900 p-2 rounded-lg"
                    >
                      <div className="flex items-center space-x-2">
                        <motion.div
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="w-3 h-3 bg-blue-500 rounded-full"
                        />
                        <p className="text-sm text-blue-800 dark:text-blue-200">Listening...</p>
                      </div>
                      {speechRecognition.interimTranscript && (
                        <p className="text-sm text-blue-600 dark:text-blue-300 mt-1">
                          {speechRecognition.interimTranscript}
                        </p>
                      )}
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">Font Size:</span>
                <Slider
                  min={12}
                  max={24}
                  step={1}
                  value={[fontSize]}
                  onValueChange={(value) => setFontSize(value[0])}
                  className="w-24 sm:w-32"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{fontSize}px</span>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleGenerateTitle} disabled={loading || !note.content} size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Title
                </Button>
                <Button onClick={handleImproveContent} disabled={loading || !note.content} size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={toggleSpeechToText}
                        size="sm"
                        variant={speechRecognition.isListening ? "default" : "outline"}
                        disabled={!speechRecognition.isSupported}
                      >
                        <Mic className={`h-4 w-4 ${speechRecognition.isListening ? 'text-white' : ''}`} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{speechRecognition.isListening ? 'Stop Listening' : 'Start Speech-to-Text'}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
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

        <NoteXAssistant
          onInsert={(suggestion) => updateNote({ content: note.content + suggestion })}
          currentContent={note.content}
          onUpdateTitle={(newTitle) => updateNote({ title: newTitle })}
          isFullscreen={isFullscreen}
        />
      </motion.div>
    </AnimatePresence>
  )
}