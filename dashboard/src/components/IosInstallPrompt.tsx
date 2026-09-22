import React, { useState, useEffect } from 'react';
import { Share, PlusSquare, CheckCircle2, X, Smartphone, Download, ArrowDown } from 'lucide-react';

export const IosInstallPrompt: React.FC = () => {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // 1. Check if already installed and running in standalone mode
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(standalone);
    if (standalone) return;

    // 2. Detect iOS device
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent) || 
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    
    setIsIOS(isIosDevice);

    // 3. Listen for Android / Chrome install prompt
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const dismissed = localStorage.getItem('heron_install_dismissed_at');
      if (!dismissed) {
        setShowBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 4. Check if iOS prompt was dismissed recently
    const dismissedAt = localStorage.getItem('heron_install_dismissed_at');
    const now = Date.now();
    const oneWeek = 7 * 24 * 60 * 60 * 1000;
    
    if (isIosDevice && (!dismissedAt || now - Number(dismissedAt) > oneWeek)) {
      // Show subtle banner after 2.5 seconds
      const timer = setTimeout(() => {
        setShowBanner(true);
      }, 2500);
      return () => {
        clearTimeout(timer);
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }

    // 5. Global trigger to open guide on demand (e.g. from Sidebar or Navbar)
    const handleOpenGuide = () => {
      setShowModal(true);
    };
    window.addEventListener('open-heron-install-guide', handleOpenGuide);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('open-heron-install-guide', handleOpenGuide);
    };
  }, []);

  const handleDismissBanner = () => {
    setShowBanner(false);
    localStorage.setItem('heron_install_dismissed_at', String(Date.now()));
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowModal(true);
    }
  };

  // If already standalone app on home screen, do not show any prompts
  if (isStandalone) return null;

  return (
    <>
      {/* Floating Bottom Banner for mobile visitors */}
      {showBanner && !showModal && (
        <aside 
          aria-label="Install Heron App"
          className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-[9990] bg-[#181A20]/95 backdrop-blur-xl border border-[#d6a84f]/40 p-3.5 rounded-2xl shadow-2xl shadow-black/80 transition-all animate-in fade-in slide-in-from-bottom-5 duration-300"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#060807] border border-[#d6a84f]/50 flex items-center justify-center shrink-0 overflow-hidden shadow-md shadow-[#d6a84f]/10">
              <img src="/heron_logo.jpg" alt="Heron App" className="w-full h-full object-cover" />
            </div>

            <div className="flex-1 min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-[#EAECEF] tracking-tight">Install Heron App</span>
                <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#d6a84f]/15 text-[#d6a84f] font-semibold">
                  {isIOS ? 'iOS Standalone' : 'Native Web App'}
                </span>
              </div>
              <p className="text-[11px] text-[#848E9C] leading-snug mt-0.5">
                {isIOS 
                  ? 'Add to Home Screen for native full-screen view and biometric sync.'
                  : 'Install to Home Screen for instant 1-click access and offline speed.'
                }
              </p>

              <div className="flex items-center gap-2 mt-2.5">
                <button
                  onClick={handleInstallClick}
                  className="flex-1 py-1.5 px-3 rounded-lg bg-[#d6a84f] hover:bg-[#c49843] text-[#0b0d0d] font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{deferredPrompt ? 'Install Now' : 'How to Install'}</span>
                </button>

                <button
                  onClick={handleDismissBanner}
                  className="py-1.5 px-2.5 rounded-lg bg-[#2B313A]/80 hover:bg-[#2B313A] text-[#848E9C] hover:text-[#EAECEF] text-xs transition-colors cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            </div>

            <button
              onClick={handleDismissBanner}
              className="p-1 text-[#848E9C] hover:text-[#EAECEF] rounded-md transition-colors cursor-pointer"
              title="Close prompt"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* Guided Visual Bottom Sheet Modal for iOS Users */}
      {showModal && (
        <div className="fixed inset-0 z-[99990] flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
            onClick={() => setShowModal(false)}
          />

          {/* Dialog Card */}
          <div className="relative w-full sm:max-w-md bg-[#121614] border border-[#d6a84f]/40 sm:rounded-2xl rounded-t-3xl p-6 shadow-2xl shadow-black z-10 space-y-5 overflow-hidden">
            {/* Top gold accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#d6a84f] to-transparent" />

            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#060807] border border-[#d6a84f]/60 p-0.5 overflow-hidden shadow-lg shadow-[#d6a84f]/10">
                  <img src="/heron_logo.jpg" alt="Heron App" className="w-full h-full object-cover rounded-[14px]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                    <span>Install Heron on iOS</span>
                  </h3>
                  <p className="text-xs text-[#848E9C]">Run in native full-screen mode on iPhone & iPad</p>
                </div>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 text-[#848E9C] hover:text-white rounded-lg bg-[#1E2329] border border-[#2B313A] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step-by-Step Interactive Guide */}
            <div className="space-y-3 pt-1">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#181E1A] border border-[#2B313A]">
                <div className="w-8 h-8 rounded-lg bg-[#2B313A] flex items-center justify-center shrink-0 text-[#d6a84f]">
                  <Share className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-[#EAECEF]">Step 1: Tap the Share button</div>
                  <div className="text-[#848E9C] mt-0.5">
                    Look for the Share icon <span className="inline-block px-1 rounded bg-[#2B313A] text-white font-mono text-[11px]">⎙</span> on Safari's bottom toolbar.
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#181E1A] border border-[#2B313A]">
                <div className="w-8 h-8 rounded-lg bg-[#2B313A] flex items-center justify-center shrink-0 text-[#d6a84f]">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-[#EAECEF]">Step 2: Tap 'Add to Home Screen'</div>
                  <div className="text-[#848E9C] mt-0.5">
                    Scroll down in the action menu and select <strong className="text-white">Add to Home Screen</strong>.
                  </div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5 p-3 rounded-xl bg-[#181E1A] border border-[#2B313A]">
                <div className="w-8 h-8 rounded-lg bg-[#0ECB81]/15 border border-[#0ECB81]/30 flex items-center justify-center shrink-0 text-[#0ECB81]">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 text-xs">
                  <div className="font-semibold text-[#EAECEF]">Step 3: Confirm 'Add'</div>
                  <div className="text-[#848E9C] mt-0.5">
                    Tap <strong className="text-[#0ECB81]">Add</strong> in the top-right corner. The Heron App icon will appear on your Home Screen!
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Perks */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2 rounded-lg bg-[#0a0d0b] border border-[#2B313A]/60 flex items-center gap-2 text-[11px] text-[#848E9C]">
                <Smartphone className="w-3.5 h-3.5 text-[#d6a84f]" />
                <span>Zero Browser Bars</span>
              </div>
              <div className="p-2 rounded-lg bg-[#0a0d0b] border border-[#2B313A]/60 flex items-center gap-2 text-[11px] text-[#848E9C]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81]" />
                <span>Face ID Ready</span>
              </div>
            </div>

            {/* Bottom Pointer Animation for Safari */}
            <div className="text-center pt-2 border-t border-[#2B313A]">
              <div className="inline-flex items-center gap-2 text-xs text-[#d6a84f] font-mono animate-bounce">
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Safari Share Button is located below</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowModal(false);
                localStorage.setItem('heron_install_dismissed_at', String(Date.now()));
              }}
              className="w-full py-2.5 rounded-xl bg-[#d6a84f] hover:bg-[#c49843] text-[#0b0d0d] font-bold text-xs transition-colors cursor-pointer tracking-wide uppercase font-mono"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
