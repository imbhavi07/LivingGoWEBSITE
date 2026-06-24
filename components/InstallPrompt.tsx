"use client";

import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [modalType, setModalType] = useState<"none" | "ios" | "android-fallback">("none");

  useEffect(() => {
    // 1. Show the main prompt banner after 5 seconds
    const timer = setTimeout(() => {
      setShowBanner(true);
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
    // Detect OS platform
    const ua = navigator.userAgent.toLowerCase();
    const isIOS = /iphone|ipad|ipod/.test(ua);

    // Case A: Android Chrome native engine is ready to download/install natively
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
      return;
    }

    // Case B: User is on iOS (Safari completely blocks native automatic triggers)
    if (isIOS) {
      setModalType("ios");
      return;
    }

    // Case C: User is on Android but browser hasn't initialized the PWA event yet (Cache/Lag)
    setModalType("android-fallback");
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Sticky App Banner Component above mobile navigation menu */}
      <div className="fixed bottom-20 sm:bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[400px] bg-white border border-gray-200 p-4 rounded-xl shadow-2xl z-[9999] flex justify-between items-center">
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

      {/* Elegant UI Instructional Overlay for Apple iOS Users */}
      {modalType === "ios" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-end justify-center p-4" onClick={() => setModalType("none")}>
          <div className="bg-white w-full max-w-[360px] p-6 rounded-2xl shadow-2xl text-center mb-20 animate-in fade-in slide-in-from-bottom-4 duration-200" onClick={(e) => e.stopPropagation()}>
            <p className="font-black text-slate-900 text-base">Install on iOS</p>
            <p className="text-xs text-slate-600 mt-2">
              Apple forces manual installation for web apps. To add to your home screen:
            </p>
            <div className="my-4 p-3 bg-slate-50 rounded-xl text-xs text-left font-medium text-slate-700 space-y-2">
              <p>1. Tap the <span className="font-bold text-slate-900">Share button</span> at the bottom of Safari browser.</p>
              <p>2. Scroll down the menu and choose <span className="font-bold text-slate-900">&ldquo;Add to Home Screen&ldquo;</span>.</p>
            </div>
            <button onClick={() => setModalType("none")} className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-sm rounded-xl">
              Got it
            </button>
          </div>
        </div>
      )}

      {/* Elegant UI Instructional Overlay for Android users when service worker is caching */}
      {modalType === "android-fallback" && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-end justify-center p-4" onClick={() => setModalType("none")}>
          <div className="bg-white w-full max-w-[360px] p-6 rounded-2xl shadow-2xl text-center mb-20" onClick={(e) => e.stopPropagation()}>
            <p className="font-black text-slate-900 text-base">Install App</p>
            <p className="text-xs text-slate-600 mt-2">
              To instantly install LivingGo as a standalone mobile application:
            </p>
            <div className="my-4 p-3 bg-slate-50 rounded-xl text-xs text-left font-medium text-slate-700 space-y-2">
              <p>1. Tap the browser&apos;s <span className="font-bold text-slate-900">Three-Dot Menu (⋮)</span> in the top right corner.</p>
              <p>2. Tap <span className="font-bold text-slate-900">&ldquo;Install app&ldquo;</span> or <span className="font-bold text-slate-900">&ldquo;Add to Home screen&ldquo;</span>.</p>
            </div>
            <button onClick={() => setModalType("none")} className="w-full py-2.5 bg-slate-100 text-slate-800 font-bold text-sm rounded-xl">
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}