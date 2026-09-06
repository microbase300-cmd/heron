import { useEffect } from 'react'

interface MobileAppModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function MobileAppModal({ isOpen, onClose }: MobileAppModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    if (isOpen) {
      document.body.classList.add('app-dialog-open')
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.classList.remove('app-dialog-open')
    }

    return () => {
      document.body.classList.remove('app-dialog-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="app-dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-dialog-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="app-dialog-card">
        <div className="eyebrow">Heron Mobile Ecosystem</div>
        <h2 id="app-dialog-title" className="display app-dialog-title">
          Heron, wherever you are.
        </h2>
        <p className="body">
          The native Heron mobile experience is built with React Native & Expo
          for encrypted portfolio visibility, instant investment execution, and
          biometric authorization.
        </p>

        <div className="app-dialog-actions">
          <button className="btn btn-dark" type="button" disabled>
            App Store — Coming Soon
          </button>
          <button className="btn btn-gold" type="button" disabled>
            Google Play — Coming Soon
          </button>
          <button
            className="btn btn-outline"
            type="button"
            onClick={onClose}
            aria-label="Close mobile app dialog"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
