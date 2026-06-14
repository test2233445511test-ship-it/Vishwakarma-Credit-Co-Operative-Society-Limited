import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import { LanguageProvider } from './i18n/LanguageContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
)
