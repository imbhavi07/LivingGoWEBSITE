"use client";

import { ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';

export default function IntroOverlay() {
  const [introState, setIntroState] = useState<'playing' | 'fading' | 'done'>('playing');

  useEffect(() => {
    if (sessionStorage.getItem('hasSeenIntro')) {
      setIntroState('done');
    } else {
      sessionStorage.setItem('hasSeenIntro', 'true');
    }
  }, []);

  const handleVideoEnd = () => {
    setIntroState('fading');
    setTimeout(() => {
      setIntroState('done');
    }, 500); 
  };

  if (introState === 'done') {
    return null;
  }

  return (
    <div
      // THE CSS VARIABLE HERE LISTENS TO THE HEAD SCRIPT TO INSTANTLY HIDE ITSELF
      style={{ display: 'var(--intro-display, flex)' }}
      // Note: Swap 'bg-white' with the exact beige hex code of your video if needed!
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f7ebdc] transition-opacity duration-500 ease-in-out ${
        introState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video 
        src="/bootup-animation.mp4" 
        poster="/bootup-first-frame.webp" // The instant fallback image
        autoPlay 
        muted       // CRITICAL: Browsers will block autoplay if not muted..
        playsInline // CRITICAL: Prevents iOS from opening the video in fullscreen mode
        preload="auto" 
        className="w-full h-full object-cover" 
/>
      
      <button
        onClick={handleVideoEnd}
        className="mt-8 px-4 py-2 text-xl font-semibold text-ink transition-colors hover:text-gray-700 flex items-center gap-2"
      >
        Skip Intro <ArrowRight className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}