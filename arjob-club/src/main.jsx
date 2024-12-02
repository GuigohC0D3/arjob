import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import  Home  from './components/pages/Home.jsx'
import App from './App.jsx'
import ComandaVirtual from './components/pages/ComandaVirtual.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Home />
    <ComandaVirtual />
  </StrictMode>,
)
