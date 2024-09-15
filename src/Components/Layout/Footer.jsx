import React from 'react';
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/utils";
import { Github, Linkedin } from 'lucide-react';
import { RiTwitterXFill } from "react-icons/ri";

export default function MinimalisticFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: 'https://github.com/soummyaanon' },
    { name: 'Twitter', icon: RiTwitterXFill, url: 'https://twitter.com/Thesourya2000' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/soumyapanda12/' },
  ];

  return (
    <footer className={cn("mt-auto py-4 px-4 bg-background/80 backdrop-blur-sm border-t")}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            {socialLinks.map((social) => (
              <TooltipProvider key={social.name}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary">
                      <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                        <social.icon className="w-5 h-5" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow on {social.name}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <a href="https://youtu.be/21KHxlUH61I" target="_blank" rel="noopener noreferrer">FAQ</a>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
              <a href="/about" rel="noopener noreferrer">About</a>
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-center sm:space-x-4 text-sm text-muted-foreground">
            <p>© {currentYear} noteX</p>
            <p className="hidden sm:inline">•</p>
            <p>
              Made by{' '}
              <a href="https://soumya-ranjan.tech" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                Soumyaranjan Panda
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}