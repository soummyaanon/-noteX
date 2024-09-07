import React from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { cn } from "../../lib/utils";
import { Github, Linkedin, Mail } from 'lucide-react';
import { RiTwitterXFill } from "react-icons/ri";

export default function AdvancedFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: 'https://github.com/soummyaanon' },
    { name: 'Twitter', icon: RiTwitterXFill, url: 'https://twitter.com/Thesourya2000' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/soumyapanda12/' },
  ];

  return (
    <footer className={cn("mt-auto py-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/90 to-background/80 backdrop-blur-sm border-t")}>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <h2 className="text-lg font-semibold text-primary">noteX</h2>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Discover the power of AI-powered note-taking with noteX.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <TooltipProvider key={social.name}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200">
                        <a href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.name}>
                          <social.icon className="w-5 h-5" />
                        </a>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Follow us on {social.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            <Button variant="link" size="sm" className="text-primary hover:underline mt-4">
              <a href="https://youtu.be/21KHxlUH61I" target="_blank" rel="noopener noreferrer">FAQ</a>
            </Button>
          </div>
          <div className="flex flex-col items-center md:items-end space-y-4">
            <a href="https://www.producthunt.com/posts/notex-2?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-notex&#0045;2" target="_blank" rel="noopener noreferrer">
              <img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=487462&theme=dark" alt="noteX - Discover the power of AI-powered note-taking with noteX | Product Hunt" style={{ width: '250px', height: '54px' }} width="250" height="54" />
            </a>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {currentYear} noteX. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Crafted with ❤️ by{' '}
            <a href="https://soumya-ranjan.tech" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              Soumyaranjan Panda
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}