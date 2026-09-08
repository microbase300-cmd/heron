import { Link } from 'react-router-dom'
import HeroVisual from '../components/HeroVisual'
import MarketPulse from '../components/MarketPulse'
import Reveal from '../components/reveal'

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <HeroVisual />
        <div className="hero-grid" />

        <div className="hero-photo">
          <img
            src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=900&q=80"
            alt="Professionals collaborating in a modern office"
          />
        </div>

        <div className="hero-stamp">
          <span>
            Disciplined
            <br />
            Digital
            <br />
            Capital
          </span>
        </div>

        <div className="container hero-copy">
          <div>
            <Reveal>
              <div className="eyebrow">
                Heron Assets Trustee / 01 — stewardship
              </div>
            </Reveal>

            <Reveal className="delay-1">
              <h1 className="hero-title">
                Strategy for a market that never <em>sleeps.</em>
              </h1>
            </Reveal>

            <Reveal className="delay-2">
              <div className="hero-bottom">
                <Link className="btn btn-gold" to="/pricing">
                  Explore Investment Plans ↗
                </Link>
                <span className="scroll-note">Scroll to enter</span>
              </div>
            </Reveal>
          </div>

          <Reveal className="delay-3">
            <p className="hero-deck">
              Heron approaches digital assets as an evolving capital market:
              research-led, risk-aware, and built on audited programmatic return
              contracts across 24h, 48h, 72h, and 96h maturity cycles.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Philosophy */}
      <section className="section">
        <div className="container manifesto">
          <Reveal>
            <div className="eyebrow">02 / philosophy</div>
          </Reveal>

          <Reveal className="delay-1">
            <p>
              We do not chase the market. We build frameworks that help clients{' '}
              <span>grow and preserve capital.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* Metrics */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <Reveal>
            <div className="metrics">
              <div className="metric">
                <strong>01</strong>
                <span>Research before allocation</span>
              </div>

              <div className="metric">
                <strong>02</strong>
                <span>Automated Escrow timelocks</span>
              </div>

              <div className="metric">
                <strong>03</strong>
                <span>Up to 30% referral network</span>
              </div>

              <div className="metric">
                <strong>04</strong>
                <span>Continuous liquidity release</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Strategy Rail */}
      <section className="section section-dark">
        <div className="container strategy-rail">
          <Reveal>
            <div className="strategy-art" />
          </Reveal>

          <Reveal className="delay-1">
            <div className="strategy-copy">
              <div>
                <div className="eyebrow">03 / investment architecture</div>
                <div className="big">
                  A portfolio should have a point of view.
                </div>
                <p className="body">
                  Our approach connects market intelligence, algorithmic
                  execution, exposure limits, and automated yield settlement
                  into one unified financial standard.
                </p>
              </div>

              <div>
                <Link className="linkline" to="/pricing">
                  <span>Amateur Investment (24h • 4.5%)</span>
                  <span>↗</span>
                </Link>

                <Link className="linkline" to="/pricing">
                  <span>Standard Investment (48h • 9.5%)</span>
                  <span>↗</span>
                </Link>

                <Link className="linkline" to="/pricing">
                  <span>Premium Investment (72h • 15.5%)</span>
                  <span>↗</span>
                </Link>

                <Link className="linkline" to="/pricing">
                  <span>Retirement Reserve (96h • 22.5%)</span>
                  <span>↗</span>
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Featured Investment Plans */}
      <section
        className="section"
        id="plans"
        style={{
          background: '#090c0b',
          color: '#fff',
          borderTop: '1px solid rgba(255,255,255,.08)',
          borderBottom: '1px solid rgba(255,255,255,.08)',
        }}
      >
        <div className="container">
          <div className="market-head">
            <Reveal>
              <div>
                <div className="eyebrow">04 / programmatic capital tiers</div>
                <h2 className="display">
                  Engineered returns. Defined horizons.
                </h2>
              </div>
            </Reveal>

            <Reveal>
              <div>
                <Link className="btn btn-gold" to="/pricing#simulator">
                  Open Profit Simulator ↗
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="price-grid-4">
            {/* Amateur */}
            <article
              className="plan-card"
              style={{
                background: '#131715',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div className="plan-header">
                <span
                  className="plan-duration-badge"
                  style={{ color: 'var(--gold)' }}
                >
                  24 Hours Cycle
                </span>
                <div className="eyebrow">Tier 01</div>
                <h3 className="plan-name">Amateur Plan</h3>
                <p
                  className="body"
                  style={{
                    fontSize: '13px',
                    margin: 0,
                    color: 'rgba(255,255,255,.6)',
                  }}
                >
                  Accessible entry tier with guaranteed 24h liquidity release.
                </p>
              </div>

              <div
                className="plan-rate-display"
                style={{ borderColor: 'rgba(255,255,255,.1)' }}
              >
                <div className="plan-rate-number">4.5%</div>
                <div
                  className="plan-rate-sub"
                  style={{ color: 'rgba(255,255,255,.5)' }}
                >
                  Net yield after 24 hours
                </div>
              </div>

              <div
                className="plan-range-box"
                style={{
                  background: 'rgba(255,255,255,.03)',
                  borderColor: 'rgba(255,255,255,.08)',
                }}
              >
                <div className="plan-range-row">
                  <span
                    className="plan-range-label"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    Min Deposit:
                  </span>
                  <span className="plan-range-val">$100</span>
                </div>
                <div className="plan-range-row">
                  <span
                    className="plan-range-label"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    Max Deposit:
                  </span>
                  <span className="plan-range-val">$1,999</span>
                </div>
              </div>

              <div
                className="plan-ref-card"
                style={{
                  background: 'rgba(214,168,79,.1)',
                  borderColor: 'rgba(214,168,79,.22)',
                }}
              >
                <span
                  className="plan-ref-title"
                  style={{ color: 'rgba(255,255,255,.6)' }}
                >
                  Referral Bonus
                </span>
                <span
                  className="plan-ref-value"
                  style={{ color: 'var(--gold)' }}
                >
                  8% Instant
                </span>
              </div>

              <ul
                className="plan-specs"
                style={{ borderColor: 'rgba(255,255,255,.08)' }}
              >
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  24h automated settlement
                </li>
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Full principal + profit return
                </li>
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Instant wallet release
                </li>
              </ul>

              <Link
                className="btn btn-outline plan-cta-btn"
                to="/pricing#simulator"
              >
                Calculate Return ↗
              </Link>
            </article>

            {/* Standard */}
            <article
              className="plan-card"
              style={{
                background: '#131715',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div className="plan-header">
                <span
                  className="plan-duration-badge"
                  style={{ color: 'var(--gold)' }}
                >
                  48 Hours Cycle
                </span>
                <div className="eyebrow">Tier 02</div>
                <h3 className="plan-name">Standard Plan</h3>
                <p
                  className="body"
                  style={{
                    fontSize: '13px',
                    margin: 0,
                    color: 'rgba(255,255,255,.6)',
                  }}
                >
                  Balanced multi-day accumulation with priority allocation.
                </p>
              </div>

              <div
                className="plan-rate-display"
                style={{ borderColor: 'rgba(255,255,255,.1)' }}
              >
                <div className="plan-rate-number">9.5%</div>
                <div
                  className="plan-rate-sub"
                  style={{ color: 'rgba(255,255,255,.5)' }}
                >
                  Net yield after 48 hours
                </div>
              </div>

              <div
                className="plan-range-box"
                style={{
                  background: 'rgba(255,255,255,.03)',
                  borderColor: 'rgba(255,255,255,.08)',
                }}
              >
                <div className="plan-range-row">
                  <span
                    className="plan-range-label"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    Min Deposit:
                  </span>
                  <span className="plan-range-val">$2,000</span>
                </div>
                <div className="plan-range-row">
                  <span
                    className="plan-range-label"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    Max Deposit:
                  </span>
                  <span className="plan-range-val">$5,999</span>
                </div>
              </div>

              <div
                className="plan-ref-card"
                style={{
                  background: 'rgba(214,168,79,.1)',
                  borderColor: 'rgba(214,168,79,.22)',
                }}
              >
                <span
                  className="plan-ref-title"
                  style={{ color: 'rgba(255,255,255,.6)' }}
                >
                  Referral Bonus
                </span>
                <span
                  className="plan-ref-value"
                  style={{ color: 'var(--gold)' }}
                >
                  16% Instant
                </span>
              </div>

              <ul
                className="plan-specs"
                style={{ borderColor: 'rgba(255,255,255,.08)' }}
              >
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  48h priority liquidity queue
                </li>
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Dual-sig security verification
                </li>
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Instant wallet release
                </li>
              </ul>

              <Link
                className="btn btn-outline plan-cta-btn"
                to="/pricing#simulator"
              >
                Calculate Return ↗
              </Link>
            </article>

            {/* Premium */}
            <article className="plan-card featured">
              <div className="plan-corner-tag">Most Popular</div>

              <div className="plan-header">
                <span className="plan-duration-badge">72 Hours Cycle</span>
                <div className="eyebrow" style={{ color: 'var(--gold)' }}>
                  Tier 03 / High Yield
                </div>
                <h3 className="plan-name">Premium Plan</h3>
                <p
                  className="body"
                  style={{
                    fontSize: '13px',
                    margin: 0,
                    color: 'rgba(255,255,255,.65)',
                  }}
                >
                  Institutional velocity for serious private capital
                  allocation.
                </p>
              </div>

              <div className="plan-rate-display">
                <div
                  className="plan-rate-number"
                  style={{ color: 'var(--gold)' }}
                >
                  15.5%
                </div>
                <div className="plan-rate-sub">
                  Net yield after 72 hours
                </div>
              </div>

              <div className="plan-range-box">
                <div className="plan-range-row">
                  <span className="plan-range-label">Min Deposit:</span>
                  <span className="plan-range-val">$6,000</span>
                </div>
                <div className="plan-range-row">
                  <span className="plan-range-label">Max Deposit:</span>
                  <span className="plan-range-val">$10,999</span>
                </div>
              </div>

              <div
                className="plan-ref-card"
                style={{ background: 'rgba(214,168,79,.14)' }}
              >
                <span className="plan-ref-title">Referral Bonus</span>
                <span className="plan-ref-value">24% Instant</span>
              </div>

              <ul className="plan-specs">
                <li>VIP dedicated risk officer</li>
                <li>Direct OTC zero-slippage routing</li>
                <li>Multi-sig escrow release</li>
              </ul>

              <Link
                className="btn btn-gold plan-cta-btn"
                to="/pricing#simulator"
              >
                Calculate Return ↗
              </Link>
            </article>

            {/* Retirement */}
            <article
              className="plan-card"
              style={{
                background: '#131715',
                color: '#fff',
                border: '1px solid rgba(255,255,255,.08)',
              }}
            >
              <div className="plan-header">
                <span
                  className="plan-duration-badge"
                  style={{ color: 'var(--gold)' }}
                >
                  96 Hours Cycle
                </span>
                <div className="eyebrow">Tier 04</div>
                <h3 className="plan-name">Retirement Plan</h3>
                <p
                  className="body"
                  style={{
                    fontSize: '13px',
                    margin: 0,
                    color: 'rgba(255,255,255,.6)',
                  }}
                >
                  Sovereign long-horizon reserve with maximum compounding.
                </p>
              </div>

              <div
                className="plan-rate-display"
                style={{ borderColor: 'rgba(255,255,255,.1)' }}
              >
                <div className="plan-rate-number">22.5%</div>
                <div
                  className="plan-rate-sub"
                  style={{ color: 'rgba(255,255,255,.5)' }}
                >
                  Net yield after 96 hours
                </div>
              </div>

              <div
                className="plan-range-box"
                style={{
                  background: 'rgba(255,255,255,.03)',
                  borderColor: 'rgba(255,255,255,.08)',
                }}
              >
                <div className="plan-range-row">
                  <span
                    className="plan-range-label"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    Min Deposit:
                  </span>
                  <span className="plan-range-val">$11,000</span>
                </div>
                <div className="plan-range-row">
                  <span
                    className="plan-range-label"
                    style={{ color: 'rgba(255,255,255,.45)' }}
                  >
                    Max Deposit:
                  </span>
                  <span className="plan-range-val">Unlimited</span>
                </div>
              </div>

              <div
                className="plan-ref-card"
                style={{
                  background: 'rgba(214,168,79,.1)',
                  borderColor: 'rgba(214,168,79,.22)',
                }}
              >
                <span
                  className="plan-ref-title"
                  style={{ color: 'rgba(255,255,255,.6)' }}
                >
                  Referral Bonus
                </span>
                <span
                  className="plan-ref-value"
                  style={{ color: 'var(--gold)' }}
                >
                  30% Instant
                </span>
              </div>

              <ul
                className="plan-specs"
                style={{ borderColor: 'rgba(255,255,255,.08)' }}
              >
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Uncapped investment capacity
                </li>
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Maximum 30% affiliate reward
                </li>
                <li
                  style={{
                    color: 'rgba(255,255,255,.65)',
                    borderColor: 'rgba(255,255,255,.08)',
                  }}
                >
                  Sovereign cold vault custody
                </li>
              </ul>

              <Link
                className="btn btn-outline plan-cta-btn"
                to="/pricing#simulator"
              >
                Calculate Return ↗
              </Link>
            </article>
          </div>
        </div>
      </section>

      {/* Market Pulse (Live Binance Tickers) */}
      <section className="section market" id="market">
        <div className="container">
          <div className="market-head">
            <Reveal>
              <div>
                <div className="eyebrow">05 / market pulse</div>
                <h2 className="display">
                  The numbers, without the noise.
                </h2>
              </div>
            </Reveal>

            <div className="market-note">
              Public Binance live ticker stream
            </div>
          </div>

          <div className="market-grid">
            <Reveal>
              <div className="market-panel">
                <MarketPulse />
              </div>
            </Reveal>

            <Reveal className="delay-1">
              <div className="market-panel">
                <div className="eyebrow">Live context</div>
                <h3
                  style={{
                    font: '500 44px/1 "Instrument Serif",serif',
                    margin: '18px 0',
                  }}
                >
                  Markets move. Frameworks remain.
                </h3>
                <p className="body">
                  Track major digital assets beside Heron's disciplined
                  approach to allocation, monitoring, and automated yield
                  execution.
                </p>
                <Link
                  className="btn btn-gold"
                  to="/pricing"
                  style={{ display: 'inline-block', marginTop: 20 }}
                >
                  View Investment Tiers ↗
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Market Intelligence (TradingView) */}
      <section className="section section-dark">
        <div className="container">
          <div className="market-head">
            <Reveal>
              <div>
                <div className="eyebrow">06 / market intelligence</div>
                <h2 className="display">Read the market in context.</h2>
              </div>
            </Reveal>

            <div className="market-note">
              TradingView • Real-Time Technical Analytics
            </div>
          </div>

          <Reveal className="delay-1">
            <div
              className="market-panel"
              style={{
                marginTop: 34,
                padding: 8,
                minHeight: 540,
              }}
            >
              <iframe
                src="https://www.tradingview-widget.com/embed-widget/advanced-chart/?locale=en&symbol=BINANCE%3ABTCUSDT&interval=60&timezone=Etc%2FUTC&theme=dark&style=1&withdateranges=true&hide_side_toolbar=false&allow_symbol_change=true&save_image=false&calendar=false&studies=%5B%5D"
                style={{
                  width: '100%',
                  height: 520,
                  border: 0,
                }}
                loading="lazy"
                title="TradingView BTCUSDT chart"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* News & Perspectives */}
      <section className="section">
        <div className="container news-grid">
          <Reveal>
            <article className="story">
              <img
                src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1400&q=80"
                alt="Executive team working around a table"
              />
              <div className="story-content">
                <div className="eyebrow">Perspective / 01</div>
                <h3 className="display" style={{ fontSize: 56 }}>
                  Clarity is an edge.
                </h3>
              </div>
            </article>
          </Reveal>

          <div className="story-small">
            <Reveal className="delay-1">
              <article className="story-card">
                <div className="eyebrow">Perspective / 02</div>
                <h3>Risk is a process, not a headline.</h3>
                <p>
                  Good stewardship is visible in the decisions made before a
                  position becomes a problem.
                </p>
              </article>
            </Reveal>

            <Reveal className="delay-2">
              <article className="story-card">
                <div className="eyebrow">Perspective / 03</div>
                <h3>Digital assets need institutional discipline.</h3>
                <p>
                  We pair a modern market with old-fashioned standards:
                  diligence, documentation, and mathematical accountability.
                </p>
              </article>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  )
}