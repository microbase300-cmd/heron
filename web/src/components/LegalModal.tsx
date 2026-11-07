import { useEffect } from 'react'

export type LegalDocType = 'privacy' | 'terms' | 'risk' | 'regulatory' | 'certificate' | null

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

  const isCert = type === 'certificate'

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
                <strong>1. Data Collection & Minimization:</strong> Heron Assets Trustee collects only necessary information to process inquiries and execute authenticated investments. We do not store unencrypted credentials or private keys.
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
                <strong>1. Investment Agreements:</strong> Participation in any capital allocation tier is subject to automated smart contract timelocks and programmatic maturity schedules.
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
                <strong>Operating Standard:</strong> Heron Assets Trustee structures its custody architectures in alignment with global fiduciary practices and institutional security standards.
              </p>
              <p>
                <strong>Multi-Party Computation:</strong> Institutional client reserves are managed via Multi-Party Computation (MPC) cold storage systems with distributed key shards.
              </p>
            </div>
          </>
        )
      case 'certificate':
        return (
          <>
            <div className="eyebrow">Corporate Registration • New Zealand</div>
            <h2 className="display app-dialog-title" style={{ fontSize: 32, marginBottom: 8 }}>
              Certificate of Incorporation
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14, marginBottom: 16 }}>
              Heron Assets Trustee Limited is incorporated under the Companies Act 1993 and registered on the New Zealand Companies Register (NZBN: 9429051839201 • Company No: 8419283).
            </p>
            <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
              <div style={{
                border: '2px solid rgba(212, 175, 55, 0.5)',
                borderRadius: 8,
                padding: 10,
                background: '#070b14',
                boxShadow: '0 10px 30px rgba(0,0,0,0.5), 0 0 20px rgba(212,175,55,0.15)',
                marginBottom: 16,
                textAlign: 'center',
              }}>
                <img
                  src="/heron_certificate_of_incorporation.png"
                  alt="New Zealand Certificate of Incorporation - Heron Assets Trustee Limited"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 4,
                    display: 'block',
                  }}
                />
              </div>

              <div style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,175,55,0.3)',
                borderRadius: 6,
                padding: '14px 18px',
                textAlign: 'left',
                fontSize: 13,
                lineHeight: 1.7,
                color: '#e5e7eb',
                marginBottom: 14
              }}>
                <div><strong>Registered Entity:</strong> Heron Assets Trustee Limited</div>
                <div><strong>Governing Act:</strong> Companies Act 1993 (New Zealand)</div>
                <div><strong>Jurisdiction:</strong> New Zealand Companies Office (Te Tari Taiwhenua)</div>
                <div><strong>Company Number:</strong> 8419283 &nbsp;|&nbsp; <strong>NZBN:</strong> 9429051839201</div>
                <div><strong>FSPR Reference:</strong> FSP719402 (Financial Service Providers Register)</div>
                <div><strong>Registered Office:</strong> Level 21, ANZ Centre, 23 Albert Street, Auckland Central, Auckland 1010, New Zealand</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
              <a
                href="/certificate.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-gold"
                style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}
              >
                Open Full Certificate ↗
              </a>
              <a
                href="/heron_certificate_of_incorporation.pdf"
                download="heron_certificate_of_incorporation.pdf"
                className="btn btn-outline"
                style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}
              >
                Download PDF
              </a>
              <a
                href="/heron_certificate_of_incorporation.png"
                download="heron_certificate_of_incorporation.png"
                className="btn btn-outline"
                style={{ fontSize: 13, padding: '10px 18px', textDecoration: 'none' }}
              >
                Download PNG
              </a>
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
      <div className="app-dialog-card" style={{ maxWidth: isCert ? 780 : 640 }}>
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
