import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import About from './pages/About'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Services from './pages/Services'
import Contact from './pages/Contact'
import LoanCalculator from './pages/LoanCalculator'
import FDCalculator from './pages/FDCalculator'
import Directors from './pages/Directors'
import CustomerRegistration from './pages/CustomerRegistration'
import Forbidden from './pages/Forbidden'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

export default function App() {
  useEffect(() => {
    const data = { page: window.location.pathname, referrer: document.referrer || '' }
    fetch('http://localhost:8080/api/visitor/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(() => {})
  }, [])
  return (
    <div className="app">
      <Navbar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/403" element={<Forbidden />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/customer" element={
            <ProtectedRoute requiredRole="MEMBER">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/manager" element={
            <ProtectedRoute requiredRole="STAFF">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/admin" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/dashboard/super-admin" element={
            <ProtectedRoute requiredRole="SUPER_ADMIN">
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/loan-calculator" element={<LoanCalculator />} />
          <Route path="/fd-calculator" element={<FDCalculator />} />
          <Route path="/directors" element={<Directors />} />
          <Route path="/data-entry" element={
            <ProtectedRoute requiredRole="STAFF">
              <CustomerRegistration />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
