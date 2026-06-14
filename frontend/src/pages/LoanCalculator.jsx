import { useState } from 'react'
import { useLanguage } from '../i18n/useLanguage'
import { Calculator, IndianRupee, Calendar, Percent, Download } from 'lucide-react'

export default function LoanCalculator() {
  const { t } = useLanguage()
  const [amount, setAmount] = useState(1000000)
  const [rate, setRate] = useState(8.5)
  const [tenure, setTenure] = useState(20)
  const [result, setResult] = useState(null)

  const calculateEMI = () => {
    const P = amount
    const r = rate / 12 / 100
    const n = tenure * 12
    if (P <= 0 || r <= 0 || n <= 0) return
    const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1)
    const totalPayment = emi * n
    const totalInterest = totalPayment - P
    setResult({ emi: Math.round(emi), totalInterest: Math.round(totalInterest), totalPayment: Math.round(totalPayment), principal: P })
  }

  const formatCurrency = (val) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val)

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <h1>{t('loanCalc.title')} <span className="text-secondary">EMI</span></h1>
          <p>{t('loanCalc.subtitle')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="calculator-grid">
            <div className="calculator-inputs card">
              <h3>{t('loanCalc.enterDetails')}</h3>
              <div className="input-group">
                <label><IndianRupee size={16} /> {t('loanCalc.amount')}</label>
                <input type="range" min="100000" max="50000000" step="100000" value={amount} onChange={(e) => { setAmount(Number(e.target.value)); setResult(null) }} />
                <div className="range-labels"><span>₹1,00,000</span><span className="range-value">{formatCurrency(amount)}</span><span>₹5,00,00,000</span></div>
              </div>
              <div className="input-group">
                <label><Percent size={16} /> {t('loanCalc.interest')}</label>
                <input type="range" min="1" max="20" step="0.1" value={rate} onChange={(e) => { setRate(Number(e.target.value)); setResult(null) }} />
                <div className="range-labels"><span>1%</span><span className="range-value">{rate}%</span><span>20%</span></div>
              </div>
              <div className="input-group">
                <label><Calendar size={16} /> {t('loanCalc.tenure')}</label>
                <input type="range" min="1" max="30" step="1" value={tenure} onChange={(e) => { setTenure(Number(e.target.value)); setResult(null) }} />
                <div className="range-labels"><span>1 Year</span><span className="range-value">{tenure} Years</span><span>30 Years</span></div>
              </div>
              <button className="btn btn-primary btn-lg calculate-btn" onClick={calculateEMI}><Calculator size={20} /> {t('loanCalc.calculate')}</button>
            </div>

            <div className="calculator-result">
              {result ? (
                <div className="result-card card">
                  <h3>{t('loanCalc.summary')}</h3>
                  <div className="result-emi"><span className="result-label">{t('loanCalc.monthlyEMI')}</span><span className="result-emi-amount">{formatCurrency(result.emi)}</span></div>
                  <div className="result-breakdown">
                    <div className="result-item"><span>{t('loanCalc.principal')}</span><strong>{formatCurrency(result.principal)}</strong></div>
                    <div className="result-item"><span>{t('loanCalc.totalInterest')}</span><strong>{formatCurrency(result.totalInterest)}</strong></div>
                    <div className="result-item total"><span>{t('loanCalc.totalPayment')}</span><strong>{formatCurrency(result.totalPayment)}</strong></div>
                  </div>
                  <div className="result-pie">
                    <div className="pie-bar"><div className="pie-fill principal" style={{ width: `${(result.principal / result.totalPayment) * 100}%` }} /><div className="pie-fill interest" style={{ width: `${(result.totalInterest / result.totalPayment) * 100}%` }} /></div>
                    <div className="pie-legend"><span><span className="dot principal" /> {t('loanCalc.principal')} ({Math.round((result.principal / result.totalPayment) * 100)}%)</span><span><span className="dot interest" /> {t('loanCalc.totalInterest')} ({Math.round((result.totalInterest / result.totalPayment) * 100)}%)</span></div>
                  </div>
                  <button className="btn btn-outline" onClick={() => window.print()}><Download size={16} /> {t('loanCalc.download')}</button>
                </div>
              ) : (
                <div className="result-placeholder card">
                  <Calculator size={64} />
                  <h3>{t('loanCalc.readyTitle')}</h3>
                  <p>{t('loanCalc.readyDesc')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </>
  )
}
