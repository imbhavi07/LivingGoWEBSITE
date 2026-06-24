"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
  prompt(): Promise<void>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // 1. Chrome fires this event when it detects a valid PWA
    window.addEventListener("beforeinstallprompt", (e) => {
      const promptEvent = e as BeforeInstallPromptEvent;
      promptEvent.preventDefault(); 
      setDeferredPrompt(promptEvent);
      
      // 2. Wait 5 seconds, then show OUR custom banner
      setTimeout(() => {
        setShowBanner(true);
      }, 5000);
    });
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // 3. The user clicked! Now we are allowed to show the native prompt
    deferredPrompt.prompt();
    
    // 4. Wait to see if they clicked Install or Cancel
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowBanner(false);
    }
    setDeferredPrompt(null);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 shadow-lg z-50 flex justify-between items-center">
      <div>
        <p className="font-bold text-ink text-sm">Install LivingGo</p>
        <p className="text-xs text-muted-foreground">Get faster access and offline viewing.</p>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-clay text-white px-4 py-2 rounded-lg font-bold text-sm"
      >
        Install App
      </button>
    </div>
  );
}