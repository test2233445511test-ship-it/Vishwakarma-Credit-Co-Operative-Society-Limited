import { createElement } from 'react'
import { useLanguage } from '../i18n/useLanguage'
import {
  Target, Eye, Shield, Handshake, Award, TrendingUp,
  ChevronRight
} from 'lucide-react'
import { Link } from 'react-router-dom'

const valueIcons = [Shield, Handshake, Award, TrendingUp]

export default function About() {
  const { t } = useLanguage()
  const values = t('home.values')
  const timelineItems = t('home.timeline.items')

  return (
    <div className="page-wrapper">
      <section className="page-hero">
        <div className="container">
          <h1>{t('home.about.label')} <span className="text-secondary">{t('nav.brandName')}</span></h1>
          <p>{t('home.timeline.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
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
        </div>
      </section>

      <section className="section section-alt" id="timeline">
        <div className="container">
          <div className="section-title">
            <h2>{t('home.timeline.title')} <span className="text-secondary">{t('nav.brandName')}</span></h2>
            <p>{t('home.timeline.subtitle')}</p>
          </div>
          <div className="timeline">
            {timelineItems && timelineItems.map((item, i) => (
              <div key={i} className={`timeline-item ${i % 2 === 0 ? 'left' : 'right'}`}>
                <div className="timeline-content card">
                  <span className="timeline-year">{item.year}</span>
                  <p>{item.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="cta-simple">
            <h2>{t('services.cta')}</h2>
            <p>{t('services.ctaDesc')}</p>
            <Link to="/contact" className="btn btn-secondary btn-lg">
              {t('services.ctaBtn')} <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
