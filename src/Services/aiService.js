/**
 * @file ai-functions.js
 * @description Optimized functions for interacting with Google's Generative AI API
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Constants
const MAX_CHARS = 2000;
const MAX_TOKENS = 500;
const API_KEY = import.meta.env.VITE_GOOGLE_AI_API_KEY;

// Initialize the Google Generative AI client
const genAI = new GoogleGenerativeAI(API_KEY);

// Model configurations
const MODELS = {
  TEXT_GENERATION: 'gemini-pro',
  SUMMARIZATION: 'gemini-pro',
  TITLE_GENERATION: 'gemini-pro',
  TAG_SUGGESTION: 'gemini-pro',
};

/**
 * Generate text using a specified AI model
 * @param {string} model - The AI model to use
 * @param {string} prompt - The input prompt for text generation
 * @param {number} [maxLength=MAX_CHARS] - Maximum length of the generated text
 * @param {number} [temperature=0.7] - Temperature for text generation
 * @returns {Promise<string>} Generated text
 */
const generateText = async (model, prompt, maxLength = MAX_CHARS, temperature = 0.7) => {
  try {
    const modelInstance = genAI.getGenerativeModel({ model });
    const result = await modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: Math.min(maxLength, MAX_TOKENS),
        temperature,
        topP: 0.95,
      },
    });
    return result.response.text().slice(0, maxLength);
  } catch (error) {
    console.error('Error generating text:', error);
    throw new Error('Failed to generate text. Please try again.');
  }
};

/**
 * Generate a detailed note outline based on a prompt
 * @param {string} prompt - The input prompt
 * @returns {Promise<string>} Generated note outline
 */
export const getAISuggestion = (prompt) =>
  generateText(MODELS.TEXT_GENERATION, `Generate a detailed note outline based on this prompt: ${prompt}`, MAX_TOKENS, 0.8);

/**
 * Enhance and restructure a given note
 * @param {string} text - The original note content
 * @returns {Promise<string>} Improved note content
 */
export const getContentImprovements = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Enhance and restructure the following note, significantly improving clarity, depth, and organization:\n\n${text.slice(0, 1000)}`, MAX_TOKENS, 0.7);

/**
 * Generate a title suggestion for a note
 * @param {string} content - The note content
 * @returns {Promise<string>} Suggested title
 */
export const generateTitleSuggestion = (content) =>
  generateText(MODELS.TITLE_GENERATION, `Generate a concise, creative, and descriptive title for this note content: ${content.slice(0, 300)}`, 50, 0.6);

/**
 * Summarize a given text
 * @param {string} text - The text to summarize
 * @returns {Promise<string>} Summarized text
 */
export const summarizeNote = (text) =>
  generateText(MODELS.SUMMARIZATION, `Summarize the following text:\n\n${text.slice(0, 1000)}`, MAX_TOKENS, 0.6);

/**
 * Suggest tags for a given note content
 * @param {string} text - The note content
 * @returns {Promise<string>} Suggested tags
 */
export const suggestTags = (text) =>
  generateText(MODELS.TAG_SUGGESTION, `Suggest 3-5 relevant tags for this note content, separated by commas:\n\n${text.slice(0, 300)}`, 100, 0.7);

/**
 * Expand a note with additional details and insights
 * @param {string} text - The original note content
 * @returns {Promise<string>} Expanded note content
 */
export const expandNote = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Significantly expand on the following note by adding relevant details, examples, and insights:\n\n${text.slice(0, 800)}`, MAX_TOKENS, 0.8);

/**
 * Get content recommendations based on note content
 * @param {string} text - The note content
 * @returns {Promise<string>} Content recommendations
 */
export const getContentRecommendations = (text) => generateText(
  MODELS.TEXT_GENERATION,
  `Based on the following note content, suggest relevant additional information, facts, or insights to enrich the note:
  ${text.slice(0, 1000)}
  Provide 3-5 concise recommendations, each starting with a bullet point (•).`,
  MAX_TOKENS,
  0.7
);