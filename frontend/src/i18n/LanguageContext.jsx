import { createContext, useState, useCallback, useContext } from 'react'
import translations from './translations'

const LanguageContext = createContext(null)

const LANG_KEY = 'vcs_language'

function getSavedLang() {
  try { return localStorage.getItem(LANG_KEY) || 'en' } catch { return 'en' }
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(getSavedLang)

  const changeLanguage = useCallback((code) => {
    setLang(code)
    try { localStorage.setItem(LANG_KEY, code) } catch { /* ignore */ }
  }, [])

  const t = useCallback((path, replace = {}) => {
    const keys = path.split('.')
    let value = translations[lang]
    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = value[key]
      } else {
        let fallback = translations['en']
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k]
          } else {
            return path
          }
        }
        value = fallback
        break
      }
    }

    if (typeof value === 'string' && Object.keys(replace).length > 0) {
      for (const [key, val] of Object.entries(replace)) {
        value = value.replace(`{${key}}`, val)
      }
    }

    return value !== undefined ? value : path
  }, [lang])

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useLanguage = () => useContext(LanguageContext)
export { LanguageContext }
