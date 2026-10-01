import { useState } from 'react'
import Reveal from '../components/reveal'

export default function DownloadPage() {
  const [copied, setCopied] = useState(false)
  const sha256Hash = '6f32a149573aea0ceefda0879753b9c6e46cebeb92870e5de96e9329fdb37753'

  const handleCopyHash = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(sha256Hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 3000)
    }
  }

  return (
    <>
      {/* Header */}
      <section className="page-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0ECB81', display: 'inline-block' }} />
              01 / OFFICIAL CLIENT RELEASE — V1.0.7
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <h1 className="page-title">
              Heron Assets Trustee.
              <br />
              <em>Mobile Terminal Hub.</em>
            </h1>
          </Reveal>

          <Reveal className="delay-2">
            <p className="page-intro">
              The official native Android client for institutional investors. Manage encrypted capital custody,
              monitor real-time portfolio returns, execute programmatic liquidity disbursements, and authenticate
              with biometric hardware signatures.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Download Section */}
      <section className="section" style={{ background: '#0b0d0d', color: '#fff', paddingTop: '60px', paddingBottom: '100px' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'stretch' }}>
            
            {/* ANDROID CARD (ACTIVE) */}
            <Reveal>
              <div
                style={{
                  background: 'linear-gradient(180deg, #131715 0%, #0d100e 100%)',
                  border: '1.5px solid rgba(14, 203, 129, 0.45)',
                  borderRadius: '24px',
                  padding: '36px 30px',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.5), 0 0 40px rgba(14, 203, 129, 0.08)',
                  height: '100%'
                }}
              >
                {/* Top Badge */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#0a0d0b',
                        border: '1px solid rgba(14, 203, 129, 0.5)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#0ECB81',
                        boxShadow: '0 0 20px rgba(14, 203, 129, 0.15)'
                      }}
                    >
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4483.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4116 13.8533 8.125 12 8.125c-1.8534 0-3.59.2866-5.1368.8247L4.8409 5.4467a.4161.4161 0 00-.5677-.1521.4157.4157 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1185-9.4396" />
                      </svg>
                    </div>

                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: 'rgba(14, 203, 129, 0.15)',
                        color: '#0ECB81',
                        border: '1px solid rgba(14, 203, 129, 0.4)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#0ECB81' }} />
                      Available Now
                    </span>
                  </div>

                  <h2 style={{ font: '600 28px/1.2 var(--font-serif)', color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                    Android Native Package (APK)
                  </h2>

                  <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.7)', margin: '0 0 20px' }}>
                    High-performance React Native / Hermes bytecode client with offline ledger caching, native Android BiometricPrompt hardware integration, and zero ads or trackers.
                  </p>

                  {/* Metadata Chips */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '24px' }}>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>Release Version</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0ECB81', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>v1.0.7 (Build 12)</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>Package Size</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>~46.1 MB</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>Target OS</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginTop: '2px' }}>Android 7.0 to 15</div>
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '10px', padding: '10px 12px' }}>
                      <div style={{ fontSize: '10px', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>Security Audit</div>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#0ECB81', marginTop: '2px' }}>0/70 Clean (VirusTotal)</div>
                    </div>
                  </div>
                </div>

                {/* Download CTA & Actions */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
                  <a
                    href="/downloads/heron-trustee.apk"
                    download="heron-trustee.apk"
                    className="btn btn-gold"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '10px',
                      padding: '16px 24px',
                      fontSize: '14px',
                      fontWeight: '800',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      width: '100%',
                      textDecoration: 'none',
                      borderRadius: '14px',
                      boxShadow: '0 8px 24px rgba(214, 168, 79, 0.3)',
                      marginBottom: '14px'
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Download Android APK (Direct)</span>
                  </a>

                  {/* SHA-256 Fingerprint Box */}
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '12px',
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '10px'
                    }}
                  >
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                        SHA-256 Checksum:
                      </div>
                      <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.85)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {sha256Hash}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyHash}
                      style={{
                        background: copied ? '#0ECB81' : 'rgba(255,255,255,0.1)',
                        color: copied ? '#0b0d0d' : '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '6px 10px',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.2s'
                      }}
                    >
                      {copied ? 'Copied ✓' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* QR CODE & MOBILE SCANNER CARD */}
            <Reveal className="delay-1">
              <div
                style={{
                  background: '#121614',
                  border: '1px solid rgba(214, 168, 79, 0.25)',
                  borderRadius: '24px',
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                  height: '100%'
                }}
              >
                <div>
                  <div className="eyebrow" style={{ color: 'var(--gold)', marginBottom: '10px' }}>
                    Instant Camera Scan
                  </div>
                  <h3 style={{ font: '600 24px/1.2 var(--font-serif)', color: '#fff', margin: '0 0 12px' }}>
                    Scan to Install on Phone
                  </h3>
                  <p style={{ fontSize: '13px', lineHeight: '1.65', color: 'rgba(255,255,255,0.65)', margin: '0 0 24px' }}>
                    Viewing on desktop or tablet? Point your Android phone camera at the cryptographic QR matrix to initiate an instantaneous, direct download.
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                    <div
                      style={{
                        background: '#fff',
                        padding: '16px',
                        borderRadius: '18px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                        border: '2px solid rgba(214, 168, 79, 0.4)',
                        display: 'inline-block'
                      }}
                    >
                      <img
                        src="/apk_qr.svg"
                        alt="Scan QR code to download Heron Assets Trustee Android APK"
                        style={{ width: '180px', height: '180px', display: 'block' }}
                      />
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    background: 'rgba(214, 168, 79, 0.06)',
                    border: '1px solid rgba(214, 168, 79, 0.2)',
                    borderRadius: '12px',
                    padding: '12px 14px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'rgba(255,255,255,0.7)'
                  }}
                >
                  🔒 Directly hosted on <strong style={{ color: '#fff' }}>heronassetstrusteess.com</strong> with TLS 1.3 end-to-end encryption.
                </div>
              </div>
            </Reveal>

            {/* APPLE IOS CARD (OFFLINE) */}
            <Reveal className="delay-2">
              <div
                style={{
                  background: '#101211',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '24px',
                  padding: '36px 30px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  height: '100%',
                  opacity: 0.85
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div
                      style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: '#0a0d0b',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.8)'
                      }}
                    >
                      <svg width="30" height="30" viewBox="0 0 170 170" fill="currentColor">
                        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.59-7.79-11.71-14.24-5.87-9.23-10.43-19.46-13.68-30.7-3.25-11.23-4.88-22.1-4.88-32.61 0-14.89 3.82-27.18 11.45-36.88 7.63-9.69 17.2-14.65 28.71-14.88 5.01 0 10.28 1.25 15.82 3.75 5.54 2.5 9.4 3.79 11.58 3.87 1.95 0 6.01-1.38 12.18-4.14 6.17-2.76 11.66-3.95 16.48-3.57 12.63.76 22.84 5.34 30.64 13.75-10.99 6.64-16.38 15.77-16.17 27.4.21 9.04 3.77 16.66 10.68 22.86 6.91 6.2 15.24 9.61 24.99 10.23-2.18 6.53-4.81 13.23-7.9 20.1zM119.22 31.84c0-7.39 2.68-14.38 8.04-20.97 5.36-6.59 11.96-10.59 19.8-12.01.22 1.09.33 2.18.33 3.27 0 7.39-2.79 14.48-8.37 21.28-5.58 6.8-12.28 10.7-20.1 11.7-.1-.98-.15-1.95-.15-2.92l.45-.35z" />
                      </svg>
                    </div>

                    <span
                      style={{
                        padding: '6px 14px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        background: 'rgba(246, 70, 93, 0.1)',
                        color: '#F6465D',
                        border: '1px solid rgba(246, 70, 93, 0.3)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#F6465D' }} />
                      Temporarily Offline
                    </span>
                  </div>

                  <h3 style={{ font: '600 28px/1.2 var(--font-serif)', color: '#fff', margin: '0 0 10px', letterSpacing: '-0.02em' }}>
                    Apple iOS Mobile App
                  </h3>

                  <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.6)', margin: '0 0 20px' }}>
                    Standalone iOS terminal access is temporarily deactivated for security infrastructure maintenance. Public Apple App Store launch will be announced soon.
                  </p>

                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--gold)', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '4px' }}>
                      iOS Client Alternative:
                    </div>
                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                      Access your portfolio via Safari or Chrome at <strong style={{ color: '#fff' }}>app.heronassetstrusteess.com</strong>.
                    </div>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px' }}>
                  <button
                    disabled
                    style={{
                      width: '100%',
                      padding: '16px 24px',
                      fontSize: '13px',
                      fontWeight: '700',
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.06)',
                      color: 'rgba(255,255,255,0.4)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      cursor: 'not-allowed'
                    }}
                  >
                    iOS Terminal Deactivated
                  </button>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* STEP-BY-STEP INSTALLATION GUIDE SECTION */}
      <section className="section" style={{ background: '#111513', color: '#fff', borderTop: '1px solid rgba(255,255,255,0.08)', padding: '100px 0' }}>
        <div className="container">
          <Reveal>
            <div className="eyebrow" style={{ color: 'var(--gold)' }}>
              02 / INSTALLATION WALKTHROUGH
            </div>
            <h2 className="display" style={{ margin: '14px 0 20px', color: '#fff' }}>
              How to Install in <em>3 Simple Steps.</em>
            </h2>
            <p className="body" style={{ maxWidth: '640px', marginBottom: '50px' }}>
              Because Heron Assets Trustee is an institutional-grade investment application distributed directly to private clients outside the public Google Play Store, Android will ask you to confirm direct installation.
            </p>
          </Reveal>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
            
            {/* Step 1 */}
            <Reveal className="delay-1">
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '30px 26px',
                  height: '100%'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    color: '#0b0d0d',
                    fontWeight: '900',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}
                >
                  1
                </div>
                <h3 style={{ font: '600 20px/1.3 var(--font-serif)', color: '#fff', margin: '0 0 10px' }}>
                  Download the APK
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                  Tap the gold <strong>"Download Android APK"</strong> button above. If Chrome prompts <em>"File might be harmful"</em>, tap <strong>Download anyway</strong> (this is Android's standard warning for all direct APK files).
                </p>
              </div>
            </Reveal>

            {/* Step 2 */}
            <Reveal className="delay-2">
              <div
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '20px',
                  padding: '30px 26px',
                  height: '100%'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: 'var(--gold)',
                    color: '#0b0d0d',
                    fontWeight: '900',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}
                >
                  2
                </div>
                <h3 style={{ font: '600 20px/1.3 var(--font-serif)', color: '#fff', margin: '0 0 10px' }}>
                  Allow Unknown Apps
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.65)', margin: 0 }}>
                  Tap the completed download from your notification bar or Files folder. If Android asks for permission to install, tap <strong>Settings</strong> and toggle on <strong>"Allow from this source"</strong>.
                </p>
              </div>
            </Reveal>

            {/* Step 3 (Crucial Play Protect Step) */}
            <Reveal className="delay-3">
              <div
                style={{
                  background: 'linear-gradient(180deg, rgba(14, 203, 129, 0.08) 0%, rgba(255,255,255,0.02) 100%)',
                  border: '1.5px solid rgba(14, 203, 129, 0.35)',
                  borderRadius: '20px',
                  padding: '30px 26px',
                  height: '100%'
                }}
              >
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    background: '#0ECB81',
                    color: '#0b0d0d',
                    fontWeight: '900',
                    fontSize: '15px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '20px'
                  }}
                >
                  3
                </div>
                <h3 style={{ font: '600 20px/1.3 var(--font-serif)', color: '#0ECB81', margin: '0 0 10px' }}>
                  Google Play Protect Step
                </h3>
                <p style={{ fontSize: '14px', lineHeight: '1.65', color: 'rgba(255,255,255,0.85)', margin: 0 }}>
                  If Google Play Protect displays <em>"Play Protect hasn't seen an app from this developer before"</em>, simply tap <strong style={{ color: '#0ECB81' }}>"More details ⌄"</strong> and select <strong style={{ color: '#0ECB81' }}>"Install anyway"</strong>.
                </p>
              </div>
            </Reveal>

          </div>

          {/* Bottom Security Commitment */}
          <Reveal className="delay-2">
            <div
              style={{
                marginTop: '50px',
                padding: '24px 30px',
                background: 'rgba(214, 168, 79, 0.08)',
                border: '1px solid rgba(214, 168, 79, 0.25)',
                borderRadius: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '20px'
              }}
            >
              <div>
                <h4 style={{ color: 'var(--gold)', margin: '0 0 6px', fontSize: '16px' }}>
                  Institutional Security & Integrity Assurance
                </h4>
                <p style={{ color: 'rgba(255,255,255,0.7)', margin: 0, fontSize: '13px' }}>
                  Heron Assets Trustee release packages are signed with institutional RSA-2048 keys and scanned with 70+ antivirus engines. We collect zero advertising telemetry.
                </p>
              </div>
              <a
                href="/downloads/heron-trustee.apk"
                download="heron-trustee.apk"
                className="btn btn-gold"
                style={{ textDecoration: 'none', whiteSpace: 'nowrap' }}
              >
                Download APK Now ↗
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
