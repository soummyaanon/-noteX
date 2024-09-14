"use client";
import React from 'react';
import { TextGenerateEffect } from "../ui/text-generate-effect";

const words = `
  Welcome to NoteX, the ultimate note-taking application designed to enhance your productivity and streamline your workflow. 
  Whether you're looking to organize your thoughts, get AI-powered assistance, or access your notes from anywhere, NoteX has got you covered. 
  With features like Gemini Pro insights, Speech-to-Text, and Smart Semantic Search, NoteX offers a seamless and innovative experience. 
  Crafted with care by Soumyaranjan Panda, NoteX is here to revolutionize the way you take notes.
`;

export function TextGenerateEffectDemo() {
  return (
    <div className="text-center" style={{ fontFamily: 'SUSE, sans-serif', fontSize: '1rem', lineHeight: '1.8', padding: '1rem' }}>
      <TextGenerateEffect words={words} />
    </div>
  );
}

export default TextGenerateEffectDemo;