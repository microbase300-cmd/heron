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
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=800&q=80"
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
                  src="https://images.unsplash.com/photo-1573496799515-eebbb63814f2?auto=format&fit=crop&w=800&q=80"
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
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80"
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
    </>
  )
}
