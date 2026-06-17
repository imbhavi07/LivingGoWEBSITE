"use client";

import Image from 'next/image';
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

  const handleSkip = () => {
    setIntroState('fading');
    setTimeout(() => {
      setIntroState('done');
    }, 500);
  };

  useEffect(() => {
    const autoQuitTimer = setTimeout(() => {
      handleSkip();
    }, 5000); 

    return () => clearTimeout(autoQuitTimer);
  }, []);


  if (introState === 'done') {
    return null;
  }
  // bootup kardiya fix
  return (
    <div
      // THE CSS VARIABLE HERE LISTENS TO THE HEAD SCRIPT TO INSTANTLY HIDE ITSELF
      // Note: Swap 'bg-white' with the exact beige hex code of your video if needed!
      className={`${styles.overlay} fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#f9e7d3] transition-opacity duration-500 ease-in-out ${
        introState === 'fading' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="relative aspect-video w-full max-w-4xl mx-auto">
        <Image
          src="/bootup-animation.webp"
          alt="LivingGo Intro Animation"
          fill
          priority
          unoptimized
          className="object-contain"
        />
      </div>

      <button
        onClick={handleSkip}
        className="mt-8 px-4 py-2 text-xl font-semibold text-ink transition-colors hover:text-gray-700 flex items-center gap-2"
      >
        Skip Intro <ArrowRight className="h-6 w-6" aria-hidden />
      </button>
    </div>
  );
}