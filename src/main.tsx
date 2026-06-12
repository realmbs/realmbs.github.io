import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles/index.css'

// A note for anyone curious enough to open DevTools.
console.log(
  '%c MARK BLAHA %c\n\nCybersecurity × Business Development\nHand-built with React, three.js, and Tailwind — no template.\nCurious how something works? Source ships unminified in dev.\n\nSay hi → markblaha96@icloud.com\n',
  'font-family:monospace;font-size:14px;font-weight:700;color:#0a0a0c;background:#d7ff3f;padding:4px 8px;',
  'font-family:monospace;font-size:12px;color:#a3a3ae;',
)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
