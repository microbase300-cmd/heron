import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './index.css'

import PublicLayout from './App'
import Home from './pages/Home'
import Strategies from './pages/Strategies'
import Pricing from './pages/Pricing'
import Company from './pages/Company'
import Contact from './pages/Contact'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/strategies" element={<Strategies />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/company" element={<Company />} />
          <Route path="/contact" element={<Contact />} />
          {/* Fallback route */}
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)