"use client";
import React, { useState } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
} from "framer-motion";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { GlassButton } from "@/components/ui/GlassButton";

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: {
    name: string;
    link: string;
    icon?: JSX.Element;
  }[];
  className?: string;
}) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex max-w-fit fixed top-10 inset-x-0 mx-auto z-[5000] border border-white/10 rounded-full bg-[#050b14]/60 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]",
          className
        )}
      >
        <div className="flex pr-2 pl-8 py-2 items-center justify-center space-x-4 w-full h-full">
          <Link href="/" className="font-display font-bold text-white mr-4">
            IKI
          </Link>
          {navItems.map((navItem: any, idx: number) => (
            <Link
              key={`link=${idx}`}
              href={navItem.link}
              className={cn(
                "relative items-center flex space-x-1 text-white/70 hover:text-white transition-colors"
              )}
            >
              <span className="block sm:hidden">{navItem.icon}</span>
              <span className="hidden sm:block text-sm">{navItem.name}</span>
            </Link>
          ))}
          <GlassButton href="/knowledge-graph" variant="blue" width={140} height={40}>
            Open Dashboard
          </GlassButton>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
