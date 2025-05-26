import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.tsx'
import BattleshipLobby from './Pages/Lobby/index.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/lobby" element={<BattleshipLobby />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
