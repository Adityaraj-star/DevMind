import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Apply saved theme synchronously before React mounts
// to prevent flash of wrong theme on page load
const savedTheme = localStorage.getItem('devmind-theme')
if (savedTheme === 'light') {
    document.documentElement.classList.remove('dark')
} else {
    document.documentElement.classList.add('dark')
}

const rootEl = document.getElementById('root')
if (!rootEl) throw new Error('[DevMind] Root element #root not found in the DOM')

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
