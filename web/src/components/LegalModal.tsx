import { useEffect } from 'react'

export type LegalDocType = 'privacy' | 'terms' | 'risk' | 'regulatory' | null

interface LegalModalProps {
  type: LegalDocType
  onClose: () => void
}

export default function LegalModal({ type, onClose }: LegalModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && type) {
        onClose()
      }
    }

    if (type) {
      document.body.classList.add('app-dialog-open')
      window.addEventListener('keydown', handleKeyDown)
    } else {
      document.body.classList.remove('app-dialog-open')
    }

    return () => {
      document.body.classList.remove('app-dialog-open')
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [type, onClose])

  if (!type) return null

  const renderContent = () => {
    switch (type) {
      case 'privacy':
        return (
          <>
            <div className="eyebrow">Governance & Compliance</div>
            <h2 className="display app-dialog-title" style={{ fontSize: 42 }}>
              Privacy Statement
            </h2>
            <div className="body" style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '12px' }}>
              <p>
                <strong>1. Data Collection & Minimization:</strong> Heron Assets Trustees collects only necessary information to process inquiries and execute authenticated mandates. We do not store unencrypted credentials or private keys.
              </p>
              <p>
                <strong>2. Cryptographic Security:</strong> All client telemetry and communications are transmitted over TLS 1.3 with end-to-end encryption. Ledger operations and wallet identifiers are protected by multi-signature protocols.
              </p>
              <p>
                <strong>3. Non-Disclosure:</strong> We never sell, lease, or monetize client data with advertising platforms or commercial data brokers.
              </p>
            </div>
          </>
        )
      case 'terms':
        return (
          <>
            <div className="eyebrow">Governance & Compliance</div>
            <h2 className="display app-dialog-title" style={{ fontSize: 42 }}>
              Terms of Service
            </h2>
            <div className="body" style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '12px' }}>
              <p>
                <strong>1. Mandate Agreements:</strong> Participation in any capital allocation tier is subject to automated smart contract timelocks and programmatic maturity schedules.
              </p>
              <p>
                <strong>2. Automated Settlement:</strong> Capital commitments are settled at the designated horizon (24h, 48h, 72h, or 96h) directly through decentralized escrow protocols to the participant's specified wallet address.
              </p>
              <p>
                <strong>3. Identity & Verification:</strong> All participants agree to comply with international anti-money laundering (AML) standards and counter-terrorist financing guidelines.
              </p>
            </div>
          </>
        )
      case 'risk':
        return (
          <>
            <div className="eyebrow">Regulatory Disclosure</div>
            <h2 className="display app-dialog-title" style={{ fontSize: 42 }}>
              Risk Disclosure Notice
            </h2>
            <div className="body" style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '12px' }}>
              <p>
                <strong>Market Volatility:</strong> Digital asset markets represent an emerging capital structure characterized by elevated price volatility, continuous trading hours, and changing liquidity depth.
              </p>
              <p>
                <strong>Programmatic Execution:</strong> While Heron implements cold vault custody and multi-signature security, digital asset participation carries inherent technological and protocol risks.
              </p>
              <p>
                <strong>No Public Advice:</strong> Information on this public website is provided for informational and structural exploration purposes only and does not constitute personalized financial or legal advice.
              </p>
            </div>
          </>
        )
      case 'regulatory':
        return (
          <>
            <div className="eyebrow">Institutional Standards</div>
            <h2 className="display app-dialog-title" style={{ fontSize: 42 }}>
              Regulatory Information
            </h2>
            <div className="body" style={{ maxHeight: '55vh', overflowY: 'auto', paddingRight: '12px' }}>
              <p>
                <strong>Operating Standard:</strong> Heron Assets Trustees structures its custody architectures in alignment with global fiduciary practices and institutional security standards.
              </p>
              <p>
                <strong>Multi-Party Computation:</strong> Institutional client reserves are managed via Multi-Party Computation (MPC) cold storage systems with distributed key shards.
              </p>
            </div>
          </>
        )
      default:
        return null
    }
  }

  return (
    <div
      className="app-dialog"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="app-dialog-card" style={{ maxWidth: 640 }}>
        {renderContent()}
        <div className="app-dialog-actions" style={{ marginTop: 24 }}>
          <button
            className="btn btn-dark"
            type="button"
            onClick={onClose}
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  )
}
