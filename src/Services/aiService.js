import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_CHARS = 2000;
const MAX_TOKENS = 500;
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

const genAI = new GoogleGenerativeAI(API_KEY);

const MODELS = {
  TEXT_GENERATION: 'gemini-pro',
  SUMMARIZATION: 'gemini-pro',
  TITLE_GENERATION: 'gemini-pro',
  TAG_SUGGESTION: 'gemini-pro',
  SENTIMENT_ANALYSIS: 'gemini-pro',
  LANGUAGE_TRANSLATION: 'gemini-pro',
  QUESTION_ANSWERING: 'gemini-pro',
};

const generateText = async (model, prompt, maxLength = MAX_CHARS, temperature = 0.7) => {
  try {
    const modelInstance = genAI.getGenerativeModel({ model });
    const result = await modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: Math.min(maxLength, MAX_TOKENS),
        temperature,
        topP: 0.95,
        topK: 40,
      },
    });
    return result.response.text().slice(0, maxLength);
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error('Failed to generate text. Please try again.');
  }
};

export const getAISuggestion = (prompt) =>
  generateText(MODELS.TEXT_GENERATION, `Generate a detailed note outline based on this prompt: ${prompt}`, MAX_TOKENS, 0.8);

export const getContentImprovements = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Enhance and restructure the following note, significantly improving clarity, depth, and organization:\n\n${text.slice(0, 1000)}`, MAX_TOKENS, 0.7);

export const generateTitleSuggestion = (content) =>
  generateText(MODELS.TITLE_GENERATION, `Generate a concise, creative, and descriptive title for this note content: ${content.slice(0, 300)}`, 50, 0.6);

export const summarizeNote = (text) =>
  generateText(MODELS.SUMMARIZATION, `Summarize the following text:\n\n${text.slice(0, 1000)}`, MAX_TOKENS, 0.6);

export const suggestTags = (text) =>
  generateText(MODELS.TAG_SUGGESTION, `Suggest 3-5 relevant tags for this note content, separated by commas:\n\n${text.slice(0, 300)}`, 100, 0.7);

export const expandNote = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Significantly expand on the following note by adding relevant details, examples, and insights:\n\n${text.slice(0, 800)}`, MAX_TOKENS, 0.8);

export const getContentRecommendations = (text) => generateText(
  MODELS.TEXT_GENERATION,
  `Based on the following note content, suggest relevant additional information, facts, or insights to enrich the note:
  ${text.slice(0, 1000)}
  Provide 3-5 concise recommendations, each starting with a bullet point (•).`,
  MAX_TOKENS,
  0.7
);

// New services

export const analyzeSentiment = (text) =>
  generateText(MODELS.SENTIMENT_ANALYSIS, `Analyze the sentiment of the following text and provide a brief explanation:\n\n${text.slice(0, 500)}`, 200, 0.5);

export const translateText = (text, targetLanguage) =>
  generateText(MODELS.LANGUAGE_TRANSLATION, `Translate the following text to ${targetLanguage}:\n\n${text.slice(0, 1000)}`, MAX_TOKENS, 0.3);

export const answerQuestion = (context, question) =>
  generateText(MODELS.QUESTION_ANSWERING, `Context: ${context.slice(0, 1000)}\n\nQuestion: ${question}\n\nAnswer:`, MAX_TOKENS, 0.7);

export const generateMindMap = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Create a mind map structure based on the following text. Use "-" for main topics and "*" for subtopics:\n\n${text.slice(0, 800)}`, MAX_TOKENS, 0.7);

export const suggestRelatedTopics = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Suggest 5 related topics or areas of study based on the following note content:\n\n${text.slice(0, 500)}`, 200, 0.8);