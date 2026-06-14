import { createElement, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/LanguageContext'
import {
  Building2, Shield, TrendingUp, Users, PiggyBank, HomeIcon,
  Car, Gem, Award, Target, ChevronRight, Landmark,
  BarChart3, Handshake, Eye, Phone, MapPin,
  Banknote, Clock, FileCheck, Bell, Store,
  Star, Sparkles
} from 'lucide-react'

const serviceColors = ['#1a73e8','#2e7d32','#e65100','#1565c0','#c8a44e', '#8e24aa']
const serviceIcons = [PiggyBank, TrendingUp, Banknote, BarChart3, Gem, Shield]
const valueIcons = [Shield, Handshake, Award, TrendingUp]
const statIcons = [Users, PiggyBank, Landmark, Building2]
const featureIcons = [Sparkles, Shield, Handshake, BarChart3]
const facilityIcons = [FileCheck, Shield, Building2, Bell]

function useScrollReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('revealed')
          observer.unobserve(el)
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])
  return ref
}

function ScrollReveal({ children, delay = 0 }) {
  const ref = useScrollReveal()
  return (
    <div ref={ref} className="scroll-reveal" style={{ transitionDelay: `${delay}s` }}>
      {children}
    </div>
  )
}

const heroBgs = [
  'linear-gradient(rgba(10, 35, 66, 0.7), rgba(10, 35, 66, 0.7)), url("/hero1.png") center/cover',
  'linear-gradient(rgba(10, 35, 66, 0.7), rgba(10, 35, 66, 0.7)), url("/hero2.png") center/cover',
  'linear-gradient(rgba(10, 35, 66, 0.7), rgba(10, 35, 66, 0.7)), url("/hero3.png") center/cover',
]

