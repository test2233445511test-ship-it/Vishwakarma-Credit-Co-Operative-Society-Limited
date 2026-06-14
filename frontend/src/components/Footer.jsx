import { Link } from 'react-router-dom'
import { Building2, MapPin, Phone, Mail, Clock, ArrowUp, Navigation } from 'lucide-react'
import { useLanguage } from '../i18n/useLanguage'

function openMap(branch) {
  const dest = branch.coords
    ? `https://www.google.com/maps/dir//${branch.coords}`
    : `https://www.google.com/maps/search/${encodeURIComponent(`${branch.name}, ${branch.address}`)}`
  window.open(dest, '_blank')
}

export default function Footer() {
  const { t } = useLanguage()
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  const branches = t('footer.branches')

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="footer-logo">
              <Building2 size={32} />
              <div>
                <h4>{t('nav.brandName')}</h4>
                <p>{t('nav.brandSub')}</p>
              </div>
            </div>
            <p className="footer-desc">{t('footer.desc')}</p>
            <div className="footer-social">
              <span className="social-badge">{t('footer.rbiBadge')}</span>
              <span className="social-badge">{t('footer.dicgcBadge')}</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>{t('footer.quickLinks')}</h4>
            <ul>
              <li><Link to="/">{t('nav.home')}</Link></li>
              <li><Link to="/services">{t('nav.services')}</Link></li>
              <li><Link to="/loan-calculator">{t('nav.loanCalc')}</Link></li>
              <li><Link to="/fd-calculator">{t('nav.fdCalc')}</Link></li>
              <li><Link to="/contact">{t('nav.contact')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.services')}</h4>
            <ul>
              <li><Link to="/services">{t('footer.sa')}</Link></li>
              <li><Link to="/services">{t('footer.fd')}</Link></li>
              <li><Link to="/services">{t('footer.hl')}</Link></li>
              <li><Link to="/services">{t('footer.vl')}</Link></li>
              <li><Link to="/services">{t('footer.gl')}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t('footer.contactInfo')}</h4>
            <ul className="contact-list">
              <li>
                <Building2 size={16} />
                <span>{t('footer.address')}</span>
              </li>
              <li>
                <Phone size={16} />
                <span>{t('footer.phone')}</span>
              </li>
              <li>
                <Mail size={16} />
                <span>{t('footer.email')}</span>
              </li>
              <li>
                <Clock size={16} />
                <span>{t('footer.hours')}</span>
              </li>
            </ul>
            <div className="footer-branches">
              <h4>{t('footer.ourBranches')}</h4>
              <div className="footer-branch-item" onClick={() => openMap(branches.main)}>
                <MapPin size={14} />
                <span>{branches.main.name} - {branches.main.phone}</span>
                <Navigation size={14} className="footer-nav-icon" />
              </div>
              <div className="footer-branch-item" onClick={() => openMap(branches.office)}>
                <MapPin size={14} />
                <span>{branches.office.name} - {branches.office.phone}</span>
                <Navigation size={14} className="footer-nav-icon" />
              </div>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '100%' }}>
            <p>&copy; {new Date().getFullYear()} {t('footer.copyright')}</p>
            <p style={{ fontSize: '0.9rem', color: '#9ca3af' }}>
              Designed by <a href="https://gagancb.netlify.app/" target="_blank" rel="noreferrer" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: '500' }}>Gagan C B</a>
            </p>
          </div>
          <button className="scroll-top" onClick={scrollToTop} aria-label="Scroll to top">
            <ArrowUp size={20} />
          </button>
        </div>
      </div>
    </footer>
  )
}
