import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useUser, useClerk } from '@clerk/clerk-react'
import { useLanguage } from '../i18n/useLanguage'
import { Menu, X, LogOut, User, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()
  const { lang, changeLanguage, t } = useLanguage()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [langOpen, setLangOpen] = useState(false)

  const languages = [
    { code: 'en', label: t('lang.en') },
    { code: 'kn', label: t('lang.kn') },
  ]

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/about', label: t('nav.about') },
    { to: '/directors', label: t('nav.directors') },
    { to: '/services', label: t('nav.services') },
    { to: '/loan-calculator', label: t('nav.loanCalc') },
    { to: '/fd-calculator', label: t('nav.fdCalc') },
    { to: '/contact', label: t('nav.contact') },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = () => signOut()

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand" onClick={() => setMobileOpen(false)}>
          <img src="/logo.png" alt="VCCS Logo" style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid var(--primary)' }} />
          <span className="brand-text">
            <span className="brand-name">{t('nav.brandName')}</span>
            <span className="brand-sub">{t('nav.brandSub')}</span>
          </span>
        </Link>

        <button className="mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <div className={`navbar-menu ${mobileOpen ? 'open' : ''}`}>
          <div className="nav-links">
            {links.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`nav-link ${isActive(link.to) ? 'active' : ''}`}
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="nav-actions">
            <div className="lang-switcher">
              <button className="lang-btn" onClick={() => setLangOpen(!langOpen)}>
                <span className="lang-current">
                  <span className="lang-flag">{lang === 'en' ? '\u{1F1EE}\u{1F1F3}' : '\u{1F1EE}\u{1F1F3}'}</span>
                  <span>{lang === 'en' ? 'English' : '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1'}</span>
                </span>
                <svg className={`lang-chevron ${langOpen ? 'open' : ''}`} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
              </button>
              {langOpen && (
                <div className="lang-dropdown">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      className={`lang-option ${lang === l.code ? 'active' : ''}`}
                      onClick={() => { changeLanguage(l.code); setLangOpen(false); }}
                    >
                      <span className="lang-flag">{"\u{1F1EE}\u{1F1F3}"}</span>
                      <span>{l.code === 'en' ? 'English' : '\u0C95\u0CA8\u0CCD\u0CA8\u0CA1'}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {isSignedIn ? (
              <>
                <Link to="/dashboard" className="btn btn-outline btn-sm" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={16} />
                  {t('nav.dashboard')}
                </Link>
                <div className="user-info">
                  <User size={16} />
                  <span>{user?.fullName || user?.emailAddresses?.[0]?.emailAddress}</span>
                </div>
                <button className="btn btn-sm btn-logout" onClick={handleLogout}>
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary btn-sm" onClick={() => setMobileOpen(false)}>
                {t('nav.login')}
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
