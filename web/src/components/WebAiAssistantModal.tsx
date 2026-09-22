import { useState, useRef, useEffect, type FormEvent } from 'react'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user'
  text: string
  supportRequired?: boolean
  suggestions?: string[]
  time: string
}

export default function WebAiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Heron AI Assistant. How may I assist you today? You can ask about our investment plans, deposit guidelines, security custody, or affiliate network.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  // Speech Synthesis (Text to Speech - 0MB Server RAM)
  const speakText = (content: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel() // stop any ongoing speech
    if (!voiceEnabled) return

    // Clean markdown and bullet characters for natural pronunciation
    const cleanSpoken = content
      .replace(/[•\*\_#\[\]]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanSpoken)
    utterance.rate = 1.0
    utterance.pitch = 1.0

    // Prefer English institutional voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferredVoice = voices.find(v => v.lang.startsWith('en') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('David'))) || voices.find(v => v.lang.startsWith('en'))
    if (preferredVoice) {
      utterance.voice = preferredVoice
    }

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  // Voice Input (Speech to Text - 0MB Server RAM)
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in your browser. Please try Chrome, Edge, or Safari.")
      return
    }

    if (isListening) {
      setIsListening(false)
      return
    }

    try {
      const recognition = new SpeechRecognition()
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        if (transcript) {
          setInput(transcript)
          setIsListening(false)
        }
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  // Stop voice when modal closes
  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isOpen])

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      if (host.includes('heronassetstrusteess.com') || host.includes('heronassetstrustees.com')) {
        return 'https://api.heronassetstrusteess.com/api/assistant/chat'
      }
      if (host === 'stealthssolutions.com' || host === 'www.stealthssolutions.com' || host === 'app.stealthssolutions.com') {
        return 'https://api.stealthssolutions.com/api/assistant/chat'
      }
    }
    return '/api/assistant/chat'
  }

  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isTyping) return

    const userText = input.trim()
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch(getApiUrl(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText })
      })
      const data = await res.json()

      const aiMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: data.reply || 'I am currently unable to answer that question.',
        supportRequired: Boolean(data.supportRequired),
        suggestions: data.suggestions || [],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, aiMsg])
      if (voiceEnabled) {
        speakText(aiMsg.text)
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        text: 'I am temporarily unable to reach the knowledge desk. For direct inquiries, please contact support@heronassetstrusteess.com.',
        supportRequired: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setMessages((prev) => [...prev, fallbackMsg])
    } finally {
      setIsTyping(false)
    }
  }

  const quickQuestions = [
    'What investment plans are available?',
    'How do I deposit funds?',
    'How does withdrawal work?',
    'How are assets secured?'
  ]

  return (
    <>
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: '999px',
            background: 'var(--gold, #d6a84f)',
            color: '#10110f',
            border: '1px solid rgba(255, 255, 255, 0.4)',
            boxShadow: '0 10px 30px rgba(214, 168, 79, 0.4), 0 4px 12px rgba(0,0,0,0.5)',
            cursor: 'pointer',
            fontWeight: 700,
            fontSize: '13px',
            letterSpacing: '0.04em',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          aria-label="Heron AI Assistant"
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="10" rx="2"></rect>
              <circle cx="12" cy="5" r="2"></circle>
              <path d="M12 7v4"></path>
              <line x1="8" y1="16" x2="8" y2="16"></line>
              <line x1="16" y1="16" x2="16" y2="16"></line>
            </svg>
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#0ECB81',
                boxShadow: '0 0 8px #0ECB81'
              }}
            />
          </div>
          <span>Ask AI Assistant</span>
        </button>
      )}

      {/* Floating Chat Interface */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: 'min(400px, calc(100vw - 32px))',
            height: 'min(560px, calc(100vh - 48px))',
            zIndex: 9995,
            background: '#181A20',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0, 0, 0, 0.85), 0 0 24px rgba(214, 168, 79, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: '#EAECEF',
            fontFamily: 'var(--font-sans, system-ui, sans-serif)'
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 18px',
              background: '#111513',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '10px',
                  background: 'rgba(214, 168, 79, 0.15)',
                  border: '1px solid rgba(214, 168, 79, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#d6a84f'
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                  <circle cx="12" cy="5" r="2"></circle>
                  <path d="M12 7v4"></path>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>Heron AI Assistant</span>
                  <span style={{ fontSize: '9px', padding: '1px 6px', borderRadius: '4px', background: 'rgba(14, 203, 129, 0.15)', color: '#0ECB81', border: '1px solid rgba(14, 203, 129, 0.3)' }}>ONLINE</span>
                </div>
                <div style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.5)' }}>Institutional Guide</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                onClick={() => {
                  if (isSpeaking && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                    window.speechSynthesis.cancel()
                    setIsSpeaking(false)
                  }
                  setVoiceEnabled(!voiceEnabled)
                }}
                style={{
                  background: voiceEnabled ? 'rgba(214, 168, 79, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                  border: voiceEnabled ? '1px solid rgba(214, 168, 79, 0.4)' : '1px solid rgba(255, 255, 255, 0.1)',
                  color: voiceEnabled ? 'var(--gold, #d6a84f)' : '#848E9C',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
                title={voiceEnabled ? 'Voice responses active (Click to mute)' : 'Voice responses muted (Click to unmute)'}
              >
                {voiceEnabled ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#fff',
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick suggestions */}
          <div
            style={{
              padding: '8px 12px',
              background: 'rgba(0, 0, 0, 0.3)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
              display: 'flex',
              gap: '6px',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {quickQuestions.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(q)}
                style={{
                  fontSize: '11px',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  color: 'var(--gold, #d6a84f)',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message History */}
          <div
            className="ai-modal-scrollbar"
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(214, 168, 79, 0.4) transparent'
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                <div
                  style={{
                    maxWidth: '85%',
                    padding: '10px 14px',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: m.sender === 'user' ? 'var(--gold, #d6a84f)' : '#222831',
                    color: m.sender === 'user' ? '#10110f' : '#EAECEF',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    fontSize: '12.5px',
                    lineHeight: '1.5',
                    whiteSpace: 'pre-line'
                  }}
                >
                  {m.text}

                  {m.supportRequired && (
                    <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <a
                        href="mailto:support@heronassetstrusteess.com?subject=Investor Inquiry - Heron Trustee"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          background: 'rgba(214, 168, 79, 0.15)',
                          border: '1px solid rgba(214, 168, 79, 0.35)',
                          color: '#d6a84f',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        Contact Human Support Desk ↗
                      </a>
                    </div>
                  )}
                </div>

                {/* Follow up suggestions */}
                {m.sender === 'ai' && m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px', maxWidth: '85%' }}>
                    {m.suggestions.map((s, sIdx) => (
                      <button
                        key={sIdx}
                        type="button"
                        onClick={() => {
                          setInput(s)
                        }}
                        style={{
                          fontSize: '10.5px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(214, 168, 79, 0.25)',
                          color: 'var(--gold, #d6a84f)',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        {s} →
                      </button>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '3px', padding: '0 4px' }}>
                  <span style={{ fontSize: '9px', color: 'rgba(255, 255, 255, 0.35)' }}>
                    {m.time}
                  </span>
                  {m.sender === 'ai' && (
                    <button
                      type="button"
                      onClick={() => speakText(m.text)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--gold, #d6a84f)',
                        cursor: 'pointer',
                        padding: '0 2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '2px',
                        fontSize: '9px',
                        opacity: 0.75
                      }}
                      title="Listen to this response"
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                        <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                      </svg>
                      <span>Listen</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div style={{ padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', width: 'fit-content', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                Assistant is thinking...
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form
            onSubmit={handleSend}
            style={{
              padding: '12px 14px',
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              background: '#111513',
              display: 'flex',
              gap: '8px',
              alignItems: 'center'
            }}
          >
            <button
              type="button"
              onClick={toggleVoiceInput}
              style={{
                background: isListening ? '#ef4444' : 'rgba(255, 255, 255, 0.08)',
                color: isListening ? '#fff' : 'var(--gold, #d6a84f)',
                border: isListening ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.15)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isListening ? '0 0 12px rgba(239, 68, 68, 0.6)' : 'none'
              }}
              title={isListening ? "Listening... click to stop" : "Click to speak with voice"}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="22"></line>
              </svg>
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? "Listening... speak now" : "Ask about plans, custody, deposits..."}
              style={{
                flex: 1,
                background: '#1E2329',
                border: isListening ? '1px solid var(--gold, #d6a84f)' : '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '999px',
                padding: '8px 14px',
                color: '#fff',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              style={{
                background: input.trim() && !isTyping ? 'var(--gold, #d6a84f)' : 'rgba(255, 255, 255, 0.1)',
                color: input.trim() && !isTyping ? '#10110f' : 'rgba(255, 255, 255, 0.3)',
                border: 'none',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isTyping ? 'pointer' : 'default'
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </form>
        </div>
      )}
    </>
  )
}
