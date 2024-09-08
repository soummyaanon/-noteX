'use client'

import { cn } from "../../lib/utils"
import React from "react"

export default function AuroraBackground({ className, children, ...props }) {
  return (
    <div className="min-h-screen w-full">
      <div
        className={cn(
          "relative flex flex-col min-h-screen w-full items-center justify-center bg-zinc-50 dark:bg-black text-slate-950 transition-bg",
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(`
              [--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]
              [--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]
              [--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]
              [background-image:var(--white-gradient),var(--aurora)]
              dark:[background-image:var(--dark-gradient),var(--aurora)]
              [background-size:300%,_200%]
              [background-position:50%_50%,50%_50%]
              invert dark:invert-0
              after:content-[""] after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)]
              after:dark:[background-image:var(--dark-gradient),var(--aurora)]
              after:[background-size:200%,_100%]
              after:animate-aurora after:[background-attachment:fixed] after:mix-blend-difference
              pointer-events-none
              absolute inset-0 opacity-30 will-change-transform
              mix-blend-mode:soft-light
              [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]
            `)}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-zinc-50/50 to-zinc-50 dark:via-black/50 dark:to-black pointer-events-none"></div>
        </div>
        <div className="relative z-10 w-full">
          {children}
        </div>
      </div>
    </div>
  )
}