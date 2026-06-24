"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Immediately kick off the 5-second timer for EVERYONE (including iOS)
    const timer = setTimeout(() => {
      setShowBanner(true);
    }, 5000);

    // 2. Separately listen for Chrome's native install capability
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    // If we are on Android and Chrome caught the PWA event, trigger the clean native prompt
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // Fallback for iOS / Desktop Safari / Brave where native prompts aren't supported
      alert("To install LivingGo on iOS: Tap the 'Share' button at the bottom of Safari, scroll down, and select 'Add to Home Screen'! 📲");
      setShowBanner(false);
    }
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] bg-white border border-gray-100 p-4 rounded-xl shadow-2xl z-50 flex justify-between items-center animate-fade-in">
      <div>
        <p className="font-black text-ink text-sm">Add LivingGo to Home Screen</p>
        <p className="text-[11px] font-medium text-muted-foreground">Access student PGs instantly like a native app.</p>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-clay text-white px-3 py-2 rounded-lg font-bold text-xs shrink-0 transition active:scale-95"
      >
        Install
      </button>
    </div>
  );
}