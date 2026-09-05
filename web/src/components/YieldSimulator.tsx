import { useState, useId } from 'react'
import { Link } from 'react-router-dom'

export interface PlanConfig {
  id: string
  name: string
  min: number
  max: number
  hours: number
  rate: number
  rateStr: string
  referralRate: number
  referralStr: string
}

export const PLANS_CONFIG: PlanConfig[] = [
  {
    id: 'amateur',
    name: 'Amateur Plan',
    min: 100,
    max: 1999,
    hours: 24,
    rate: 0.045,
    rateStr: '4.5%',
    referralRate: 0.08,
    referralStr: '8%',
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    min: 2000,
    max: 5999,
    hours: 48,
    rate: 0.095,
    rateStr: '9.5%',
    referralRate: 0.16,
    referralStr: '16%',
  },
  {
    id: 'premium',
    name: 'Premium Plan',
    min: 6000,
    max: 10999,
    hours: 72,
    rate: 0.155,
    rateStr: '15.5%',
    referralRate: 0.24,
    referralStr: '24%',
  },
  {
    id: 'retirement',
    name: 'Retirement Plan',
    min: 11000,
    max: Infinity,
    hours: 96,
    rate: 0.225,
    rateStr: '22.5%',
    referralRate: 0.3,
    referralStr: '30%',
  },
]

export function getMatchingPlan(amount: number): PlanConfig {
  let matched = PLANS_CONFIG[0]
  for (const p of PLANS_CONFIG) {
    if (amount >= p.min) {
      matched = p
    }
  }
  return matched
}

interface YieldSimulatorProps {
  initialAmount?: number
  onAmountChange?: (amount: number, plan: PlanConfig) => void
}

export default function YieldSimulator({
  initialAmount = 3500,
  onAmountChange,
}: YieldSimulatorProps) {
  const [amount, setAmount] = useState<number>(initialAmount)
  const amountInputId = useId()
  const amountSliderId = useId()

  const activePlan = getMatchingPlan(amount)
  const profit = amount * activePlan.rate
  const total = amount + profit
  const referralReward = amount * activePlan.referralRate

  const handleAmountUpdate = (newVal: number) => {
    const validVal = isNaN(newVal) || newVal < 0 ? 100 : newVal
    setAmount(validVal)
    if (onAmountChange) {
      onAmountChange(validVal, getMatchingPlan(validVal))
    }
  }

  const formatCurrency = (val: number) => {
    return '$' + Number(val).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  }

  const presets = [
    { label: '$500 (Amateur)', val: 500 },
    { label: '$3,500 (Standard)', val: 3500 },
    { label: '$8,000 (Premium)', val: 8000 },
    { label: '$15,000 (Retirement)', val: 15000 },
    { label: '$30,000 (VIP)', val: 30000 },
  ]

  return (
    <div className="calc-shell">
      {/* Left: Controls */}
      <div className="calc-controls">
        <div>
          <label htmlFor={amountInputId} className="eyebrow" style={{ display: 'block' }}>Deposit Amount</label>
          <div className="calc-input-wrap">
            <span className="calc-currency-symbol">$</span>
            <input
              id={amountInputId}
              type="number"
              className="calc-input-field"
              value={amount}
              min={100}
              max={1000000}
              step={50}
              onChange={(e) => handleAmountUpdate(parseFloat(e.target.value))}
            />
          </div>

          <label htmlFor={amountSliderId} className="sr-only" style={{ display: 'none' }}>Amount Slider</label>
          <input
            id={amountSliderId}
            type="range"
            className="calc-slider"
            min={100}
            max={50000}
            step={50}
            value={Math.min(amount, 50000)}
            onChange={(e) => handleAmountUpdate(parseFloat(e.target.value))}
          />
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '11px',
              color: 'rgba(255,255,255,.4)',
              marginTop: '6px',
              letterSpacing: '.08em',
            }}
          >
            <span>$100 (Min)</span>
            <span>$10,000</span>
            <span>$50,000+</span>
          </div>

          <div className="eyebrow" style={{ marginTop: '28px' }}>
            Quick Selection
          </div>
          <div className="calc-presets">
            {presets.map((p) => (
              <button
                key={p.val}
                type="button"
                className={`calc-preset-btn ${amount === p.val ? 'active' : ''}`}
                onClick={() => handleAmountUpdate(p.val)}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: '28px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,.08)',
            fontSize: '12px',
            color: 'rgba(255,255,255,.5)',
            lineHeight: 1.6,
          }}
        >
          Disbursements occur automatically via smart escrow. No lockup penalty;
          full principal plus profit is credited upon timer completion.
        </div>
      </div>

      {/* Right: Calculated Results */}
      <div className="calc-results">
        <div>
          <div className="calc-plan-detected">
            <div>
              <div className="eyebrow">Matched Mandate Tier</div>
              <h3
                style={{
                  font: "500 28px/1.2 'Instrument Serif',serif",
                  margin: '4px 0 0',
                }}
              >
                {activePlan.name}
              </h3>
            </div>
            <span className="calc-tier-badge">
              {activePlan.hours} Hours • {activePlan.rateStr}
            </span>
          </div>

          <div className="calc-metrics-grid">
            <div className="calc-metric-item">
              <div className="calc-metric-label">Initial Capital</div>
              <div className="calc-metric-val">{formatCurrency(amount)}</div>
            </div>

            <div className="calc-metric-item">
              <div className="calc-metric-label">Guaranteed Net Profit</div>
              <div className="calc-metric-val green">
                +{formatCurrency(profit)}
              </div>
            </div>

            <div className="calc-metric-item">
              <div className="calc-metric-label">Total Payout at Maturity</div>
              <div className="calc-metric-val gold">
                {formatCurrency(total)}
              </div>
            </div>

            <div className="calc-metric-item">
              <div className="calc-metric-label">Referral Reward Potential</div>
              <div
                className="calc-metric-val"
                style={{ color: 'var(--gold-deep)' }}
              >
                {formatCurrency(referralReward)} ({activePlan.referralStr})
              </div>
            </div>
          </div>

          <div className="calc-disbursement-note">
            <strong>Disbursement Schedule:</strong> Capital matures exactly{' '}
            <span style={{ color: 'var(--gold)' }}>{activePlan.hours} hours</span>{' '}
            post-confirmation. Timelock releases automatically to your designated
            wallet address.
          </div>
        </div>

        <Link
          className="btn btn-gold"
          to={`/contact?plan=${activePlan.id}&amount=${amount}`}
          style={{ textAlign: 'center', display: 'block' }}
        >
          Open Mandate with {formatCurrency(amount)} ↗
        </Link>
      </div>
    </div>
  )
}
