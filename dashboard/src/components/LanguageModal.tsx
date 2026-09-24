import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Globe, Search, X, Check, RotateCcw } from 'lucide-react';
import {
  ALL_LANGUAGES,
  POPULAR_LANG_CODES,
  getLanguageByCode,
  getStoredLanguageCode,
  applyLanguage
} from '../utils/languages';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'profile' | 'compact';
  className?: string;
  onLanguageChanged?: (code: string) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  className = '',
  onLanguageChanged
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>('en');
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const code = getStoredLanguageCode();
    setCurrentCode(code);
    applyLanguage(code, false);
  }, []);

  const currentLang = useMemo(() => getLanguageByCode(currentCode), [currentCode]);

  const popularLanguages = useMemo(() => {
    return POPULAR_LANG_CODES.map(code => getLanguageByCode(code));
  }, []);

  const filteredLanguages = useMemo(() => {
    if (!searchQuery.trim()) return ALL_LANGUAGES;
    const q = searchQuery.toLowerCase().trim();
    return ALL_LANGUAGES.filter(
      l =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        l.region.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleSelectLanguage = (code: string) => {
    setCurrentCode(code);
    applyLanguage(code, true);
    if (onLanguageChanged) onLanguageChanged(code);
    setIsOpen(false);
    setSearchQuery('');
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen]);

  return (
    <>
      {/* TRIGGER: NAVBAR BUTTON */}
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1E2329] border border-[#2B313A] hover:border-[#F0B90B]/50 text-xs font-semibold text-[#EAECEF] hover:text-[#F0B90B] transition-all shadow-sm active:scale-95 cursor-pointer ${className}`}
          title={`Interface Language: ${currentLang.name} (${currentLang.nativeName}). Tap to switch among 100+ countries.`}
        >
          <span className="text-sm">{currentLang.flag}</span>
          <span className="hidden sm:inline font-mono font-medium">{currentLang.name.split(' ')[0]}</span>
          <span className="text-[10px] text-[#F0B90B]">▾</span>
        </button>
      )}

      {/* TRIGGER: PROFILE PREFERENCES */}
      {variant === 'profile' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`w-full flex items-center justify-between p-3.5 rounded-xl bg-[#181A20] border border-[#2B313A] hover:border-[#F0B90B]/50 transition-all cursor-pointer ${className}`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#2B313A] flex items-center justify-center text-lg">
              {currentLang.flag}
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold text-[#EAECEF] flex items-center gap-2">
                <span>{currentLang.name}</span>
                <span className="text-xs text-[#F0B90B] font-mono">({currentLang.nativeName})</span>
              </div>
              <div className="text-xs text-[#848E9C]">100+ global languages supported • Click to customize</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-semibold text-[#F0B90B]">
            <span>Change</span>
            <span>▾</span>
          </div>
        </button>
      )}

      {/* TRIGGER: COMPACT */}
      {variant === 'compact' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`p-2 rounded-lg bg-[#2B313A] border border-[#363D47] text-[#848E9C] hover:text-[#EAECEF] transition-all ${className}`}
          title="Switch Language"
        >
          <Globe className="w-4 h-4 text-[#F0B90B]" />
        </button>
      )}

      {/* MODAL DIALOG */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#060809]/80 backdrop-blur-md animate-fadeIn"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="relative w-full max-w-2xl max-h-[85vh] bg-[#1E2329] border border-[#F0B90B]/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            {/* MODAL HEADER */}
            <div className="p-5 border-b border-[#2B313A] flex items-center justify-between bg-gradient-to-b from-[#2B313A]/20 to-transparent">
              <div>
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-[#F0B90B]" />
                  <h3 className="text-lg font-bold text-[#EAECEF] tracking-tight">Global Language Localization</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#0ECB81]/15 text-[#0ECB81] border border-[#0ECB81]/30 uppercase tracking-wider">
                    100+ Nations
                  </span>
                </div>
                <p className="text-xs text-[#848E9C] mt-1">
                  Translate the entire terminal instantly into your national language.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#2B313A] hover:bg-[#F6465D]/20 text-[#848E9C] hover:text-[#F6465D] flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* SEARCH & POPULAR */}
            <div className="p-4 border-b border-[#2B313A]/60 bg-[#181A20]/50 space-y-3">
              <div className="relative flex items-center bg-[#15191E] rounded-xl border border-[#2B313A] px-3.5 focus-within:border-[#F0B90B]/60 transition-all">
                <Search className="w-4 h-4 text-[#848E9C] mr-2 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search 100+ countries, languages, or regional codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent border-0 py-2.5 text-xs text-[#EAECEF] placeholder-[#848E9C] outline-none font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="text-xs text-[#848E9C] hover:text-[#EAECEF] cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>

              {!searchQuery && (
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#848E9C] mb-2">
                    Popular Global Markets
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {popularLanguages.map((p) => {
                      const isSelected = currentCode.toLowerCase() === p.code.toLowerCase();
                      return (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => handleSelectLanguage(p.code)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-[#F0B90B]/20 border border-[#F0B90B] text-[#F0B90B] font-bold'
                              : 'bg-[#2B313A] border border-[#363D47] text-[#EAECEF] hover:border-[#F0B90B]/40'
                          }`}
                        >
                          <span>{p.flag}</span>
                          <span>{p.nativeName}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* LANGUAGES SCROLLABLE LIST */}
            <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredLanguages.length === 0 ? (
                <div className="col-span-full py-12 text-center text-[#848E9C]">
                  <p className="text-sm">No matching languages found for "{searchQuery}".</p>
                  <p className="text-xs mt-1">Try searching by country name or language code.</p>
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = currentCode.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      className={`flex items-center justify-between p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                        isSelected
                          ? 'bg-[#F0B90B]/15 border-[#F0B90B] shadow-sm'
                          : 'bg-[#181A20]/80 border-[#2B313A] hover:bg-[#2B313A]/60 hover:border-[#363D47]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="text-xl shrink-0">{lang.flag}</span>
                        <div className="min-w-0">
                          <div className={`text-xs font-bold truncate ${isSelected ? 'text-[#F0B90B]' : 'text-[#EAECEF]'}`}>
                            {lang.name}
                          </div>
                          <div className="text-[11px] text-[#848E9C] truncate">
                            {lang.nativeName} • <span className="opacity-75">{lang.region}</span>
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-[#0ECB81] shrink-0 ml-1.5" />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* MODAL FOOTER */}
            <div className="p-3.5 border-t border-[#2B313A] flex items-center justify-between bg-[#15191E]">
              <span className="text-xs text-[#848E9C] flex items-center gap-1.5">
                <span>Current:</span>
                <strong className="text-[#F0B90B] font-semibold">{currentLang.flag} {currentLang.name}</strong>
              </span>

              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2B313A] hover:bg-[#363D47] border border-[#363D47] text-[#848E9C] hover:text-[#EAECEF] text-xs font-semibold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3 h-3 text-[#F0B90B]" />
                <span>Reset to English</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
