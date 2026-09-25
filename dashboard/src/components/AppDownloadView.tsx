import React, { useState } from 'react';
import { Smartphone, Download, ShieldCheck, Zap, ArrowRight, CheckCircle2, Lock, Sparkles, ExternalLink, Clock } from 'lucide-react';

export const AppDownloadView: React.FC = () => {
  const [downloadInitiated, setDownloadInitiated] = useState(false);

  const handleDownloadAndroid = () => {
    setDownloadInitiated(true);
    // Trigger download of the Android APK
    const link = document.createElement('a');
    link.href = '/downloads/heron-trustee.apk';
    link.setAttribute('download', 'heron-trustee.apk');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => {
      setDownloadInitiated(false);
    }, 4000);
  };

  const handleOpenIosGuide = () => {
    window.dispatchEvent(new CustomEvent('open-heron-install-guide'));
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300 pb-12">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#181A20] via-[#1F232B] to-[#181A20] border border-[#2B313A] shadow-xl">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider font-bold bg-[#d6a84f]/15 text-[#d6a84f] border border-[#d6a84f]/30">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Client Terminals</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[#EAECEF] tracking-tight">
            Heron, Wherever Capital Moves
          </h2>
          <p className="text-xs sm:text-sm text-[#848E9C] max-w-2xl">
            Access your encrypted portfolio, live cryptographic release schedules, and instantaneous liquidity withdrawals directly from your iOS and Android devices.
          </p>
        </div>

        {/* Global Coming Soon Advisory Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2B313A]/60 border border-[#d6a84f]/30 self-start md:self-center shrink-0">
          <Clock className="w-4 h-4 text-[#d6a84f] animate-pulse" />
          <div className="text-left">
            <div className="text-[10px] uppercase font-mono text-[#848E9C]">Public Release</div>
            <div className="text-xs font-bold text-[#d6a84f]">Coming Soon — Final Audit</div>
          </div>
        </div>
      </div>

      {/* Two-Column App Download Hub */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Android Card */}
        <div className="relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#181A20] border border-[#2B313A] hover:border-[#0ECB81]/40 transition-all duration-300 shadow-xl overflow-hidden group">
          {/* Top subtle glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#0ECB81]/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#0b0e0c] border border-[#0ECB81]/40 p-2 flex items-center justify-center text-[#0ECB81] shadow-lg shadow-[#0ECB81]/10">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125c-1.8534 0-3.59.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                </svg>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-[#0ECB81]/10 text-[#0ECB81] border border-[#0ECB81]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0ECB81] animate-ping" />
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Android Native App (APK)</span>
            </h3>

            <p className="text-xs text-[#848E9C] mt-2 leading-relaxed">
              Engineered with the Facebook Hermes high-performance bytecode engine and Google Material You architecture. Delivers instant biometric signing and offline ledger synchronization.
            </p>

            {/* Feature List */}
            <ul className="mt-5 space-y-2.5 text-xs text-[#EAECEF]/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81] shrink-0" />
                <span>Zero-latency market tickers & automated yield counters</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81] shrink-0" />
                <span>Hardware Keystore & Android Biometric Prompt</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#0ECB81] shrink-0" />
                <span>Direct APK package for non-Google Play sideloading</span>
              </li>
            </ul>
          </div>

          <div className="mt-7 pt-5 border-t border-[#2B313A]/70">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C] mb-2.5">
              <span>Version: 1.0.0 (Release APK)</span>
              <span>Size: ~92 MB</span>
            </div>

            <button
              onClick={handleDownloadAndroid}
              className="w-full py-3 px-4 rounded-xl bg-[#0ECB81] hover:bg-[#0bb573] text-[#060807] font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#0ECB81]/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloadInitiated ? 'Downloading APK...' : 'Download for Android — Coming Soon'}</span>
            </button>
            <p className="text-[10px] text-center text-[#848E9C] mt-2">
              Available now for authorized client beta testing. Play Store launch pending final audit.
            </p>
          </div>
        </div>

        {/* Apple iOS Card */}
        <div className="relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-[#181A20] border border-[#2B313A] hover:border-[#d6a84f]/40 transition-all duration-300 shadow-xl overflow-hidden group">
          {/* Top subtle glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d6a84f]/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-2xl bg-[#0e0c09] border border-[#d6a84f]/40 p-2 flex items-center justify-center text-[#d6a84f] shadow-lg shadow-[#d6a84f]/10">
                <svg className="w-8 h-8 fill-current" viewBox="0 0 170 170">
                  <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.59-7.79-11.71-14.24-5.87-9.23-10.43-19.46-13.68-30.7-3.25-11.23-4.88-22.1-4.88-32.61 0-14.89 3.82-27.18 11.45-36.88 7.63-9.69 17.2-14.65 28.71-14.88 5.01 0 10.28 1.25 15.82 3.75 5.54 2.5 9.4 3.79 11.58 3.87 1.95 0 6.01-1.38 12.18-4.14 6.17-2.76 11.66-3.95 16.48-3.57 12.63.76 22.84 5.34 30.64 13.75-10.99 6.64-16.38 15.77-16.17 27.4.21 9.04 3.77 16.66 10.68 22.86 6.91 6.2 15.24 9.61 24.99 10.23-2.18 6.53-4.81 13.23-7.9 20.1zM119.22 31.84c0-7.39 2.68-14.38 8.04-20.97 5.36-6.59 11.96-10.59 19.8-12.01.22 1.09.33 2.18.33 3.27 0 7.39-2.79 14.48-8.37 21.28-5.58 6.8-12.28 10.7-20.1 11.7-.1-.98-.15-1.95-.15-2.92l.45-.35z" />
                </svg>
              </div>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono font-bold uppercase bg-[#d6a84f]/10 text-[#d6a84f] border border-[#d6a84f]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d6a84f] animate-ping" />
                Coming Soon
              </span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              <span>Apple iOS Mobile App</span>
            </h3>

            <p className="text-xs text-[#848E9C] mt-2 leading-relaxed">
              Standalone institutional web-native application designed exclusively for iPhone and iPad. Operates full-screen with no browser address bars, rapid FaceID sync, and seamless navigation.
            </p>

            {/* Feature List */}
            <ul className="mt-5 space-y-2.5 text-xs text-[#EAECEF]/80">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d6a84f] shrink-0" />
                <span>Zero browser address bars — 100% native full-screen view</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d6a84f] shrink-0" />
                <span>Instant FaceID & TouchID biometric verification</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#d6a84f] shrink-0" />
                <span>2-tap direct installation to iPhone Home Screen</span>
              </li>
            </ul>
          </div>

          <div className="mt-7 pt-5 border-t border-[#2B313A]/70">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#848E9C] mb-2.5">
              <span>Compatibility: iOS 14.0+</span>
              <span>Architecture: Apple WebKit</span>
            </div>

            <button
              onClick={handleOpenIosGuide}
              className="w-full py-3 px-4 rounded-xl bg-[#d6a84f] hover:bg-[#c49843] text-[#060807] font-bold text-xs tracking-wider uppercase transition-all shadow-lg shadow-[#d6a84f]/20 flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Install for iOS (Setup Guide)</span>
            </button>
            <p className="text-[10px] text-center text-[#848E9C] mt-2">
              App Store review currently underway. 1-click home screen setup available now.
            </p>
          </div>
        </div>
      </div>

      {/* Security & Verification Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#121614] border border-[#2B313A] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[#d6a84f]/10 border border-[#d6a84f]/30 flex items-center justify-center text-[#d6a84f] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-white tracking-tight">Institutional Device Security Standard</h4>
            <p className="text-[11px] text-[#848E9C] mt-0.5">
              All mobile transactions require 2FA OTP verification and end-to-end TLS 1.3 cryptographic protection.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