export default function Home() {
  const { t } = useLanguage()
  const [bgIndex, setBgIndex] = useState(0)
  useEffect(() => {
    // Rotate background images every 4.5 seconds
    const id = setInterval(() => setBgIndex(i => (i + 1) % heroBgs.length), 4500)
    return () => clearInterval(id)
  }, [])
  const stats = t('home.stats') || [
    { value: '25,000+', label: 'Active Members' },
    { value: '₹150 Cr+', label: 'Deposits' },
    { value: '₹80 Cr+', label: 'Loan Portfolio' },
    { value: '2', label: 'Branches' }
  ]
  const services = t('home.services.items')
  const features = t('home.features.items')
  const values = t('home.values')
  const fdRates = t('home.fdRates.items')
  const rdRates = t('home.rdRates.items')
  const loanTypes = t('home.loanTypes.items')
  const facilities = t('home.facilities.items')
  const branches = t('home.branches.items')
  const testimonialItems = t('home.testimonials.items')

  const timelineItems = t('home.timeline.items')
  const timelineTitle = t('home.timeline.title')
  const timelineSubtitle = t('home.timeline.subtitle')

  return (
    <>
      <section className="hero-section" style={{ background: heroBgs[bgIndex], transition: 'background 1s ease' }}>
        <div className="hero-bg" />
        <div className="container hero-content">
          <div className="hero-text fade-in">
            <span className="hero-badge">{t('home.societyInfo.reg')}</span>
            <h1>
              <span className="text-secondary font-serif">{t('nav.brandName')}</span>
              <br />
              {t('home.societyInfo.name')}
            </h1>
            <p className="hero-desc">
              {t('home.societyInfo.address')} | {' '}
              <strong>{t('home.societyInfo.phone')}</strong>
            </p>
            <div className="hero-buttons">
              <Link to="/services" className="btn btn-primary btn-lg">{t('home.hero.explore')} <ChevronRight size={20} /></Link>
              <Link to="/login" className="btn btn-outline btn-lg">{t('home.hero.openAccount')}</Link>
            </div>
          </div>
          <div className="hero-stats">
            {stats.map((stat, i) => (
              <div key={i} className="stat-card">
                {createElement(statIcons[i], { size: 32, className: 'stat-icon' })}
                <span className="stat-value">{stat.value}</span>
                <span className="stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <ScrollReveal>
            <div className="about-grid">
              <div className="about-content">
                <span className="section-label">{t('home.about.label')}</span>
                <h2>{t('home.about.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
                <p className="about-text">{t('home.about.p1')}</p>
                <p className="about-text">{t('home.about.p2')}</p>
                <div className="about-features">
                  <div className="about-feat">
                    <Target size={20} />
                    <div><h4>{t('home.about.mission.title')}</h4><p>{t('home.about.mission.desc')}</p></div>
                  </div>
                  <div className="about-feat">
                    <Eye size={20} />
                    <div><h4>{t('home.about.vision.title')}</h4><p>{t('home.about.vision.desc')}</p></div>
                  </div>
                </div>
              </div>
              <div className="about-values">
                {values.map((v, i) => (
                  <div key={i} className="value-card">
                    {createElement(valueIcons[i], { size: 28, style: { color: 'var(--secondary)', marginBottom: 12 } })}
                    <h4>{v.title}</h4><p>{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section" id="timeline">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{timelineTitle} <span className="text-secondary">{t('nav.brandName')}</span></h2>
              <p>{timelineSubtitle}</p>
            </div>
          </ScrollReveal>
          <div className="timeline">
            {timelineItems && timelineItems.map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.15}>
                <div className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                  <div className="timeline-content card">
                    <span className="timeline-year">{item.year}</span>
                    <p>{item.event}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>



      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{t('home.services.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
              <p>{t('home.services.subtitle')}</p>
            </div>
            <div className="services-grid">
              {services.map((svc, i) => (
                <div key={i} className="service-card card">
                  <div className="service-icon" style={{ background: `${serviceColors[i]}15`, color: serviceColors[i] }}>
                    {createElement(serviceIcons[i], { size: 28 })}
                  </div>
                  <h3>{svc.title}</h3><p>{svc.desc}</p>
                  <Link to="/services" className="service-link">{t('services.learnMore')} <ChevronRight size={16} /></Link>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="rates-grid">
              <div className="rates-card">
                <div className="rates-header">
                  <Banknote size={28} className="rates-icon" />
                  <h3>{t('home.fdRates.title')}</h3>
                </div>
                <p className="rates-subtitle">{t('home.fdRates.subtitle')}</p>
                <div className="rates-table-wrapper">
                  <table className="rates-table">
                    <thead>
                      <tr>{t('home.fdRates.headers').map((h, i) => <th key={i}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {fdRates.map((item, i) => (
                        <tr key={i}>
                          <td>{item.period}</td>
                          <td className="rate-value">{item.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="rates-card">
                <div className="rates-header">
                  <Clock size={28} className="rates-icon" />
                  <h3>{t('home.rdRates.title')}</h3>
                </div>
                <p className="rates-subtitle">{t('home.rdRates.subtitle')}</p>
                <div className="rates-table-wrapper">
                  <table className="rates-table">
                    <thead>
                      <tr>{t('home.rdRates.headers').map((h, i) => <th key={i}>{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {rdRates.map((item, i) => (
                        <tr key={i}>
                          <td>{item.period}</td>
                          <td className="rate-value">{item.rate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{t('home.loanTypes.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
            </div>
            <div className="loan-types-grid">
              {loanTypes.map((loan, i) => {
                const icons = [HomeIcon, Handshake, Car, Store, Building2]
                const colors = ['#1a73e8', '#c8a44e', '#e65100', '#1565c0', '#2e7d32']
                return (
                  <div key={i} className={`loan-type-card card${i === 1 ? ' highlighted' : ''}`}>
                    <div className="loan-type-icon" style={{ background: `${colors[i]}15`, color: colors[i] }}>
                      {createElement(icons[i], { size: 28 })}
                    </div>
                    <h4>{loan}</h4>
                    {i === 1 && <span className="loan-range-badge">₹30k - ₹50k</span>}
                  </div>
                )
              })}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{t('home.facilities.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
              <p>{t('home.facilities.subtitle')}</p>
            </div>
            <div className="facilities-grid">
              {facilities.map((facility, i) => (
                <div key={i} className="facility-card card">
                  <div className="facility-icon">
                    {createElement(facilityIcons[i], { size: 28 })}
                  </div>
                  <h4>{facility}</h4>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{t('home.features.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
              <p>{t('home.features.subtitle')}</p>
            </div>
            <div className="features-grid">
              {features.map((feat, i) => (
                <div key={i} className="feature-card card">
                  <div className="feature-icon-wrap">
                    {createElement(featureIcons[i], { size: 32 })}
                  </div>
                  <h3>{feat.title}</h3><p>{feat.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="section section-alt" id="testimonials">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{t('home.testimonials.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
              <p>{t('home.testimonials.subtitle')}</p>
            </div>
          </ScrollReveal>
          <div className="testimonials-carousel">
            {testimonialItems.map((tItem, i) => (
              <div key={i} className="testimonial-slide">
                <div className="testimonial-card">
                  <div className="testimonial-stars">
                    {[...Array(5)].map((_, s) => <Star key={s} size={16} className="star-filled" />)}
                  </div>
                  <p className="testimonial-text">"{tItem.text}"</p>
                  <div className="testimonial-author">
                    <div className="testimonial-avatar" style={{ background: `hsl(${i * 60}, 50%, 45%)` }}>
                      {tItem.name.charAt(0)}
                    </div>
                    <div>
                      <strong>{tItem.name}</strong>
                      <span>{tItem.role}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
        <div className="container">
          <ScrollReveal>
            <div className="section-title">
              <h2>{t('home.branches.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
            </div>
            <div className="branches-home-grid">
              {branches.map((b, i) => (
                <div key={i} className="branch-home-card card">
                  <div className="branch-home-header">
                    <Building2 size={20} />
                    <h4>{b.name}</h4>
                  </div>
                  <p><MapPin size={16} /> {b.address}</p>
                  <p><Phone size={16} /> {b.phone}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>{t('home.cta.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
            <p>{t('home.cta.desc')}</p>
            <div className="cta-buttons">
              <Link to="/login" className="btn btn-secondary btn-lg">{t('home.cta.openAccount')} <ChevronRight size={20} /></Link>
              <Link to="/contact" className="btn btn-outline btn-lg" style={{ borderColor: '#fff', color: '#fff' }}>{t('home.cta.visitBranch')}</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
