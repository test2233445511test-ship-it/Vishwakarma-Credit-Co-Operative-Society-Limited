import { SignIn, SignUp, useAuth } from '@clerk/clerk-react'
import { useState } from 'react'
import { Building2 } from 'lucide-react'
import { useLanguage } from '../i18n/useLanguage'
import { Navigate } from 'react-router-dom'

export default function Login() {
  const { isSignedIn } = useAuth()
  const { t } = useLanguage()
  const [isLogin, setIsLogin] = useState(true)

  if (isSignedIn) {
    return <Navigate to="/dashboard" replace />
  }

  const benefits = t('login.benefits')

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-sidebar">
          <Building2 size={48} />
          <h2>{t('login.sidebarTitle')}</h2>
          <p>{t('login.sidebarDesc')}</p>
          <div className="auth-benefits">
            {benefits.map((b, i) => (
              <div key={i} className="auth-benefit">
                <div className="benefit-dot" />
                <span>{b}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="auth-form-wrapper">
          <div className="auth-form-header">
            <h3>{isLogin ? t('login.welcomeBack') : t('login.createAccount')}</h3>
            <p>{isLogin ? t('login.signIn') : t('login.signUp')}</p>
          </div>

          {isLogin ? (
            <SignIn
              appearance={{
                elements: {
                  rootBox: 'width:100%',
                  card: 'box-shadow:none; padding:0',
                  header: 'display:none',
                  socialButtonsBlockButton: 'padding:10px 16px; font-size:0.9rem',
                  formButtonPrimary: 'background:var(--primary); font-size:0.95rem; padding:12px',
                  footerAction: 'font-size:0.85rem',
                  formFieldLabel: 'font-size:0.85rem; font-weight:600',
                  formFieldInput: 'padding:12px 14px; font-size:0.95rem; border-radius:8px',
                }
              }}
              signUpUrl="/signup"
              afterSignInUrl="/dashboard"
            />
          ) : (
            <SignUp
              appearance={{
                elements: {
                  rootBox: 'width:100%',
                  card: 'box-shadow:none; padding:0',
                  header: 'display:none',
                  socialButtonsBlockButton: 'padding:10px 16px; font-size:0.9rem',
                  formButtonPrimary: 'background:var(--primary); font-size:0.95rem; padding:12px',
                  footerAction: 'font-size:0.85rem',
                  formFieldLabel: 'font-size:0.85rem; font-weight:600',
                  formFieldInput: 'padding:12px 14px; font-size:0.95rem; border-radius:8px',
                }
              }}
              signInUrl="/login"
              afterSignUpUrl="/dashboard"
            />
          )}

          <div className="auth-footer">
            <p>
              {isLogin ? t('login.noAccount') : t('login.haveAccount')}
              <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? t('login.registerHere') : t('login.signInHere')}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
