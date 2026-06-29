"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // Separated states: One for the sticky banner, one for the popups
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [activeModal, setActiveModal] = useState<"none" | "ios" | "android-fallback">("none");

  useEffect(() => {
    // Show banner after (n) seconds
     const timer = setTimeout(() => {
      setIsBannerVisible(true);
    }, 5000);

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
    // 1. Instantly hide the sticky banner so it gets out of the way
    setIsBannerVisible(false);

    // Detect OS platform
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);

    // Case A: Android native prompt is ready
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      return;
    }

    // Case B: iOS requires manual instructions
    if (isIOS) {
      setActiveModal("ios");
      return;
    }

    // Case C: Android fallback (If they missed the native prompt or cache is lagging)
    setActiveModal("android-fallback");
  };

  // If nothing should be on screen, render nothing
  if (!isBannerVisible && activeModal === "none") return null;

  return (
    <>
      {/* Sticky App Banner Component */}
      {isBannerVisible && (
        <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-white border border-gray-200 p-4 rounded-xl shadow-2xl z-[9999] flex justify-between items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="pr-2">
            <p className="font-black text-slate-900 text-sm leading-tight">Add LivingGo to Home Screen</p>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5 leading-tight">Access student PGs instantly like a native app.</p>
          </div>
          <button 
            onClick={handleInstallClick}
            className="bg-amber-800 text-white px-4 py-2 rounded-lg font-bold text-xs shrink-0 transition active:scale-95 shadow-md"
          >
            Install
          </button>
        </div>
      )}

      {/* Elegant UI Instructional Overlay for Apple iOS Users */}
      {activeModal === "ios" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-end justify-center p-4 animate-in fade-in duration-200" onClick={() => setActiveModal("none")}>
          <div className="bg-white w-full max-w-[360px] p-6 rounded-2xl shadow-2xl text-center mb-20 animate-in slide-in-from-bottom-8 duration-300" onClick={(e) => e.stopPropagation()}>
            <p className="font-black text-slate-900 text-base">Install on iOS</p>
            <p className="text-xs text-slate-600 mt-2">
              Apple forces manual installation for web apps. To add to your home screen:
            </p>
            <div className="my-4 p-3 bg-slate-50 rounded-xl text-xs text-left font-medium text-slate-700 space-y-3">
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-900">1.</span> 
                <span>Tap the <span className="font-bold text-slate-900">Share button</span> at the bottom of Safari.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-900">2.</span> 
                <span>Scroll down and choose <span className="font-bold text-slate-900">&ldquo;Add to Home Screen&rdquo;</span>.</span>
              </p>
            </div>
            <button onClick={() => setActiveModal("none")} className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-sm rounded-xl transition active:scale-95">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Elegant UI Instructional Overlay for Android users */}
      {activeModal === "android-fallback" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-end justify-center p-4 animate-in fade-in duration-200" onClick={() => setActiveModal("none")}>
          <div className="bg-white w-full max-w-[360px] p-6 rounded-2xl shadow-2xl text-center mb-20 animate-in slide-in-from-bottom-8 duration-300" onClick={(e) => e.stopPropagation()}>
            <p className="font-black text-slate-900 text-base">Install App</p>
            <p className="text-xs text-slate-600 mt-2">
              To instantly install LivingGo as a standalone mobile application:
            </p>
            <div className="my-4 p-3 bg-slate-50 rounded-xl text-xs text-left font-medium text-slate-700 space-y-3">
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-900">1.</span> 
                <span>Tap the browser&apos;s <span className="font-bold text-slate-900">Three-Dot Menu (⋮)</span> in the top right.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="font-bold text-slate-900">2.</span> 
                <span>Tap <span className="font-bold text-slate-900">&ldquo;Install app&rdquo;</span> or <span className="font-bold text-slate-900">&ldquo;Add to Home screen&rdquo;</span>.</span>
              </p>
            </div>
            <button onClick={() => setActiveModal("none")} className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-sm rounded-xl transition active:scale-95">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}