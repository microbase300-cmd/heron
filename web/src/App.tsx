import { useState, useEffect } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import MobileAppModal from './components/MobileAppModal'
import LegalModal, { type LegalDocType } from './components/LegalModal'
import CustomCursor from './components/CustomCursor'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  const closeMenu = () => setMenuOpen(false)

  return (
    <header className="topbar">
      <nav className="nav">
        <Link className="brand" to="/" onClick={closeMenu}>
          HERON / ASSETS TRUSTEES
        </Link>

        <div className={`navlinks ${menuOpen ? 'open' : ''}`}>
          <NavLink
            to="/"
            end
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Home
          </NavLink>

          <NavLink
            to="/strategies"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Strategies
          </NavLink>

          <NavLink
            to="/pricing"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Investment Plans
          </NavLink>

          <NavLink
            to="/company"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Company
          </NavLink>

          <NavLink
            to="/contact"
            className={({ isActive }) => (isActive ? 'active' : '')}
            onClick={closeMenu}
          >
            Contact
          </NavLink>

          <div className="nav-mobile-extra">
            <a
              className="btn btn-outline"
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
              onClick={closeMenu}
            >
              Client Access ↗
            </a>
            <Link
              className="btn btn-gold"
              to="/pricing"
              onClick={closeMenu}
            >
              View Plans ↗
            </Link>
          </div>
        </div>

        <div className="navcta">
          <a
            className="btn btn-outline"
            href="http://localhost:5173"
            target="_blank"
            rel="noopener noreferrer"
            title="Access the secure investor dashboard"
          >
            Client Access ↗
          </a>

          <Link className="btn btn-gold" to="/pricing">
            View Plans ↗
          </Link>
        </div>

        <button
          type="button"
          className="nav-menu-toggle"
          aria-label="Toggle navigation menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((value) => !value)}
        >
          <span />
          <span />
        </button>
      </nav>
    </header>
  )
}

function Footer({
  onOpenMobileApp,
  onOpenLegal,
}: {
  onOpenMobileApp: () => void
  onOpenLegal: (type: LegalDocType) => void
}) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-top">
          <div>
            <div className="footer-brand">HERON</div>
            <p
              className="body"
              style={{
                maxWidth: 430,
                color: 'rgba(255,255,255,.5)',
              }}
            >
              Digital asset stewardship shaped by research, disciplined strategy
              and transparent client communication.
            </p>
          </div>

          <div>
            <h4>Company</h4>
            <Link to="/company">Our company</Link>
            <Link to="/strategies">Strategies</Link>
            <Link to="/pricing">Investment Plans</Link>
            <Link to="/contact">Contact Desk</Link>
          </div>

          <div>
            <h4>Resources</h4>
            <Link to="/#market">Market Pulse</Link>
            <Link to="/strategies#process">Investment Process</Link>
            <Link to="/pricing#simulator">Yield Simulator</Link>
            <a
              href="http://localhost:5173"
              target="_blank"
              rel="noopener noreferrer"
            >
              Client Access ↗
            </a>
          </div>

          <div>
            <h4>Legal & Governance</h4>
            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '0 0 11px',
                fontSize: '13px',
                display: 'block',
              }}
            >
              Privacy Statement
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '0 0 11px',
                fontSize: '13px',
                display: 'block',
              }}
            >
              Terms of Service
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('risk')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '0 0 11px',
                fontSize: '13px',
                display: 'block',
              }}
            >
              Risk Disclosure
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('regulatory')}
              style={{
                background: 'none',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                textAlign: 'left',
                padding: '0 0 11px',
                fontSize: '13px',
                display: 'block',
              }}
            >
              Regulatory Notice
            </button>
          </div>
        </div>

        <div className="footer-mobile-cta">
          <button
            className="btn btn-gold"
            type="button"
            onClick={onOpenMobileApp}
          >
            Download our Mobile App <span aria-hidden="true">↗</span>
          </button>
        </div>

        <div className="footer-bottom">
          <span>© 2026 Heron Assets Trustees. All rights reserved.</span>
          <span>
            Digital assets involve market risk. Information is for general institutional purposes.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default function PublicLayout() {
  const [mobileModalOpen, setMobileModalOpen] = useState(false)
  const [legalModalType, setLegalModalType] = useState<LegalDocType>(null)
  const location = useLocation()

  // Global reveal-on-scroll & interactive tilt on route change
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const elements = document.querySelectorAll('.reveal')

    if (reduceMotion || !('IntersectionObserver' in window)) {
      elements.forEach((el) => el.classList.add('in', 'is-visible'))
    } else {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              e.target.classList.add('in', 'is-visible')
              io.unobserve(e.target)
            }
          })
        },
        { threshold: 0.05, rootMargin: '0px 0px 80px 0px' }
      )
      elements.forEach((el) => io.observe(el))

      // Instant fallback to prevent any hidden text
      const timer = setTimeout(() => {
        elements.forEach((el) => el.classList.add('in', 'is-visible'))
      }, 350)

      return () => {
        clearTimeout(timer)
        io.disconnect()
      }
    }
  }, [location.pathname])

  // One-time session prompt for mobile app
  useEffect(() => {
    const key = 'heron_mobile_prompt_seen_v1'
    try {
      if (!sessionStorage.getItem(key)) {
        const timer = setTimeout(() => {
          sessionStorage.setItem(key, '1')
          setMobileModalOpen(true)
        }, 3000)
        return () => clearTimeout(timer)
      }
    } catch (_) {
      // ignore in restricted environments
    }
  }, [])

  return (
    <>
      <CustomCursor />
      <ScrollToTop />
      <Navbar />

      <main>
        <Outlet />
      </main>

      <Footer
        onOpenMobileApp={() => setMobileModalOpen(true)}
        onOpenLegal={(type) => setLegalModalType(type)}
      />

      <MobileAppModal
        isOpen={mobileModalOpen}
        onClose={() => setMobileModalOpen(false)}
      />

      <LegalModal
        type={legalModalType}
        onClose={() => setLegalModalType(null)}
      />
    </>
  )
}