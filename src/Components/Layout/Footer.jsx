import React from 'react';
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Label } from "../ui/label";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { cn } from "../../lib/utils";
import { Github, Linkedin, Mail, ArrowRight } from 'lucide-react';
import { RiTwitterXFill } from "react-icons/ri";

export default function AdvancedFooter() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'GitHub', icon: Github, url: 'https://github.com/soummyaanon' },
    { name: 'Twitter', icon: RiTwitterXFill, url: 'https://twitter.com/Thesourya2000' },
    { name: 'LinkedIn', icon: Linkedin, url: 'https://www.linkedin.com/in/soumyapanda12/' },
  ];

  const footerLinks = [
    { name: 'About', href: '/about' },
    { name: 'Privacy Policy', href: '/privacy-policy' },
    { name: 'Terms of Service', href: '/terms-of-service' },
    { name: 'Contact', href: '/contact' },
    { name: 'FAQ', href: '/faq' },
  ];

  return (
    <footer className={cn("mt-auto py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-background via-background/90 to-background/80 backdrop-blur-sm border-t")}>
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-primary">noteX</h2>
            <p className="text-sm text-muted-foreground">
              Empowering collaboration through innovative note-taking solutions.
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
          </div>
          <nav className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.name}>
                  <Button variant="link" size="sm" className="text-muted-foreground hover:text-primary transition-colors duration-200 p-0">
                    <a href={link.href}>{link.name}</a>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-primary">Feedback</h3>
            <div className="space-y-2">
              <Label htmlFor="feedback-email" className="text-sm font-medium text-muted-foreground">
                Send us your feedback
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors duration-200">
                      <a id="feedback-email" href="mailto:anonymousudgp9@gmail.com" aria-label="Send Feedback">
                        <Mail className="w-5 h-5" />
                      </a>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send us your feedback</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-xs text-muted-foreground">
              We value your feedback. Please send us an email to help us improve.
            </p>
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