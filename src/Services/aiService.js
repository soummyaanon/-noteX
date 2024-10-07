import { GoogleGenerativeAI } from '@google/generative-ai';

const MAX_CHARS = 3000;
const MAX_TOKENS = 1000;
const TITLE_MAX_CHARS = 155;
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

export const calculateAndCreateNote = async (prompt) => {
  try {
    const modelInstance = genAI.getGenerativeModel({ model: MODELS.TEXT_GENERATION });
    const result = await modelInstance.generateContent({
      contents: [{ role: 'user', parts: [{ text: `
Calculate the following and create a detailed note explaining the process and result:
${prompt}

Please follow this format:
1. Restate the calculation request
2. Show the step-by-step calculation process
3. Provide the final result
4. Explain the significance or context of this calculation (if applicable)
5. Suggest any related calculations or further explorations
      ` }] }],
      generationConfig: {
        maxOutputTokens: MAX_TOKENS,
        temperature: 0.3, // Lower temperature for more deterministic results
        topP: 0.95,
        topK: 40,
      },
    });
    return result.response.text().slice(0, MAX_CHARS);
  } catch (error) {
    console.error('Error calculating and creating note:', error);
    throw new Error('Failed to calculate and create note. Please try again.');
  }
};

export const getAISuggestion = (prompt) =>
  generateText(MODELS.TEXT_GENERATION, `Generate a comprehensive and well-structured note outline based on this prompt. Include main topics and subtopics: ${prompt}`, MAX_CHARS, 0.8);

export const getContentImprovements = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Significantly enhance and restructure the following note, improving clarity, depth, and organization. Add relevant examples and insights where appropriate:\n\n${text.slice(0, 1500)}`, MAX_CHARS, 0.7);

export const generateTitleSuggestion = (content) =>
  generateText(MODELS.TITLE_GENERATION, `Generate a concise, creative, and descriptive title (maximum 155 characters) that captures the essence of this note content: ${content.slice(0, 500)}`, TITLE_MAX_CHARS, 0.6);

export const summarizeNote = (text) =>
  generateText(MODELS.SUMMARIZATION, `Provide a comprehensive summary of the following text, capturing all key points and main ideas:\n\n${text.slice(0, 1500)}`, MAX_CHARS, 0.6);

export const suggestTags = (text) =>
  generateText(MODELS.TAG_SUGGESTION, `Suggest 5-7 highly relevant and specific tags for this note content, separated by commas. Consider both broad themes and specific topics:\n\n${text.slice(0, 500)}`, 150, 0.7);

export const expandNote = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Significantly expand on the following note by adding relevant details, examples, insights, and potential counterarguments. Ensure a logical flow of ideas:\n\n${text.slice(0, 1000)}`, MAX_CHARS, 0.8);

export const getContentRecommendations = (text) => generateText(
  MODELS.TEXT_GENERATION,
  `Based on the following note content, suggest relevant additional information, facts, or insights to enrich the note. Consider different perspectives and potential areas for further exploration:
  ${text.slice(0, 1500)}
  Provide 5-7 concise but detailed recommendations, each starting with a bullet point (•).`,
  MAX_CHARS,
  0.7
);

export const analyzeSentiment = (text) =>
  generateText(MODELS.SENTIMENT_ANALYSIS, `Conduct a nuanced sentiment analysis of the following text. Provide a detailed explanation of the overall sentiment, noting any shifts or complexities in tone:\n\n${text.slice(0, 1000)}`, 500, 0.5);

export const translateText = (text, targetLanguage) =>
  generateText(MODELS.LANGUAGE_TRANSLATION, `Translate the following text to ${targetLanguage}, ensuring to maintain the original tone and nuances:\n\n${text.slice(0, 1500)}`, MAX_CHARS, 0.3);

export const answerQuestion = (context, question) =>
  generateText(MODELS.QUESTION_ANSWERING, `Context: ${context.slice(0, 1500)}\n\nQuestion: ${question}\n\nProvide a comprehensive and well-reasoned answer:`, MAX_CHARS, 0.7);

export const generateMindMap = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Create a detailed mind map structure based on the following text. Use "-" for main topics, "*" for subtopics, and "+" for specific details or examples:\n\n${text.slice(0, 1000)}`, MAX_CHARS, 0.7);

export const suggestRelatedTopics = (text) =>
  generateText(MODELS.TEXT_GENERATION, `Suggest 7-10 related topics or areas of study based on the following note content. For each suggestion, provide a brief explanation of its relevance:\n\n${text.slice(0, 1000)}`, MAX_CHARS, 0.8);