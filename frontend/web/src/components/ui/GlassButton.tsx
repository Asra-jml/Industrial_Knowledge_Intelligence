import React from 'react';
import Link from 'next/link';
import GlassSurface from '@/components/ui/GlassSurface';
import { cn } from '@/lib/utils';

export interface GlassButtonProps {
  children: React.ReactNode;
  href?: string;
  width?: number | string;
  height?: number | string;
  variant?: 'primary' | 'secondary' | 'blue';
  className?: string;
  onClick?: () => void;
}

export function GlassButton({
  children,
  href,
  width = 180,
  height = 50,
  variant = 'primary',
  className,
  onClick
}: GlassButtonProps) {
  const isBlue = variant === 'blue';
  const isPrimary = variant === 'primary';

  const brightness = isBlue ? 150 : isPrimary ? 150 : 120;
  const opacity = isBlue ? 0.3 : isPrimary ? 0.15 : 0.1;
  const blur = 16;
  
  // The SVG stroke color
  const strokeColor = isBlue ? '#60a5fa' : '#60a5fa';

  // Optional background tint
  const extraClasses = isBlue 
    ? 'border border-blue-500/50 bg-blue-600/40 hover:bg-blue-600/60 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
    : isPrimary 
      ? 'hover:bg-white/5 border-0' 
      : 'border border-white/20 hover:bg-white/5';

  const content = (
    <GlassSurface 
      width={width} 
      height={height} 
      borderRadius={8} 
      blur={blur} 
      brightness={brightness} 
      opacity={opacity} 
      className={cn("group transition-colors cursor-pointer relative", extraClasses, className)}
    >
      <div className="w-full h-full flex items-center justify-center text-white font-semibold text-sm">
        {children}
      </div>
      {/* Hover running line effect */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="100%" height="100%" rx="8" fill="none" stroke={strokeColor} strokeWidth="2" strokeDasharray="600" strokeDashoffset="600" className="transition-all duration-[600ms] ease-in-out group-hover:[stroke-dashoffset:0] opacity-0 group-hover:opacity-100" />
      </svg>
    </GlassSurface>
  );

  if (href) {
    return <Link href={href} onClick={onClick} className="inline-block">{content}</Link>;
  }

  return <button onClick={onClick} className="p-0 border-0 bg-transparent focus:outline-none inline-block">{content}</button>;
}
