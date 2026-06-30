import React, { ReactNode } from "react";

interface LiquidGlassProps {
  children: ReactNode;
  className?: string;
}

export const LiquidGlass: React.FC<LiquidGlassProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      {/* LAYER 1: The Glass Blur & Base Color
        Apple uses a very high saturation base.
      */}
      <div 
        className="absolute inset-0 z-0 rounded-[inherit] overflow-hidden 
                   bg-white/10 backdrop-blur-[20px] shadow-[0_8px_32px_rgba(0,0,0,0.1)]"
        style={{
          // Apple's "saturate" is the key to the glass look
          WebkitBackdropFilter: "blur(5px) saturate(140%)",
          backdropFilter: "blur(5px) saturate(170%)",
        }}
      />

      {/* LAYER 2: The Specular Highlight (The 'Liquid' Shine)
        This simulates light hitting a curved glass surface.
      */}
      <div className="absolute inset-0 z-0 rounded-[inherit] bg-gradient-to-br from-white/40 via-transparent to-transparent pointer-events-none" />

      {/* LAYER 3: Inner Glow Border
        A subtle 1px border that is brighter on top/left to define the edge.
      */}
      <div className="absolute inset-0 z-0 rounded-[inherit] ring-1 ring-inset ring-white/40 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};