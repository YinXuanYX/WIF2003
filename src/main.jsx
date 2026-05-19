import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.jsx'
import './styles/main.scss'
import 'bootstrap-icons/font/bootstrap-icons.css'
import pigIcon from './assets/PigIcon.png'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

const savedTheme = localStorage.getItem('finplan-theme') || 'light'
document.documentElement.setAttribute('data-bs-theme', savedTheme)

// Ensure splash image (from src/assets) is used for the splash overlay
function setSplashImage() {
  const el = document.getElementById('splash-img')
  const svgEl = document.getElementById('splash-svg')
  if (!el) return false

  // Show image when it loads, hide SVG fallback. If image errors, keep SVG.
  el.onload = function () {
    el.style.display = 'block'
    if (svgEl) svgEl.style.display = 'none'
  }
  el.onerror = function () {
    el.style.display = 'none'
    if (svgEl) svgEl.style.display = 'block'
  }

  // Set the imported asset URL (Vite will resolve it).
  el.src = pigIcon
  return true
}

if (!setSplashImage()) {
  // If the element isn't present yet, try after DOMContentLoaded
  document.addEventListener('DOMContentLoaded', setSplashImage)
}

;(function setFavicon(){
  try{
    const link = document.querySelector('link[rel="icon"]') || document.createElement('link')
    link.rel = 'icon'
    link.type = 'image/png'
    link.href = pigIcon
    if (!document.querySelector('link[rel="icon"]')) document.head.appendChild(link)
  }catch(e){ /* ignore */ }
})()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

