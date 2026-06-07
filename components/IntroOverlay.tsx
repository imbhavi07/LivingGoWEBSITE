"use client";

import { ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import styles from './IntroOverlay.module.css';

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
// bootup kardiya fix
  return (
    <div
      // THE CSS VARIABLE HERE LISTENS TO THE HEAD SCRIPT TO INSTANTLY HIDE ITSELF
      // Note: Swap 'bg-white' with the exact beige hex code of your video if needed!
      className={`${styles.overlay} fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f7ebdc] transition-opacity duration-500 ease-in-out ${
        introState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <video
        src="/bootup-animation.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleVideoEnd}
        className="w-full max-w-6xl px-4"
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