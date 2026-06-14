import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'
import { Calculator, IndianRupee, Calendar, Percent, TrendingUp, Download } from 'lucide-react'

export default function FDCalculator() {
  const { t } = useLanguage()
  const [amount, setAmount] = useState(100000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(12)
  const [result, setResult] = useState(null)

  const calculateFD = () => {
    const P = amount
    const r = rate / 100
    const tVal = tenure / 12
    const maturityAmount = P * Math.pow(1 + r / 4, 4 * tVal)
    const interestEarned = maturityAmount - P
    setResult({ maturityAmount: Math.round(maturityAmount), interestEarned: Math.round(interestEarned), principal: P })
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  const features = t('fdCalc.features')

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{t('fdCalc.title')} <span className="text-secondary">FD</span></h1>
          <p>{t('fdCalc.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="calculator-grid">
            <div className="calculator-inputs card">
              <h3>{t('fdCalc.enterDetails')}</h3>
              <div className="input-group">
                <label><IndianRupee size={16} /> {t('fdCalc.amount')}</label>
                <input type="range" min="5000" max="10000000" step="5000" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setResult(null) }} />
                <div className="range-labels"><span>₹5,000</span><span className="range-value">{formatCurrency(amount)}</span><span>₹1,00,00,000</span></div>
              </div>
              <div className="input-group">
                <label><Percent size={16} /> {t('fdCalc.interest')}</label>
                <input type="range" min="3" max="12" step="0.1" value={rate} onChange={(e) => { setRate(Number(e.target.value)); setResult(null) }} />
                <div className="range-labels"><span>3%</span><span className="range-value">{rate}%</span><span>12%</span></div>
              </div>
              <div className="input-group">
                <label><Calendar size={16} /> {t('fdCalc.tenure')}</label>
                <input type="range" min="1" max="120" step="1" value={tenure} onChange={(e) => { setTenure(Number(e.target.value)); setResult(null) }} />
                <div className="range-labels"><span>1 Month</span><span className="range-value">{tenure} Months</span><span>120 Months</span></div>
              </div>
              <button className="btn btn-primary btn-lg calculate-btn" onClick={calculateFD}><Calculator size={20} /> {t('fdCalc.calculate')}</button>
            </div>

            <div className="calculator-result">
              {result ? (
                <div className="result-card card">
                  <h3>{t('fdCalc.summary')}</h3>
                  <div className="result-emi"><span className="result-label">{t('fdCalc.maturity')}</span><span className="result-emi-amount">{formatCurrency(result.maturityAmount)}</span></div>
                  <div className="result-breakdown">
                    <div className="result-item"><span>{t('fdCalc.deposit')}</span><strong>{formatCurrency(result.principal)}</strong></div>
                    <div className="result-item"><span>{t('fdCalc.interestEarned')}</span><strong className="text-secondary">+{formatCurrency(result.interestEarned)}</strong></div>
                    <div className="result-item total"><span>{t('fdCalc.totalValue')}</span><strong>{formatCurrency(result.maturityAmount)}</strong></div>
                  </div>
                  <div className="result-pie">
                    <div className="pie-bar"><div className="pie-fill principal" style={{ width: `${(result.principal / result.maturityAmount) * 100}%` }} /><div className="pie-fill interest" style={{ width: `${(result.interestEarned / result.maturityAmount) * 100}%` }} /></div>
                    <div className="pie-legend"><span><span className="dot principal" /> {t('fdCalc.deposit')} ({Math.round((result.principal / result.maturityAmount) * 100)}%)</span><span><span className="dot interest" /> {t('fdCalc.interestEarned')} ({Math.round((result.interestEarned / result.maturityAmount) * 100)}%)</span></div>
                  </div>
                  <div className="fd-features">
                    <h4>{t('fdCalc.featuresTitle')}</h4>
                    <ul>{features.map((f, i) => <li key={i}><TrendingUp size={14} /> {f}</li>)}</ul>
                  </div>
                  <button className="btn btn-outline" onClick={() => window.print()}><Download size={16} /> {t('fdCalc.download')}</button>
                </div>
              ) : (
                <div className="result-placeholder card">
                  <TrendingUp size={64} />
                  <h3>{t('fdCalc.readyTitle')}</h3>
                  <p>{t('fdCalc.readyDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
