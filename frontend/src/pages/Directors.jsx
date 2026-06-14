import { useLanguage } from '../i18n/LanguageContext'

export default function Directors() {
  const { t } = useLanguage()
  const directors = t('home.directors.items')

  return (
    <div className="page-wrapper">
      <section className="page-hero">
        <div className="container">
          <h1>{t('home.directors.title')} <span className="text-secondary">{t('nav.brandName')}</span></h1>
        </div>
      </section>

      <section className="section" id="directors">
        <div className="container">
          <div className="directors-grid">
            {directors && directors.map((d, i) => (
              <div key={i} className="director-card card fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="director-avatar">{d.name.charAt(0)}</div>
                <h4>{d.name}</h4>
                <span className="director-designation">{d.designation}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
