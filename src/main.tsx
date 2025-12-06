import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Set CSS variable for background image path so CSS can access it
document.documentElement.style.setProperty('--bg-image-url', `url(${import.meta.env.BASE_URL}images/background.jpg)`)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
