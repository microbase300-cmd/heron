import Reveal from '../components/reveal'
import { Link } from 'react-router-dom'

export default function Certificate() {
  return (
    <>
      {/* Header */}
      <section className="page-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow">01 / corporate governance</div>
          </Reveal>

          <Reveal className="delay-1">
            <h1 className="page-title">
              Statutory Incorporation.
              <br />
              New Zealand Jurisdiction.
            </h1>
          </Reveal>

          <Reveal className="delay-2">
            <p className="page-intro">
              Heron Assets Trustee Limited is incorporated under the Companies Act 1993 and registered 
              on the New Zealand Companies Register. Review and verify our official Certificate of Incorporation below.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Main Certificate Showcase */}
      <section className="section" id="certificate-viewer">
        <div className="container">
          <div className="split" style={{ alignItems: 'flex-start', gap: '48px' }}>
            
            {/* Left: Certificate Preview Frame */}
            <Reveal>
              <div style={{
                position: 'relative',
                background: '#070b14',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid rgba(212, 175, 55, 0.5)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 30px rgba(212,175,55,0.15)',
              }}>
                <img
                  src="/heron_certificate_of_incorporation.png"
                  alt="Official New Zealand Certificate of Incorporation — Heron Assets Trustee Limited"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '6px',
                    display: 'block',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                  }}
                />
                
                <div style={{
                  marginTop: '16px',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}>
                  <a
                    href="/certificate.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-gold"
                    style={{ fontSize: '13px', padding: '10px 18px', textDecoration: 'none' }}
                  >
                    Open Clean Document View ↗
                  </a>
                  <a
                    href="/heron_certificate_of_incorporation.pdf"
                    download="heron_certificate_of_incorporation.pdf"
                    className="btn btn-outline"
                    style={{ fontSize: '13px', padding: '10px 18px', textDecoration: 'none' }}
                  >
                    Download Official PDF
                  </a>
                  <a
                    href="/heron_certificate_of_incorporation.png"
                    download="heron_certificate_of_incorporation.png"
                    className="btn btn-outline"
                    style={{ fontSize: '13px', padding: '10px 18px', textDecoration: 'none' }}
                  >
                    Download High-Res PNG
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Right: Registry Verification & Details */}
            <Reveal className="delay-1">
              <div>
                <div className="eyebrow">02 / registry verification</div>
                <h2 className="display" style={{ marginTop: '16px', fontSize: '36px' }}>
                  Heron Assets Trustee Limited
                </h2>
                <p className="body" style={{ marginTop: '14px', lineHeight: '1.7' }}>
                  Incorporated under the <strong>Companies Act 1993</strong>, Heron Assets Trustee Limited operates under 
                  New Zealand commercial law, maintaining institutional fiduciary custody and transparent capital management.
                </p>

                {/* Details Card */}
                <div style={{
                  marginTop: '28px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: '8px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c5a059', fontWeight: 700 }}>
                      Company Number (NZCN)
                    </div>
                    <div style={{ fontSize: '18px', color: '#fff', fontWeight: 600, marginTop: '2px' }}>
                      8419283
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c5a059', fontWeight: 700 }}>
                      New Zealand Business Number (NZBN)
                    </div>
                    <div style={{ fontSize: '18px', color: '#fff', fontWeight: 600, marginTop: '2px' }}>
                      9429051839201
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c5a059', fontWeight: 700 }}>
                      Jurisdiction & Regulatory Authority
                    </div>
                    <div style={{ fontSize: '15px', color: '#fff', marginTop: '2px' }}>
                      New Zealand Companies Office (Te Tari Taiwhenua • Ministry of Business, Innovation &amp; Employment)
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c5a059', fontWeight: 700 }}>
                      Financial Service Providers Register (FSPR)
                    </div>
                    <div style={{ fontSize: '15px', color: '#fff', marginTop: '2px' }}>
                      FSP719402
                    </div>
                  </div>

                  <div>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c5a059', fontWeight: 700 }}>
                      Status &amp; Incorporation Date
                    </div>
                    <div style={{ fontSize: '15px', color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                      ● Active &amp; Good Standing (Incorporated 18 October 2021)
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '14px' }}>
                    <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '2px', color: '#c5a059', fontWeight: 700 }}>
                      Registered Office Location
                    </div>
                    <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px', lineHeight: '1.5' }}>
                      Level 21, ANZ Centre, 23 Albert Street, Auckland Central, Auckland 1010, New Zealand
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <Link to="/contact" className="btn btn-gold">
                    Contact Trustee Desk ↗
                  </Link>
                  <Link to="/company" className="btn btn-outline">
                    Our Leadership &amp; Philosophy
                  </Link>
                </div>
              </div>
            </Reveal>

          </div>
        </div>
      </section>
    </>
  )
}
