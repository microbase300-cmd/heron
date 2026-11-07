import { Link } from 'react-router-dom'
import Reveal from '../components/reveal'

export default function Company() {
  return (
    <>
      {/* Header */}
      <section className="page-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow">01 / company</div>
          </Reveal>

          <Reveal className="delay-1">
            <h1 className="page-title">
              Quiet confidence.
              <br />
              Serious stewardship.
            </h1>
          </Reveal>

          <Reveal className="delay-2">
            <p className="page-intro">
              Heron Assets Trustee is built around a simple idea: sophisticated
              capital deserves a clear operating philosophy.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section">
        <div className="container split">
          <Reveal>
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=80"
              alt="Business professionals in a meeting"
              style={{
                width: '100%',
                height: 560,
                objectFit: 'cover',
                filter: 'grayscale(1)',
              }}
            />
          </Reveal>

          <Reveal className="delay-1">
            <div>
              <div className="eyebrow">02 / our philosophy</div>
              <h2 className="display" style={{ marginTop: '18px' }}>
                Modern market.
                <br />
                Classical discipline.
              </h2>
              <p className="body">
                We bring institutional habits to a market that moves at digital
                speed: define an investment strategy, understand the exposures, monitor the
                environment and communicate clearly.
              </p>
              <p className="body">
                Our work is intentionally research-led. We seek durable processes
                over dramatic predictions and design investment conversations around
                what can be measured, challenged and reviewed.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Leadership */}
      <section className="section section-dark" id="leadership">
        <div className="container">
          <Reveal>
            <div className="eyebrow">03 / leadership</div>
            <h2 className="display" style={{ marginTop: '18px' }}>
              A human firm in a digital market.
            </h2>
          </Reveal>

          <div className="team-grid" style={{ marginTop: '42px' }}>
            <Reveal>
              <div className="portrait">
                <img
                  src="/leadership/director_senior_black_man.jpg"
                  alt="Managing Director portrait"
                />
                <div className="portrait-meta">
                  <span>Managing Director</span>
                  <span>01</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="delay-1">
              <div className="portrait">
                <img
                  src="/leadership/strategy_senior_white_woman.jpg"
                  alt="Head of Investment Strategy portrait"
                />
                <div className="portrait-meta">
                  <span>Investment Strategy</span>
                  <span>02</span>
                </div>
              </div>
            </Reveal>

            <Reveal className="delay-2">
              <div className="portrait">
                <img
                  src="/leadership/operations_young_white_man.jpg"
                  alt="Head of Risk & Operations portrait"
                />
                <div className="portrait-meta">
                  <span>Risk &amp; Operations</span>
                  <span>03</span>
                </div>
              </div>
            </Reveal>
          </div>

          <p
            className="body"
            style={{
              marginTop: '22px',
              maxWidth: 760,
              fontSize: '13px',
              opacity: 0.65,
            }}
          >
            Leadership imagery is presented as role-based representations of our
            multidisciplinary stewardship committee.
          </p>
        </div>
      </section>

      {/* Operating Principles */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="eyebrow">04 / operating principles</div>
          </Reveal>

          <Reveal className="delay-1">
            <div className="metrics" style={{ marginTop: '35px' }}>
              <div className="metric">
                <strong>Research</strong>
                <span>Question the signal</span>
              </div>
              <div className="metric">
                <strong>Risk</strong>
                <span>Know the downside</span>
              </div>
              <div className="metric">
                <strong>Clarity</strong>
                <span>Explain the decision</span>
              </div>
              <div className="metric">
                <strong>Review</strong>
                <span>Improve the process</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Corporate Registration & Jurisdiction */}
      <section className="section section-dark" id="incorporation">
        <div className="container">
          <Reveal>
            <div className="eyebrow">05 / corporate registration &amp; jurisdiction</div>
            <h2 className="display" style={{ marginTop: '18px' }}>
              Statutory Incorporation in New Zealand.
            </h2>
          </Reveal>

          <div className="split" style={{ marginTop: '42px', alignItems: 'center' }}>
            <Reveal>
              <div style={{
                position: 'relative',
                background: '#070b14',
                padding: '12px',
                borderRadius: '10px',
                border: '2px solid rgba(212, 175, 55, 0.45)',
                boxShadow: '0 15px 40px rgba(0,0,0,0.6), 0 0 25px rgba(212,175,55,0.1)',
                maxWidth: '480px'
              }}>
                <img
                  src="/heron_certificate_of_incorporation.png"
                  alt="Certificate of Incorporation — Heron Assets Trustee Limited"
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: '4px',
                    display: 'block'
                  }}
                />
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginTop: '12px',
                  justifyContent: 'center',
                  flexWrap: 'wrap'
                }}>
                  <Link to="/certificate" className="btn btn-gold" style={{ fontSize: '12px', padding: '8px 14px' }}>
                    View Full Certificate ↗
                  </Link>
                  <a
                    href="/heron_certificate_of_incorporation.pdf"
                    download="heron_certificate_of_incorporation.pdf"
                    className="btn btn-outline"
                    style={{ fontSize: '12px', padding: '8px 14px' }}
                  >
                    Download PDF
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal className="delay-1">
              <div>
                <p className="body" style={{ fontSize: '18px', lineHeight: '1.7', color: '#e2e8f0' }}>
                  <strong>Heron Assets Trustee Limited</strong> is incorporated under the <strong>Companies Act 1993</strong> of New Zealand. 
                  Our corporate registration establishes institutional accountability, formal regulatory governance, 
                  and strict adherence to international fiduciary standards.
                </p>

                <div style={{
                  marginTop: '24px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(212, 175, 55, 0.25)',
                  borderRadius: '6px',
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '14px',
                  fontSize: '13px'
                }}>
                  <div>
                    <div style={{ color: '#c5a059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>
                      Company Number
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginTop: '2px' }}>
                      8419283
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#c5a059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>
                      New Zealand Business No.
                    </div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '15px', marginTop: '2px' }}>
                      9429051839201
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#c5a059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>
                      Jurisdiction
                    </div>
                    <div style={{ color: '#fff', marginTop: '2px' }}>
                      New Zealand Companies Office
                    </div>
                  </div>

                  <div>
                    <div style={{ color: '#c5a059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>
                      Status
                    </div>
                    <div style={{ color: '#34d399', fontWeight: 600, marginTop: '2px' }}>
                      ● Active / Good Standing
                    </div>
                  </div>

                  <div style={{ gridColumn: '1 / -1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                    <div style={{ color: '#c5a059', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px', fontWeight: 700 }}>
                      Registered Office
                    </div>
                    <div style={{ color: '#cbd5e1', marginTop: '2px' }}>
                      Level 21, ANZ Centre, 23 Albert Street, Auckland Central, Auckland 1010, New Zealand
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '28px' }}>
                  <Link to="/certificate" className="btn btn-gold">
                    Verify Certificate &amp; Registry Records ↗
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
