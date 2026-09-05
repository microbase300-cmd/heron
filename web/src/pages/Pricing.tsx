import { useState } from 'react'
import { Link } from 'react-router-dom'
import Reveal from '../components/reveal'
import YieldSimulator, { type PlanConfig } from '../components/YieldSimulator'

export default function Pricing() {
  const [selectedPlanId, setSelectedPlanId] = useState<string>('standard')
  const [simAmount, setSimAmount] = useState<number>(3500)

  const handlePlanSelect = (planId: string, minAmount: number) => {
    setSelectedPlanId(planId)
    setSimAmount(minAmount)
    const simElement = document.getElementById('simulator')
    if (simElement) {
      simElement.scrollIntoView({ behavior: 'smooth' })
    }
  }

  const handleSimChange = (amount: number, plan: PlanConfig) => {
    setSimAmount(amount)
    setSelectedPlanId(plan.id)
  }

  return (
    <>
      {/* Header */}
      <section className="page-head pricing-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow">
              01 / capital mandates &amp; investment architecture
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <h1 className="page-title">
              Disciplined plans.
              <br />
              <em>Programmatic returns.</em>
            </h1>
          </Reveal>

          <Reveal className="delay-2">
            <p className="page-intro">
              Heron structures capital deployment across 4 defined liquidity
              horizons. Each tier operates under strict automated smart escrow
              disbursement, guaranteed yield parameters, and tiered affiliate
              referral rewards.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Plans Section */}
      <section className="section pricing-section">
        <div className="container">
          <Reveal>
            <div className="pricing-intro">
              <div>
                <div className="eyebrow">02 / capital allocation tiers</div>
                <h2 className="display">
                  Engineered yields.
                  <br />
                  Defined horizons.
                </h2>
              </div>
              <p className="body">
                Choose your investment mandate below. Capital and profits are held
                in institutional cryptographic escrow and automatically disbursed
                upon maturity directly to your connected wallet.
              </p>
            </div>
          </Reveal>

          <div className="price-grid-4">
            {/* Amateur Plan */}
            <Reveal>
              <article
                className={`plan-card ${
                  selectedPlanId === 'amateur' ? 'active-calc' : ''
                }`}
                data-plan="amateur"
              >
                <div className="plan-header">
                  <span className="plan-duration-badge">24 Hours Cycle</span>
                  <div className="eyebrow">Tier 01 / Foundational</div>
                  <h3 className="plan-name">Amateur Plan</h3>
                  <p
                    className="body"
                    style={{ fontSize: '13px', margin: 0 }}
                  >
                    Designed for new participants and exploratory capital
                    allocations.
                  </p>
                </div>

                <div className="plan-rate-display">
                  <div className="plan-rate-number">4.5%</div>
                  <div className="plan-rate-sub">
                    Guaranteed yield after 24 hours
                  </div>
                </div>

                <div className="plan-range-box">
                  <div className="plan-range-row">
                    <span className="plan-range-label">Minimum</span>
                    <span className="plan-range-val">$100</span>
                  </div>
                  <div className="plan-range-row">
                    <span className="plan-range-label">Maximum</span>
                    <span className="plan-range-val">$1,999</span>
                  </div>
                </div>

                <div className="plan-ref-card">
                  <span className="plan-ref-title">Referral Bonus</span>
                  <span className="plan-ref-value">8% Instant</span>
                </div>

                <ul className="plan-specs">
                  <li>24h liquidity cycle duration</li>
                  <li>Automated capital + yield release</li>
                  <li>Real-time portfolio tracking</li>
                  <li>24/7 dedicated ledger support</li>
                  <li>Instant wallet withdrawals</li>
                </ul>

                <button
                  type="button"
                  className="btn btn-outline plan-cta-btn"
                  onClick={() => handlePlanSelect('amateur', 500)}
                >
                  Calculate Return ↗
                </button>
              </article>
            </Reveal>

            {/* Standard Plan */}
            <Reveal className="delay-1">
              <article
                className={`plan-card ${
                  selectedPlanId === 'standard' ? 'active-calc' : ''
                }`}
                data-plan="standard"
              >
                <div className="plan-header">
                  <span className="plan-duration-badge">48 Hours Cycle</span>
                  <div className="eyebrow">Tier 02 / Accelerated</div>
                  <h3 className="plan-name">Standard Plan</h3>
                  <p
                    className="body"
                    style={{ fontSize: '13px', margin: 0 }}
                  >
                    Balanced accumulation strategy with expanded yield multipliers.
                  </p>
                </div>

                <div className="plan-rate-display">
                  <div className="plan-rate-number">9.5%</div>
                  <div className="plan-rate-sub">
                    Guaranteed yield after 48 hours
                  </div>
                </div>

                <div className="plan-range-box">
                  <div className="plan-range-row">
                    <span className="plan-range-label">Minimum</span>
                    <span className="plan-range-val">$2,000</span>
                  </div>
                  <div className="plan-range-row">
                    <span className="plan-range-label">Maximum</span>
                    <span className="plan-range-val">$5,999</span>
                  </div>
                </div>

                <div className="plan-ref-card">
                  <span className="plan-ref-title">Referral Bonus</span>
                  <span className="plan-ref-value">16% Instant</span>
                </div>

                <ul className="plan-specs">
                  <li>48h liquidity cycle duration</li>
                  <li>Priority liquidity pool routing</li>
                  <li>Daily ledger verification audit</li>
                  <li>Dual-signature security protocol</li>
                  <li>Instant automated disbursement</li>
                </ul>

                <button
                  type="button"
                  className="btn btn-outline plan-cta-btn"
                  onClick={() => handlePlanSelect('standard', 3500)}
                >
                  Calculate Return ↗
                </button>
              </article>
            </Reveal>

            {/* Premium Plan */}
            <Reveal className="delay-2">
              <article
                className={`plan-card featured ${
                  selectedPlanId === 'premium' ? 'active-calc' : ''
                }`}
                data-plan="premium"
              >
                <div className="plan-corner-tag">Most Popular</div>
                <div className="plan-header">
                  <span className="plan-duration-badge">72 Hours Cycle</span>
                  <div className="eyebrow" style={{ color: 'var(--gold)' }}>
                    Tier 03 / Preferred High-Yield
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
                    Institutional-scale velocity for experienced digital asset
                    investors.
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
                    Guaranteed yield after 72 hours
                  </div>
                </div>

                <div className="plan-range-box">
                  <div className="plan-range-row">
                    <span className="plan-range-label">Minimum</span>
                    <span className="plan-range-val">$6,000</span>
                  </div>
                  <div className="plan-range-row">
                    <span className="plan-range-label">Maximum</span>
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
                  <li>72h liquidity cycle duration</li>
                  <li>VIP Risk Mitigation Officer</li>
                  <li>Zero-slippage OTC direct routing</li>
                  <li>Automated multi-sig escrow release</li>
                  <li>Priority withdrawal dispatch</li>
                </ul>

                <button
                  type="button"
                  className="btn btn-gold plan-cta-btn"
                  onClick={() => handlePlanSelect('premium', 8000)}
                >
                  Calculate Return ↗
                </button>
              </article>
            </Reveal>

            {/* Retirement Plan */}
            <Reveal className="delay-3">
              <article
                className={`plan-card ${
                  selectedPlanId === 'retirement' ? 'active-calc' : ''
                }`}
                data-plan="retirement"
              >
                <div className="plan-header">
                  <span className="plan-duration-badge">96 Hours Cycle</span>
                  <div className="eyebrow">Tier 04 / Sovereign Reserve</div>
                  <h3 className="plan-name">Retirement Plan</h3>
                  <p
                    className="body"
                    style={{ fontSize: '13px', margin: 0 }}
                  >
                    Maximum compounding power with sovereign treasury
                    allocation.
                  </p>
                </div>

                <div className="plan-rate-display">
                  <div className="plan-rate-number">22.5%</div>
                  <div className="plan-rate-sub">
                    Guaranteed yield after 96 hours
                  </div>
                </div>

                <div className="plan-range-box">
                  <div className="plan-range-row">
                    <span className="plan-range-label">Minimum</span>
                    <span className="plan-range-val">$11,000</span>
                  </div>
                  <div className="plan-range-row">
                    <span className="plan-range-label">Maximum</span>
                    <span className="plan-range-val">Unlimited</span>
                  </div>
                </div>

                <div className="plan-ref-card">
                  <span className="plan-ref-title">Referral Bonus</span>
                  <span className="plan-ref-value">30% Instant</span>
                </div>

                <ul className="plan-specs">
                  <li>96h institutional liquidity cycle</li>
                  <li>Maximum 30% affiliate revenue</li>
                  <li>Sovereign cold vault custody</li>
                  <li>Dedicated Private Mandate Director</li>
                  <li>Uncapped capital allocation capacity</li>
                </ul>

                <button
                  type="button"
                  className="btn btn-outline plan-cta-btn"
                  onClick={() => handlePlanSelect('retirement', 15000)}
                >
                  Calculate Return ↗
                </button>
              </article>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Interactive Yield Simulator Engine */}
      <section className="calc-section" id="simulator">
        <div className="container">
          <Reveal>
            <div className="market-head">
              <div>
                <div className="eyebrow">
                  03 / interactive projection engine
                </div>
                <h2 className="display">Simulate your yield in real time.</h2>
              </div>
              <div className="market-note">
                Automated Smart Contract Simulation
              </div>
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <YieldSimulator
              initialAmount={simAmount}
              onAmountChange={handleSimChange}
            />
          </Reveal>
        </div>
      </section>

      {/* Referral Architecture */}
      <section className="section section-dark">
        <div className="container fee-architecture">
          <Reveal>
            <div className="fee-copy">
              <div className="eyebrow">
                04 / affiliate &amp; partner architecture
              </div>
              <h2 className="display">
                Compounding partner
                <br />
                <span>revenue sharing.</span>
              </h2>
              <p className="body">
                Heron operates an institutional referral network. Share your
                mandate invite link with private clients, hedge funds, or peers to
                unlock instant, direct-to-wallet commission payouts across all 4
                tiers.
              </p>
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <div className="fee-lines">
              <div>
                <span>Amateur Tier Referral (Tier 1)</span>
                <strong>8% Instant Commission</strong>
              </div>
              <div>
                <span>Standard Tier Referral (Tier 2)</span>
                <strong>16% Instant Commission</strong>
              </div>
              <div>
                <span>Premium Tier Referral (Tier 3)</span>
                <strong>24% Instant Commission</strong>
              </div>
              <div>
                <span>Retirement Tier Referral (Tier 4)</span>
                <strong>30% Instant Commission</strong>
              </div>
              <div>
                <span>Disbursement Method</span>
                <strong>Automated / Zero Threshold</strong>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Security & Institutional Governance */}
      <section className="section">
        <div className="container">
          <Reveal>
            <div className="market-head">
              <div>
                <div className="eyebrow">05 / institutional protocol</div>
                <h2 className="display">How Heron protects client capital.</h2>
              </div>
              <div className="market-note">
                Multi-Party Computation (MPC) Custody
              </div>
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <div className="metrics" style={{ marginTop: '36px' }}>
              <div className="metric">
                <strong>01</strong>
                <span>Cryptographic Cold Custody</span>
              </div>
              <div className="metric">
                <strong>02</strong>
                <span>Smart Timelock Escrow</span>
              </div>
              <div className="metric">
                <strong>03</strong>
                <span>Zero Unaudited Exposure</span>
              </div>
              <div className="metric">
                <strong>04</strong>
                <span>Automated Payout Pipeline</span>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Legal Disclosures */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container pricing-note">
          <Reveal>
            <div className="eyebrow">06 / transparent disclosures</div>
            <h2 className="display">Stewardship without compromise.</h2>
            <p className="body">
              Digital asset markets operate continuously. All mandates are subject
              to our cryptographic smart contract rules, transparent allocation
              disclosures, and multi-tier fraud prevention checks prior to release.
            </p>
            <Link className="linkline" to="/contact">
              <span>Speak directly with a Mandate Officer</span>
              <span>↗</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  )
}
