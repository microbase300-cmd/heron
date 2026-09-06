import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import Reveal from '../components/reveal'

export default function Contact() {
  const [searchParams] = useSearchParams()
  const planParam = searchParams.get('plan')
  const amountParam = searchParams.get('amount')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    interest: 'Digital asset strategy',
    message: '',
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (planParam || amountParam) {
      const formattedAmount = amountParam ? `$${Number(amountParam).toLocaleString()}` : ''
      const planName = planParam
        ? planParam.charAt(0).toUpperCase() + planParam.slice(1) + ' Plan'
        : ''
      setFormData((prev) => ({
        ...prev,
        interest: 'Institutional investment',
        message: `Inquiring about opening an investment for ${planName} ${
          formattedAmount ? `with initial allocation of ${formattedAmount}` : ''
        }.`,
      }))
    }
  }, [planParam, amountParam])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
  }

  return (
    <>
      {/* Header */}
      <section className="page-head">
        <div className="container">
          <Reveal>
            <div className="eyebrow">01 / contact desk</div>
          </Reveal>

          <Reveal className="delay-1">
            <h1 className="page-title">
              Let's make the
              <br />
              conversation useful.
            </h1>
          </Reveal>

          <Reveal className="delay-2">
            <p className="page-intro">
              Tell us what you are considering, where you are in the process and
              what you need to understand.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Form & Info */}
      <section className="section" id="form">
        <div className="container form-shell">
          <Reveal>
            <div>
              <div className="eyebrow">02 / reach Heron</div>
              <h2 className="display" style={{ marginTop: '18px' }}>
                Strategy starts with context.
              </h2>
              <p className="body">
                Use the inquiry form to begin a conversation about investments,
                portfolio strategy, market intelligence or client services.
              </p>

              <div style={{ marginTop: '45px' }}>
                <div className="eyebrow">Direct Desk</div>
                <p style={{ fontSize: '18px', lineHeight: '1.7' }}>
                  desk@heronassetstrustees.com
                  <br />
                  +1 (800) 437-6628
                  <br />
                  New Zealand • London • Singapore (by appointment)
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  required
                  placeholder="Your name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  type="email"
                  required
                  placeholder="name@institution.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div className="field">
                <label htmlFor="interest">Area of interest</label>
                <select
                  id="interest"
                  value={formData.interest}
                  onChange={(e) =>
                    setFormData({ ...formData, interest: e.target.value })
                  }
                >
                  <option value="Digital asset strategy">
                    Digital asset strategy
                  </option>
                  <option value="Portfolio discussion">Portfolio discussion</option>
                  <option value="Institutional investment">
                    Institutional investment
                  </option>
                  <option value="General inquiry">General inquiry</option>
                </select>
              </div>

              <div className="field">
                <label htmlFor="message">Message</label>
                <textarea
                  id="message"
                  placeholder="Tell us a little about what you are looking for"
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                />
              </div>

              <button
                className="btn btn-dark"
                type="submit"
                style={{ marginTop: '18px' }}
              >
                Submit inquiry ↗
              </button>

              {isSubmitted && (
                <p
                  id="sent"
                  style={{
                    color: 'var(--gold-deep)',
                    fontSize: '14px',
                    marginTop: '16px',
                    fontWeight: 500,
                  }}
                >
                  ✓ Thank you. Your inquiry has been transmitted to the investment desk. A partner will respond within 1 business day.
                </p>
              )}
            </form>
          </Reveal>
        </div>
      </section>

      {/* Client Experience */}
      <section className="section section-dark">
        <div className="container split">
          <Reveal>
            <div>
              <div className="eyebrow">03 / client experience</div>
              <h2 className="display">
                Direct access.
                <br />
                Clear communication.
              </h2>
            </div>
          </Reveal>

          <Reveal className="delay-1">
            <p className="body">
              We believe a professional client relationship should feel considered
              from the first message. No jargon for its own sake. No noise for the
              sake of activity. Just a clear route from question to decision.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  )
}
