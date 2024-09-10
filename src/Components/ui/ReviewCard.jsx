"use client";

import React from "react";
import { InfiniteMovingCards } from "./infinite-moving-cards";

export function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "The secure cloud storage is a huge plus. I can access my notes from anywhere and never worry about losing them..",
    name: "Siri Nana",
    title: "Producthunt User",
  },
  {
    quote:
      "This promising notes APP. I'll try it. Glad to see AI powered notes. Congrats on this launch @soumyaranjan2000",
    name: "Rupi",
    title: "Producthunt User",
  },
  {
    quote: "As it's AI-powered, it gives you an advantage and makes it unique over the other apps. Keep it up bro..",
    name: "Sumit Sharma",
    title: "Producthunt User",
  },
  {
    quote:
      "I’m excited to see if NoteX can handle my chaotic notes as well as it claims my idea pile needs a superhero!",
    name: "Shawn Idrees",
    title: "Producthunt User",
  },
  {
    quote:
      "Love how the app combines simplicity with powerful AI features. The integration of Gemini Pro makes the note taking experience more efficient, and with TailwindCSS, the interface looks incredibly friendly. Everything about NoteX feels geared toward making productivity a breeze..",
    name: "Ayla Reynolds",
    title: "Producthunt User",
  },
];

export default InfiniteMovingCardsDemo;