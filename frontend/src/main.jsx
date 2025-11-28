import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'

// Get the publishable key from environment variables
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

// Check if publishable key is available
if (!PUBLISHABLE_KEY) {
  console.error('Missing Clerk Publishable Key. Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file.')
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider 
        publishableKey={PUBLISHABLE_KEY}
        afterSignOutUrl="/"
        appearance={{
          variables: {
            colorPrimary: '#10B981', // Green color to match your theme
          }
        }}
      >
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        fontFamily: 'system-ui'
      }}>
        <h1 style={{ color: '#EF4444', marginBottom: '1rem' }}>
          Clerk Configuration Error
        </h1>
        <p style={{ color: '#6B7280', textAlign: 'center' }}>
          Please set VITE_CLERK_PUBLISHABLE_KEY in your .env file<br />
          Get your keys from: <a href="https://dashboard.clerk.com" target="_blank" style={{ color: '#10B981' }}>Clerk Dashboard</a>
        </p>
      </div>
    )}
  </React.StrictMode>,
)