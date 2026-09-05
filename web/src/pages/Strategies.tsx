import { Link } from 'react-router-dom'
import Reveal from '../components/reveal'

export default function Strategies() {
  return (
    <>
      {/* Strategy Hero */}
      <section className="page-head strategy-hero">
        <div className="container strategy-hero-grid">
          <div>
            <Reveal>
              <div className="eyebrow">01 / strategy desk</div>
            </Reveal>

            <Reveal className="delay-1">
              <h1 className="page-title">
                A clearer way to navigate digital capital.
              </h1>
            </Reveal>

            <Reveal className="delay-2">
              <p className="page-intro">
                Heron's strategy architecture turns market complexity into defined
                mandates, explicit risk parameters and a repeatable decision
                process.
              </p>
            </Reveal>

            <Reveal className="delay-3">
              <div className="hero-bottom">
                <Link className="btn btn-gold" to="/contact">
                  Discuss a mandate ↗
                </Link>
                <a className="text-link" href="#framework">
                  See the framework ↓
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal className="delay-2">
            <div className="strategy-hero-visual">
              <div className="orbit-core">
                <div className="orbit-glow" />
                <div className="orbit-ring ring-a" />
                <div className="orbit-ring ring-b" />
                <div className="orbit-ring ring-c" />
                <span className="orbit-node n1" />
                <span className="orbit-node n2" />
                <span className="orbit-node n3" />
                <span className="orbit-node n4" />
                <span className="orbit-node n5" />
                <span className="orbit-core-label">
                  HERON
                  <br />
                  CAPITAL
                  <br />
                  FRAMEWORK
                </span>
              </div>
              <div className="strategy-visual-caption">
                <span>Allocation / Selection</span>
                <span>Monitoring / Review</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Data Band */}
      <div className="data-band">
        <div className="container data-band-inner">
          <div className="data-cell">
            Mandate<strong>Multi-strategy</strong>
          </div>
          <div className="data-cell">
            Coverage<strong>Digital assets</strong>
          </div>
          <div className="data-cell">
            Process<strong>Rules-led</strong>
          </div>
          <div className="data-cell">
            Review<strong>Continuous</strong>
          </div>
        </div>
      </div>

      {/* Framework */}
      <section className="section" id="framework">
        <div className="container strategy-framework">
          <Reveal>
            <div>
              <div className="eyebrow">02 / operating model</div>
              <h2 className="display">
                Four disciplines.
                <br />
                <span>One coherent system.</span>
              </h2>
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <div className="framework-grid">
              <article>
                <span className="framework-no">01</span>
                <h3>Allocation</h3>
                <p>
                  Define the role of each sleeve before capital is deployed.
                  Concentration, liquidity and portfolio correlation remain visible.
                </p>
              </article>

              <article>
                <span className="framework-no">02</span>
                <h3>Selection</h3>
                <p>
                  Evaluate assets through market structure, liquidity, network
                  fundamentals and the risk that a thesis can be wrong.
                </p>
              </article>

              <article>
                <span className="framework-no">03</span>
                <h3>Monitoring</h3>
                <p>
                  Watch exposures continuously. Position sizing, volatility and
                  changing market conditions inform measured adjustments.
                </p>
              </article>

              <article>
                <span className="framework-no">04</span>
                <h3>Review</h3>
                <p>
                  Document what changed, what did not, and why. Every rebalance
                  becomes part of the institutional memory of the portfolio.
                </p>
              </article>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Strategy Families */}
      <section className="section section-dark strategy-families">
        <div className="container">
          <Reveal>
            <div className="section-intro">
              <div>
                <div className="eyebrow">03 / strategy families</div>
                <h2 className="display">
                  Different mandates.
                  <br />
                  Same discipline.
                </h2>
              </div>
            </div>
          </Reveal>

          <div className="family-list">
            <Reveal>
              <article className="family-card">
                <div className="family-index">01</div>
                <div>
                  <h3>Core Digital</h3>
                  <p>
                    Built for clients seeking measured exposure to established
                    digital assets with liquidity, concentration and drawdown
                    awareness at the center of the mandate.
                  </p>
                  <div className="family-meta">
                    <span>Profile / Core</span>
                    <span>Horizon / Long term</span>
                    <span>Approach / Strategic</span>
                  </div>
                </div>
                <Link to="/contact" className="family-arrow" aria-label="Discuss Core Digital Mandate">
                  ↗
                </Link>
              </article>
            </Reveal>

            <Reveal className="delay-1">
              <article className="family-card">
                <div className="family-index">02</div>
                <div>
                  <h3>Growth &amp; Opportunity</h3>
                  <p>
                    A flexible strategy for accessing higher-growth areas of the
                    market while maintaining explicit position limits and a
                    defined risk budget.
                  </p>
                  <div className="family-meta">
                    <span>Profile / Growth</span>
                    <span>Horizon / Flexible</span>
                    <span>Approach / Opportunistic</span>
                  </div>
                </div>
                <Link to="/contact" className="family-arrow" aria-label="Discuss Growth & Opportunity Mandate">
                  ↗
                </Link>
              </article>
            </Reveal>

            <Reveal className="delay-2">
              <article className="family-card">
                <div className="family-index">03</div>
                <div>
                  <h3>Strategic Mandates</h3>
                  <p>
                    Custom portfolio architecture for clients who need a more
                    tailored mandate across liquidity, risk appetite, allocation
                    bands and reporting requirements.
                  </p>
                  <div className="family-meta">
                    <span>Profile / Tailored</span>
                    <span>Horizon / Defined</span>
                    <span>Approach / Bespoke</span>
                  </div>
                </div>
                <Link to="/contact" className="family-arrow" aria-label="Discuss Strategic Mandates">
                  ↗
                </Link>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Decision Sequence */}
      <section className="section process-stage" id="process">
        <div className="container">
          <Reveal>
            <div className="eyebrow">04 / decision sequence</div>
          </Reveal>

          <div className="process-timeline">
            <Reveal>
              <div className="process-step">
                <span>01</span>
                <div>
                  <h3>Research</h3>
                  <p>
                    Map the market, identify structural signals and challenge the
                    investment thesis.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="delay-1">
              <div className="process-step">
                <span>02</span>
                <div>
                  <h3>Risk map</h3>
                  <p>
                    Set exposure limits, liquidity expectations and failure
                    scenarios before allocation.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="delay-2">
              <div className="process-step">
                <span>03</span>
                <div>
                  <h3>Construct</h3>
                  <p>
                    Build the portfolio around roles, not headlines, with clear
                    allocation logic.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal className="delay-3">
              <div className="process-step">
                <span>04</span>
                <div>
                  <h3>Monitor</h3>
                  <p>
                    Observe the portfolio as market conditions change and document
                    meaningful deviations.
                  </p>
                </div>
              </div>
            </Reveal>

            <Reveal>
              <div className="process-step">
                <span>05</span>
                <div>
                  <h3>Review</h3>
                  <p>
                    Reassess the thesis and make changes deliberately, with the
                    rationale recorded.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Conviction Quote */}
      <section className="section section-dark">
        <div className="container strategy-quote">
          <Reveal>
            <div className="eyebrow">05 / conviction</div>
            <p>
              “The advantage is not predicting every move. It is building a
              process that remains intelligible when the market becomes difficult.”
            </p>
            <span>HERON / INVESTMENT DISCIPLINE</span>
          </Reveal>
        </div>
      </section>
    </>
  )
}
