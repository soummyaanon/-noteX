import React, { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getDocument, createDocument, updateDocument } from '../../Services/appwrite'
import { getAISuggestion, getContentImprovements, generateTitleSuggestion } from '../../Services/aiService'
import { marked } from 'marked'
import { Card, CardContent } from "../ui/card"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { Alert, AlertDescription } from "../ui/alert"
import { 
  Loader2, Bold, Italic, List, ListOrdered, Link, Image, Code, Quote, 
  Heading1, Heading2, Heading3, Sparkles, Menu, Save, Eye, Edit,
  ChevronDown, ChevronUp, X, Maximize2, Minimize2,
  AlignLeft, AlignCenter, AlignRight, Undo, Redo, Bot
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
import debounce from 'lodash.debounce'
import NoteXAssistant from '../AI/AIWritingAssistant'
import { motion, AnimatePresence } from 'framer-motion'



const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID

export default function NoteEditor({ userId }) {
  const { noteId } = useParams()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
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
  const editorRef = useRef(null)
  const fullscreenRef = useRef(null)

  useEffect(() => {
    if (noteId) {
      fetchNote()
    }
  }, [noteId])

  useEffect(() => {
    marked.setOptions({
      gfm: true,
      breaks: true,
      headerIds: false,
    })
    setPreview(marked(content))
  }, [content])

  const fetchNote = async () => {
    setLoading(true)
    try {
      const note = await getDocument(NOTES_COLLECTION_ID, noteId)
      setTitle(note.title)
      setContent(note.content)
      setUndoStack([{ title: note.title, content: note.content }])
    } catch (error) {
      setError('Failed to fetch note. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = useCallback(async () => {
    setLoading(true)
    setSaveStatus('Saving...')
    setError(null)
    try {
      const noteData = {
        title,
        content,
        owner: userId,
        updated_at: new Date().toISOString(),
        isFavorite: false,
      }

      if (noteId) {
        await updateDocument(NOTES_COLLECTION_ID, noteId, noteData)
      } else {
        noteData.created_at = new Date().toISOString()
        await createDocument(NOTES_COLLECTION_ID, noteData)
      }
      setSaveStatus('Saved')
      setTimeout(() => setSaveStatus(''), 2000)
    } catch (error) {
      setError(`Failed to save note: ${error.message}`)
      setSaveStatus('')
    } finally {
      setLoading(false)
    }
  }, [title, content, userId, noteId])

  const debouncedSave = useCallback(
    debounce(handleSave, 2000),
    [handleSave]
  )

  useEffect(() => {
    if (title || content) {
      setSaveStatus('Saving...')
      debouncedSave()
    }
    return () => {
      debouncedSave.cancel()
    }
  }, [title, content, debouncedSave])

  const insertMarkdown = (markdownSymbol, placeholder = '') => {
    const textarea = editorRef.current
    const { selectionStart, selectionEnd } = textarea
    const selectedText = content.substring(selectionStart, selectionEnd)
    const newContent = `${content.substring(0, selectionStart)}${markdownSymbol}${selectedText || placeholder}${markdownSymbol}${content.substring(selectionEnd)}`
    updateContent(newContent)
    textarea.focus()
    textarea.setSelectionRange(selectionStart + markdownSymbol.length, selectionEnd + markdownSymbol.length)
  }

  const handleImproveContent = async () => {
    setLoading(true)
    try {
      const improvedContent = await getContentImprovements(content)
      updateContent(improvedContent)
    } catch (error) {
      setError('Failed to improve content. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateTitle = async () => {
    setLoading(true)
    try {
      const suggestedTitle = await generateTitleSuggestion(content)
      updateTitle(suggestedTitle)
    } catch (error) {
      setError('Failed to generate title. Please try again.')
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

  const updateContent = (newContent) => {
    setUndoStack([...undoStack, { title, content }])
    setRedoStack([])
    setContent(newContent)
  }

  const updateTitle = (newTitle) => {
    setUndoStack([...undoStack, { title, content }])
    setRedoStack([])
    setTitle(newTitle)
  }

  const handleUndo = () => {
    if (undoStack.length > 0) {
      const previousState = undoStack[undoStack.length - 1]
      setRedoStack([...redoStack, { title, content }])
      setTitle(previousState.title)
      setContent(previousState.content)
      setUndoStack(undoStack.slice(0, -1))
    }
  }

  const handleRedo = () => {
    if (redoStack.length > 0) {
      const nextState = redoStack[redoStack.length - 1]
      setUndoStack([...undoStack, { title, content }])
      setTitle(nextState.title)
      setContent(nextState.content)
      setRedoStack(redoStack.slice(0, -1))
    }
  }

  const handleAlignment = (alignment) => {
    const textarea = editorRef.current
    const { selectionStart, selectionEnd } = textarea
    const selectedText = content.substring(selectionStart, selectionEnd)
    const alignedText = `<div style="text-align: ${alignment}">${selectedText}</div>`
    const newContent = `${content.substring(0, selectionStart)}${alignedText}${content.substring(selectionEnd)}`
    updateContent(newContent)
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
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`p-4 ${theme === 'dark' ? 'dark' : ''}`}
        ref={fullscreenRef}
      >
        <Card className="w-full max-w-5xl mx-auto shadow-lg overflow-hidden bg-white dark:bg-gray-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
              <Input
                type="text"
                value={title}
                onChange={(e) => updateTitle(e.target.value)}
                placeholder="Untitled Note"
                className="text-2xl font-bold border-none focus:ring-0 p-0 bg-transparent flex-grow mr-2 mb-2 sm:mb-0"
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
                      {markdownButtons.map(({ icon: Icon, action, tooltip }, index) => (
                        <Tooltip key={index}>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="sm" onClick={action}>
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
                  <div className="flex items-center space-x-2">
                    <Button onClick={handleUndo} disabled={undoStack.length === 0} size="sm" variant="ghost">
                      <Undo className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleRedo} disabled={redoStack.length === 0} size="sm" variant="ghost">
                      <Redo className="h-4 w-4" />
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
                <div
                  className="prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[400px] overflow-auto mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner"
                  style={{ fontSize: `${fontSize}px` }}
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <Textarea
                  ref={editorRef}
                  value={content}
                  onChange={(e) => updateContent(e.target.value)}
                  placeholder="Start writing your note here..."
                  className="min-h-[400px] resize-none w-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-inner focus:ring-2 focus:ring-blue-500"
                  style={{ fontSize: `${fontSize}px` }}
                />
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
                  className="w-32"
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">{fontSize}px</span>
              </div>
              <div className="flex space-x-2">
                <Button onClick={handleGenerateTitle} disabled={loading || !content} size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate Title
                </Button>
                <Button onClick={handleImproveContent} disabled={loading || !content} size="sm" variant="outline">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve
                </Button>
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
          onInsert={(suggestion) => updateContent(content + suggestion)}
          currentContent={content}
          onUpdateTitle={updateTitle}
          isFullscreen={isFullscreen}
        />


      </motion.div>
    </AnimatePresence>
  )
}