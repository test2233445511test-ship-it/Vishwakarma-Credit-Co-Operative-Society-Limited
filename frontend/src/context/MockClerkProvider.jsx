/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react'

const MockAuthContext = createContext()

export function ClerkProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(true)
  const [user] = useState({
    id: 'user_123',
    fullName: 'Admin User',
    primaryEmailAddress: { emailAddress: 'admin@bank.com' },
    publicMetadata: { role: 'MANAGER' }
  })

  const getToken = async () => 'mock_jwt_token_123'
  const signOut = () => setIsSignedIn(false)

  return (
    <MockAuthContext.Provider value={{
      isLoaded: true,
      isSignedIn,
      user,
      getToken,
      signOut
    }}>
      {children}
    </MockAuthContext.Provider>
  )
}

export function useUser() {
  const context = useContext(MockAuthContext)
  return {
    isLoaded: context?.isLoaded ?? true,
    isSignedIn: context?.isSignedIn ?? true,
    user: context?.user ?? { id: 'user_123', fullName: 'Mock', publicMetadata: { role: 'MANAGER' } }
  }
}

export function useAuth() {
  const context = useContext(MockAuthContext)
  return {
    isLoaded: context?.isLoaded ?? true,
    isSignedIn: context?.isSignedIn ?? true,
    getToken: context?.getToken ?? (async () => 'mock_jwt_token_123'),
    signOut: context?.signOut ?? (() => {})
  }
}

export function SignIn() {
  return <div style={{ padding: '20px', border: '1px solid #ddd' }}><h2>Mock SignIn</h2><button onClick={() => window.location.href='/dashboard'} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none' }}>Click to Login</button></div>
}

export function SignUp() {
  return <div style={{ padding: '20px', border: '1px solid #ddd' }}><h2>Mock SignUp</h2><button onClick={() => window.location.href='/dashboard'} style={{ padding: '10px 20px', background: '#007bff', color: '#fff', border: 'none' }}>Click to Register</button></div>
}

export function SignedIn({ children }) {
  return children
}

export function SignedOut() {
  return null
}

export function useClerk() {
  const context = useContext(MockAuthContext)
  return {
    signOut: context?.signOut ?? (() => {})
  }
}

export function UserButton() {
  return <div style={{width: 32, height: 32, borderRadius: '50%', background: '#ccc'}} title="Mock User Button" />
}
