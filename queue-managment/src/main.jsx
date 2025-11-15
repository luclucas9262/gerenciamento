import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Login from './components/Login.jsx';
import Home from './components/Home.jsx';
import Filas from './components/Filas.jsx'; // <— NOVO

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/filas" element={<Filas />} /> {/* NOVA PÁGINA */}
      </Routes>
    </BrowserRouter>
  </StrictMode>
);