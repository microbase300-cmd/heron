import { useState, useRef, useEffect, type FormEvent } from 'react'

interface ChatMessage {
  id: string
  sender: 'ai' | 'user' | 'agent' | 'system'
  senderName?: string
  text: string
  supportRequired?: boolean
  suggestions?: string[]
  time: string
}

interface VisitorInfo {
  name: string
  email: string
}

export default function WebAiAssistantModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)

  // Live Agent Mode
  const [mode, setMode] = useState<'ai' | 'live_agent'>('ai')
  const [activeChatId, setActiveChatId] = useState<string | null>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('heron_active_web_support_chat_id') : null
  })
  const [agentName, setAgentName] = useState<string>('Senior Institutional Representative')
  const [isConnectingAgent, setIsConnectingAgent] = useState(false)
  const [showVisitorPrompt, setShowVisitorPrompt] = useState(false)
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('heron_web_visitor_info')
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return { name: '', email: '' }
  })
  const [pendingPromptQuestion, setPendingPromptQuestion] = useState<string>('')

  const [aiMessages, setAiMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Hello! I am your Heron Institutional AI Assistant. How may I assist your portfolio operations today? You can ask about our investment plans, deposit guidelines, security custody, or affiliate network.',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ])

  const [liveMessages, setLiveMessages] = useState<ChatMessage[]>([])

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const currentMessages = mode === 'live_agent' ? liveMessages : aiMessages

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [currentMessages, isOpen, mode])

  // Synthesized Web Audio API Chime (100% free, 0 external assets)
  const playNotificationChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(587.33, ctx.currentTime) // D5 note
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12) // A5 note

      gain.gain.setValueAtTime(0.18, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start()
      osc.stop(ctx.currentTime + 0.4)
    } catch {}
  }

  // Speech Synthesis (Text to Speech - 0MB Server RAM)
  const speakText = (content: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    if (!voiceEnabled) return

    const cleanSpoken = content
      .replace(/[•\*\_#\[\]]/g, ' ')
      .replace(/https?:\/\/\S+/g, '')
      .replace(/\s+/g, ' ')
      .trim()

    const utterance = new SpeechSynthesisUtterance(cleanSpoken)
    utterance.rate = 1.0
    utterance.pitch = 1.0

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

  // Voice Input (Speech to Text)
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

      recognition.onerror = () => setIsListening(false)
      recognition.onend = () => setIsListening(false)

      recognition.start()
    } catch {
      setIsListening(false)
    }
  }

  useEffect(() => {
    if (!isOpen && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }
  }, [isOpen])

  const getApiBaseUrl = () => {
    if (typeof window !== 'undefined') {
      const host = window.location.hostname
      if (host.includes('heronassetstrusteess.com') || host.includes('heronassetstrustees.com')) {
        return 'https://api.heronassetstrusteess.com'
      }
      if (host === 'stealthssolutions.com' || host === 'www.stealthssolutions.com' || host === 'app.stealthssolutions.com') {
        return 'https://api.stealthssolutions.com'
      }
    }
    return ''
  }

  // Live Agent Initiation
  const startLiveChatHandover = async (name: string, email: string, initialQuestion?: string) => {
    setIsConnectingAgent(true)
    setShowVisitorPrompt(false)

    try {
      const clientName = name.trim() || 'Institutional Website Visitor'
      const clientEmail = email.trim() || 'guest@heronassetstrusteess.com'

      // Save visitor info
      if (typeof window !== 'undefined') {
        localStorage.setItem('heron_web_visitor_info', JSON.stringify({ name: clientName, email: clientEmail }))
      }

      const res = await fetch(`${getApiBaseUrl()}/api/support/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: activeChatId || undefined,
          userName: clientName,
          userEmail: clientEmail,
          initialMessage: initialQuestion || input.trim() || 'Website visitor requested live representative conversation.'
        })
      })

      const data = await res.json()
      if (data?.chat) {
        setActiveChatId(data.chat.id)
        if (typeof window !== 'undefined') {
          localStorage.setItem('heron_active_web_support_chat_id', data.chat.id)
        }
        if (data.chat.assignedAgentName) {
          setAgentName(data.chat.assignedAgentName)
        }
        setMode('live_agent')
        playNotificationChime()

        if (data.messages && data.messages.length > 0) {
          const loaded: ChatMessage[] = data.messages.map((m: any) => ({
            id: m.id,
            sender: m.sender === 'user' ? 'user' : m.sender === 'agent' ? 'agent' : 'system',
            senderName: m.senderName,
            text: m.text,
            time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }))
          setLiveMessages(loaded)
        } else {
          setLiveMessages([
            {
              id: `sys_${Date.now()}`,
              sender: 'system',
              text: 'Connected to Heron Institutional Live Desk. A representative has received your live notification and will respond momentarily.',
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ])
        }
        setInput('')
      }
    } catch (err) {
      console.error('Error connecting to live representative:', err)
      alert('Unable to connect to live support desk at this time. Please email support@heronassetstrusteess.com.')
    } finally {
      setIsConnectingAgent(false)
    }
  }

  const triggerLiveRepresentative = (question?: string) => {
    const q = question || input.trim()
    if (!visitorInfo.name || !visitorInfo.email) {
      setPendingPromptQuestion(q)
      setShowVisitorPrompt(true)
    } else {
      startLiveChatHandover(visitorInfo.name, visitorInfo.email, q)
    }
  }

  // Polling for Live Messages
  useEffect(() => {
    if (!isOpen || mode !== 'live_agent' || !activeChatId) return

    let isMounted = true
    const pollInterval = setInterval(async () => {
      try {
        const res = await fetch(`${getApiBaseUrl()}/api/support/chat/${activeChatId}?markRead=user`)
        if (!res.ok || !isMounted) return
        const data = await res.json()

        if (data.chat?.assignedAgentName) {
          setAgentName(data.chat.assignedAgentName)
        }

        if (data.messages && Array.isArray(data.messages)) {
          setLiveMessages((prev) => {
            const existingIds = new Set(prev.map((m) => m.id))
            const newServerMsgs: ChatMessage[] = []

            for (const sm of data.messages) {
              if (!existingIds.has(sm.id)) {
                newServerMsgs.push({
                  id: sm.id,
                  sender: sm.sender === 'user' ? 'user' : sm.sender === 'agent' ? 'agent' : 'system',
                  senderName: sm.senderName,
                  text: sm.text,
                  time: new Date(sm.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                })
                if (sm.sender === 'agent') {
                  playNotificationChime()
                }
              }
            }

            if (newServerMsgs.length > 0) {
              return [...prev, ...newServerMsgs]
            }
            return prev
          })
        }
      } catch {}
    }, 2500)

    return () => {
      isMounted = false
      clearInterval(pollInterval)
    }
  }, [isOpen, mode, activeChatId])

  // Handle Send for either AI or Live Agent
  const handleSend = async (e?: FormEvent) => {
    if (e) e.preventDefault()
    if (!input.trim() || isTyping) return

    const userText = input.trim()

    // 1. Live Agent Mode Message
    if (mode === 'live_agent') {
      if (!activeChatId) {
        triggerLiveRepresentative(userText)
        return
      }

      const tempId = `temp_${Date.now()}`
      const optimisticMsg: ChatMessage = {
        id: tempId,
        sender: 'user',
        senderName: visitorInfo.name || 'You',
        text: userText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setLiveMessages((prev) => [...prev, optimisticMsg])
      setInput('')

      try {
        const res = await fetch(`${getApiBaseUrl()}/api/support/chat/${activeChatId}/message`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: userText,
            senderName: visitorInfo.name || 'Visitor',
            sender: 'user'
          })
        })

        if (!res.ok) {
          throw new Error('Message dispatch failed')
        }
      } catch (err) {
        console.error('Failed to dispatch support message:', err)
        setLiveMessages((prev) => [
          ...prev,
          {
            id: `err_${Date.now()}`,
            sender: 'system',
            text: 'Message transmission error. Please verify network connection.',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }
        ])
      }
      return
    }

    // 2. AI Mode Message
    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setAiMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsTyping(true)

    // Handover heuristics
    const lower = userText.toLowerCase()
    if (
      lower.includes('human') ||
      lower.includes('representative') ||
      lower.includes('agent') ||
      lower.includes('talk to someone') ||
      lower.includes('speak with someone') ||
      lower.includes('live chat')
    ) {
      setIsTyping(false)
      const aiHandoverMsg: ChatMessage = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: 'I can connect you directly with a Heron Institutional Representative who is currently on duty. Would you like to start a live representative session?',
        supportRequired: true,
        suggestions: ['Start Live Chat with Human'],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setAiMessages((prev) => [...prev, aiHandoverMsg])
      return
    }

    try {
      const res = await fetch(`${getApiBaseUrl()}/api/assistant/chat`, {
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
      setAiMessages((prev) => [...prev, aiMsg])
      if (voiceEnabled) {
        speakText(aiMsg.text)
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: 'ai_err_' + Date.now(),
        sender: 'ai',
        text: 'I am temporarily unable to reach the knowledge desk. You can connect directly with our human support representative right now.',
        supportRequired: true,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      setAiMessages((prev) => [...prev, fallbackMsg])
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
          aria-label="Heron AI & Live Support Assistant"
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
          <span>Ask AI & Live Chat</span>
        </button>
      )}

      {/* Floating Chat Interface */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            width: 'min(420px, calc(100vw - 32px))',
            height: 'min(580px, calc(100vh - 48px))',
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
              padding: '14px 18px',
              background: mode === 'live_agent' ? 'linear-gradient(180deg, #161c16 0%, #111513 100%)' : '#111513',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: mode === 'live_agent' ? 'rgba(14, 203, 129, 0.15)' : 'rgba(214, 168, 79, 0.15)',
                  border: mode === 'live_agent' ? '1px solid rgba(14, 203, 129, 0.4)' : '1px solid rgba(214, 168, 79, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: mode === 'live_agent' ? '#0ECB81' : '#d6a84f'
                }}
              >
                {mode === 'live_agent' ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 18v-6a9 9 0 0 1 18 0v6"></path>
                    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"></path>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                    <circle cx="12" cy="5" r="2"></circle>
                    <path d="M12 7v4"></path>
                  </svg>
                )}
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>{mode === 'live_agent' ? 'Human Support Desk' : 'Heron AI Assistant'}</span>
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 6px',
                      borderRadius: '4px',
                      background: 'rgba(14, 203, 129, 0.15)',
                      color: '#0ECB81',
                      border: '1px solid rgba(14, 203, 129, 0.3)',
                      fontWeight: 600
                    }}
                  >
                    LIVE
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {mode === 'live_agent' ? agentName : 'Institutional AI Intelligence'}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {mode === 'ai' ? (
                <button
                  type="button"
                  onClick={() => triggerLiveRepresentative()}
                  disabled={isConnectingAgent}
                  style={{
                    background: 'rgba(214, 168, 79, 0.15)',
                    border: '1px solid rgba(214, 168, 79, 0.4)',
                    color: 'var(--gold, #d6a84f)',
                    padding: '5px 9px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                  title="Connect with a real human representative"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                  <span>{isConnectingAgent ? 'Connecting...' : 'Live Agent'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setMode('ai')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    color: 'rgba(255, 255, 255, 0.8)',
                    padding: '5px 9px',
                    borderRadius: '7px',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Back to AI
                </button>
              )}

              {mode === 'ai' && (
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
                  title={voiceEnabled ? 'Voice responses active' : 'Voice muted'}
                >
                  {voiceEnabled ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                    </svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                      <line x1="23" y1="9" x2="17" y2="15"></line>
                    </svg>
                  )}
                </button>
              )}

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
                  fontSize: '13px'
                }}
                title="Close"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Quick suggestions (only in AI mode) */}
          {mode === 'ai' && !showVisitorPrompt && (
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
          )}

          {/* Visitor Prompt Card if starting live chat */}
          {showVisitorPrompt ? (
            <div style={{ flex: 1, padding: '24px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div
                style={{
                  background: 'rgba(214, 168, 79, 0.05)',
                  border: '1px solid rgba(214, 168, 79, 0.3)',
                  borderRadius: '16px',
                  padding: '20px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      background: 'var(--gold, #d6a84f)',
                      color: '#10110f',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 700, color: '#fff' }}>Connect with Representative</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>Please enter your details to initiate priority live chat</div>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
                  <div>
                    <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '4px' }}>Your Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Alexander Vance"
                      value={visitorInfo.name}
                      onChange={(e) => setVisitorInfo({ ...visitorInfo, name: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#121418',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', color: 'rgba(255, 255, 255, 0.7)', display: 'block', marginBottom: '4px' }}>Your Email</label>
                    <input
                      type="email"
                      placeholder="e.g. investor@example.com"
                      value={visitorInfo.email}
                      onChange={(e) => setVisitorInfo({ ...visitorInfo, email: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '9px 12px',
                        background: '#121418',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12.5px',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setShowVisitorPrompt(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        background: 'rgba(255, 255, 255, 0.06)',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        borderRadius: '8px',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => startLiveChatHandover(visitorInfo.name, visitorInfo.email, pendingPromptQuestion)}
                      style={{
                        flex: 2,
                        padding: '10px',
                        background: 'var(--gold, #d6a84f)',
                        border: 'none',
                        borderRadius: '8px',
                        color: '#10110f',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      Start Live Chat →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Message History */
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
              {currentMessages.map((m) => {
                if (m.sender === 'system') {
                  return (
                    <div
                      key={m.id}
                      style={{
                        alignSelf: 'center',
                        background: 'rgba(14, 203, 129, 0.1)',
                        border: '1px solid rgba(14, 203, 129, 0.25)',
                        color: '#0ECB81',
                        borderRadius: '999px',
                        padding: '6px 14px',
                        fontSize: '11px',
                        textAlign: 'center',
                        maxWidth: '90%'
                      }}
                    >
                      {m.text}
                    </div>
                  )
                }

                const isUser = m.sender === 'user'
                const isAgent = m.sender === 'agent'

                return (
                  <div
                    key={m.id}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isUser ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isUser && isAgent && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', paddingLeft: '4px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gold, #d6a84f)' }}>
                          {m.senderName || agentName}
                        </span>
                        <span
                          style={{
                            fontSize: '9px',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            background: 'rgba(214, 168, 79, 0.15)',
                            color: 'var(--gold, #d6a84f)',
                            border: '1px solid rgba(214, 168, 79, 0.3)'
                          }}
                        >
                          OFFICIAL
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        maxWidth: '85%',
                        padding: '10px 14px',
                        borderRadius: isUser ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                        background: isUser ? 'var(--gold, #d6a84f)' : isAgent ? '#1c241e' : '#222831',
                        color: isUser ? '#10110f' : '#EAECEF',
                        border: isUser ? 'none' : isAgent ? '1px solid rgba(14, 203, 129, 0.3)' : '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '12.5px',
                        lineHeight: '1.5',
                        whiteSpace: 'pre-line'
                      }}
                    >
                      {m.text}

                      {m.supportRequired && mode === 'ai' && (
                        <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button
                            type="button"
                            onClick={() => triggerLiveRepresentative()}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              background: 'var(--gold, #d6a84f)',
                              border: 'none',
                              color: '#10110f',
                              padding: '8px 12px',
                              borderRadius: '6px',
                              fontSize: '11.5px',
                              fontWeight: 700,
                              cursor: 'pointer'
                            }}
                          >
                            <span>Start Live Chat with Representative Now</span>
                            <span>→</span>
                          </button>
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
                              if (s.toLowerCase().includes('live chat') || s.toLowerCase().includes('human')) {
                                triggerLiveRepresentative()
                              } else {
                                setInput(s)
                              }
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
                )
              })}

              {isTyping && (
                <div style={{ padding: '6px 10px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '8px', width: 'fit-content', fontSize: '11px', color: 'rgba(255, 255, 255, 0.5)' }}>
                  Assistant is processing inquiry...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Form */}
          {!showVisitorPrompt && (
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
              {mode === 'ai' && (
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
              )}

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={
                  mode === 'live_agent'
                    ? `Message ${agentName}...`
                    : isListening
                    ? "Listening... speak now"
                    : "Ask about plans, custody, deposits..."
                }
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
          )}
        </div>
      )}
    </>
  )
}
