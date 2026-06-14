import { createContext, useState, useCallback } from 'react'

const AuthContext = createContext(null)

function getInitialUser() {
  try {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    if (token && savedUser) {
      return JSON.parse(savedUser)
    }
  } catch {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  }
  return null
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(getInitialUser)

  const login = useCallback(async (email, password) => {
    // Mock login for testing credentials
    if ((email === 'customer@test.com' || email === 'manager@test.com') && password === 'password123') {
      const mockUser = {
        id: email === 'manager@test.com' ? 999 : 888,
        name: email === 'manager@test.com' ? 'Admin' : 'Test Customer',
        email: email,
        phone: '9876543210'
      }
      const data = { token: 'mock-jwt-token-for-testing', user: mockUser }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      setUser(data.user)
      return data
    }

    const res = await fetch('http://localhost:8080/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Login failed')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const requestOtp = useCallback(async (accountNumber, mobileNumber) => {
    const res = await fetch('http://localhost:8080/api/auth/request-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber, mobileNumber }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Failed to request OTP')
    }
    return res.text()
  }, [])

  const verifyOtp = useCallback(async (accountNumber, mobileNumber, otp) => {
    const res = await fetch('http://localhost:8080/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountNumber, mobileNumber, otp }),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Failed to verify OTP')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const register = useCallback(async (userData) => {
    const res = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err || 'Registration failed')
    }
    const data = await res.json()
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data.user))
    setUser(data.user)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, requestOtp, verifyOtp, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export { AuthContext }
