import { useState, useEffect, useMemo, useRef } from 'react';
import {
  ALL_LANGUAGES,
  POPULAR_LANG_CODES,
  getLanguageByCode,
  getStoredLanguageCode,
  applyLanguage
} from '../utils/languages';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'mobile' | 'footer';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ variant = 'navbar', className = '' }) => {
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

  // Handle ESC key to close modal
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
      {/* TRIGGER BUTTON: NAVBAR */}
      {variant === 'navbar' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`lang-selector-nav-btn ${className}`}
          title="Switch language (100+ countries supported)"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(255, 255, 255, 0.06)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            borderRadius: '999px',
            padding: '7px 12px',
            fontSize: '11px',
            fontWeight: 600,
            color: '#EAECEF',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(214, 168, 79, 0.5)';
            e.currentTarget.style.background = 'rgba(214, 168, 79, 0.12)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
          }}
        >
          <span style={{ fontSize: '13px' }}>{currentLang.flag}</span>
          <span style={{ letterSpacing: '0.04em' }}>{currentLang.name.split(' ')[0]}</span>
          <span style={{ color: 'rgba(214, 168, 79, 0.85)', fontSize: '9px', marginLeft: '1px' }}>▾</span>
        </button>
      )}

      {/* TRIGGER BUTTON: MOBILE DRAWER */}
      {variant === 'mobile' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`lang-selector-mobile-btn ${className}`}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            marginTop: '8px',
            marginBottom: '8px',
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>🌐</span>
            <span>Interface Language</span>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gold, #d6a84f)' }}>
            <span>{currentLang.flag}</span>
            <span>{currentLang.name}</span>
            <span style={{ fontSize: '10px' }}>→</span>
          </span>
        </button>
      )}

      {/* TRIGGER BUTTON: FOOTER */}
      {variant === 'footer' && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`lang-selector-footer-btn ${className}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '8px',
            padding: '8px 14px',
            fontSize: '12px',
            color: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(214, 168, 79, 0.5)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
            e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
          }}
        >
          <span>🌐</span>
          <span>{currentLang.flag} {currentLang.name} ({currentLang.nativeName})</span>
          <span style={{ color: 'var(--gold, #d6a84f)' }}>Change ▾</span>
        </button>
      )}

      {/* MODAL DIALOG */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            background: 'rgba(6, 8, 9, 0.78)',
            backdropFilter: 'blur(12px)',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '720px',
              maxHeight: '88vh',
              background: '#0E1114',
              border: '1px solid rgba(214, 168, 79, 0.35)',
              borderRadius: '20px',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(214, 168, 79, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              animation: 'heronFadeIn 0.2s ease-out',
            }}
          >
            {/* MODAL HEADER */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '18px' }}>🌐</span>
                  <h3
                    style={{
                      margin: 0,
                      fontSize: '17px',
                      fontWeight: 700,
                      color: '#EAECEF',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Select Language & Region
                  </h3>
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '999px',
                      background: 'rgba(14, 203, 129, 0.15)',
                      color: '#0ECB81',
                      border: '1px solid rgba(14, 203, 129, 0.3)',
                      letterSpacing: '0.05em',
                      textTransform: 'uppercase',
                    }}
                  >
                    100+ Nations
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#848E9C' }}>
                  Choose your native language for instant sovereign wealth platform translation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '10px',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#848E9C',
                  fontSize: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.background = 'rgba(246, 70, 93, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#848E9C';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
              >
                ✕
              </button>
            </div>

            {/* SEARCH INPUT */}
            <div style={{ padding: '16px 24px 10px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <div
                style={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'center',
                  background: '#15191E',
                  borderRadius: '12px',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  padding: '0 14px',
                }}
              >
                <span style={{ fontSize: '14px', opacity: 0.6, marginRight: '8px' }}>🔍</span>
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search countries, languages, or regional codes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    padding: '12px 0',
                    fontSize: '13px',
                    color: '#fff',
                    fontFamily: 'inherit',
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#848E9C',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>

              {/* QUICK POPULAR PILLS */}
              {!searchQuery && (
                <div style={{ marginTop: '12px' }}>
                  <div style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#848E9C', marginBottom: '8px' }}>
                    Major Global Markets
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {popularLanguages.map((p) => {
                      const isSelected = currentCode.toLowerCase() === p.code.toLowerCase();
                      return (
                        <button
                          key={p.code}
                          type="button"
                          onClick={() => handleSelectLanguage(p.code)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            fontSize: '11px',
                            fontWeight: isSelected ? 700 : 500,
                            background: isSelected ? 'rgba(214, 168, 79, 0.22)' : 'rgba(255, 255, 255, 0.05)',
                            border: `1px solid ${isSelected ? 'rgba(214, 168, 79, 0.7)' : 'rgba(255, 255, 255, 0.08)'}`,
                            color: isSelected ? '#F0B90B' : '#EAECEF',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
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

            {/* LANGUAGES SCROLL LIST */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 24px',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                gap: '8px',
              }}
            >
              {filteredLanguages.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '36px 0', color: '#848E9C' }}>
                  <p style={{ margin: 0, fontSize: '14px' }}>No matching languages found for "{searchQuery}".</p>
                  <p style={{ margin: '6px 0 0', fontSize: '12px' }}>Try searching by country or region name.</p>
                </div>
              ) : (
                filteredLanguages.map((lang) => {
                  const isSelected = currentCode.toLowerCase() === lang.code.toLowerCase();
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => handleSelectLanguage(lang.code)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: isSelected ? 'rgba(214, 168, 79, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                        border: `1px solid ${isSelected ? 'rgba(214, 168, 79, 0.5)' : 'rgba(255, 255, 255, 0.06)'}`,
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isSelected) {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                          e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                        }
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        <span style={{ fontSize: '20px', flexShrink: 0 }}>{lang.flag}</span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              color: isSelected ? '#F0B90B' : '#EAECEF',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {lang.name}
                          </div>
                          <div
                            style={{
                              fontSize: '11px',
                              color: '#848E9C',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {lang.nativeName}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span style={{ color: '#0ECB81', fontSize: '14px', fontWeight: 'bold', marginLeft: '6px' }}>
                          ✓
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* MODAL FOOTER */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: '#090B0D',
              }}
            >
              <span style={{ fontSize: '11px', color: '#848E9C' }}>
                Active: <strong style={{ color: '#F0B90B' }}>{currentLang.flag} {currentLang.name}</strong> • Powered by Sovereign Web Translation
              </span>

              <button
                type="button"
                onClick={() => handleSelectLanguage('en')}
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  color: '#848E9C',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#fff';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#848E9C';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                }}
              >
                Reset to English (Default)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default LanguageSelector;
