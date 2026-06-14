import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle, Navigation } from 'lucide-react'
import { apiUrl } from '../services/apiUrl'

export default function Contact() {
  const { t } = useLanguage()
  const [form, setForm] = useState({ name: '', email: '', subject: '', apptType: '', message: '' })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [locating, setLocating] = useState(null)

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(apiUrl('/contact'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error(t('errors.sendFailed'))
      setSubmitted(true)
      setForm({ name: '', email: '', subject: '', apptType: '', message: '' })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const branches = t('contact.branches')

  const handleGetDirection = (branch) => {
    const dest = branch.coords || encodeURIComponent(`${branch.name}, ${branch.address}, Davangere`)
    const url = branch.coords
      ? `https://www.google.com/maps/dir//${branch.coords}`
      : `https://www.google.com/maps/search/${encodeURIComponent(`${branch.name}, ${branch.address}, Davangere`)}`
    if (!navigator.geolocation) {
      window.open(url, '_blank')
      return
    }
    const key = branch.coords || `${branch.name}, ${branch.address}, Davangere`
    setLocating(key)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        window.open(
          `https://www.google.com/maps/dir/${latitude},${longitude}/${dest}`,
          '_blank'
        )
        setLocating(null)
      },
      () => {
        window.open(url, '_blank')
        setLocating(null)
      }
    )
  }

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{t('contact.title')} <span className="text-secondary">{t('nav.brandName')}</span></h1>
          <p>{t('contact.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>{t('contact.getInTouch')}</h2>
              <p>{t('contact.desc')}</p>

              <div className="contact-details">
                <div className="contact-item">
                  <MapPin size={20} />
                  <div>
                    <h4>{t('contact.headOffice')}</h4>
                    <p>{t('contact.address')}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Phone size={20} />
                  <div>
                    <h4>{t('login.phone')}</h4>
                    <p>{t('contact.phone')}</p>
                    <p>{t('contact.phone2')}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Mail size={20} />
                  <div>
                    <h4>{t('login.email')}</h4>
                    <p>{t('contact.email')}</p>
                    <p>{t('contact.email2')}</p>
                  </div>
                </div>
                <div className="contact-item">
                  <Clock size={20} />
                  <div>
                    <h4>{t('footer.contactInfo')}</h4>
                    <p>{t('contact.hours')}</p>
                    <p>{t('contact.sunday')}</p>
                  </div>
                </div>
              </div>

              <div className="branches-section">
                <h3>{t('contact.ourBranches')}</h3>
                <div className="branches-grid">
                  {branches.map((b, i) => (
                    <div key={i} className="branch-card">
                      <h4>{b.name}</h4>
                      <p><MapPin size={14} /> {b.address}</p>
                      <p><Phone size={14} /> {b.phone}</p>
                      <button
                        className="btn btn-outline btn-sm map-btn"
                        onClick={() => handleGetDirection(b)}
                        disabled={locating === (b.coords || `${b.name}, ${b.address}, Davangere`)}
                      >
                        <Navigation size={14} />
                        {locating === (b.coords || `${b.name}, ${b.address}, Davangere`) ? (t('contact.locating') || 'Locating...') : (t('contact.getMap') || 'Get Map')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              {submitted ? (
                <div className="success-message">
                  <CheckCircle size={48} />
                  <h3>{t('login.msgSent')}</h3>
                  <p>{t('login.msgSentDesc')}</p>
                  <button className="btn btn-primary" onClick={() => setSubmitted(false)}>{t('login.sendAnother')}</button>
                </div>
              ) : (
                <>
                  <h3>{t('contact.sendMsg')}</h3>
                  {error && <div className="form-error">{error}</div>}
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="input-group">
                      <label>{t('contact.nameLabel')}</label>
                      <input type="text" name="name" value={form.name} onChange={handleChange} placeholder={t('contact.namePH')} required />
                    </div>
                    <div className="input-group">
                      <label>{t('contact.emailLabel')}</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder={t('contact.emailPH')} required />
                    </div>
                    <div className="input-group">
                      <label>{t('contact.apptType')}</label>
                      <select name="apptType" value={form.apptType} onChange={handleChange} required>
                        <option value="">{t('contact.apptType')}</option>
                        <option value="Current Account">{t('contact.apptCurrent')}</option>
                        <option value="Savings Account">{t('contact.apptSavings')}</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t('contact.subjectLabel')}</label>
                      <select name="subject" value={form.subject} onChange={handleChange} required>
                        <option value="">{t('contact.subjectLabel')}</option>
                        <option value="Account Opening">{t('contact.subjects.accOpen')}</option>
                        <option value="Loan Inquiry">{t('contact.subjects.loanInq')}</option>
                        <option value="FD Inquiry">{t('contact.subjects.fdInq')}</option>
                        <option value="Complaint">{t('contact.subjects.complaint')}</option>
                        <option value="Other">{t('contact.subjects.other')}</option>
                      </select>
                    </div>
                    <div className="input-group">
                      <label>{t('contact.msgLabel')}</label>
                      <textarea name="message" value={form.message} onChange={handleChange} placeholder={t('contact.msgPH')} required />
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                      {loading ? '...' : <><Send size={18} /> {t('contact.sendBtn')}</>}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
