import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

// Dynamically set favicon via Vite bundle
import favicon from './public/favicon-full-logo-circular.png'

const link = (document.querySelector("link[rel*='icon']") || document.createElement('link')) as HTMLLinkElement
link.type = 'image/png'
link.rel = 'icon'
link.href = favicon
document.getElementsByTagName('head')[0].appendChild(link)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)