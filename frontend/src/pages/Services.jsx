import { createElement } from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../i18n/useLanguage'
import {
  PiggyBank, TrendingUp, Home, Car, Gem,
  Building2, ChevronRight, CheckCircle
} from 'lucide-react'

const svgIcons = [PiggyBank, TrendingUp, Home, Car, Gem, Building2]

export default function Services() {
  const { t } = useLanguage()
  const items = t('services.items')

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{t('services.title')} <span className="text-secondary">{t('nav.brandName')}</span></h1>
          <p>{t('services.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="services-grid-full">
            {items.map((svc, i) => (
              <div key={i} className="service-detail-card card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="service-detail-header">
                  <div className="service-detail-icon">
                    {svgIcons[i] && createElement(svgIcons[i], { size: 32 })}
                  </div>
                  <div>
                    <h3>{svc.title}</h3>
                    <p>{svc.desc}</p>
                  </div>
                </div>
                <ul className="service-benefits">
                  {svc.benefits.map((b, j) => (
                    <li key={j}>
                      <CheckCircle size={16} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/contact" className="btn btn-primary">
                  {t('services.enquire')} <ChevronRight size={16} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt">
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
    </>
  )
}
