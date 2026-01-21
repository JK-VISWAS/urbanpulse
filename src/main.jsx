import 'leaflet/dist/leaflet.css';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './App.css'
import App from './App.jsx'
import { BrowserRouter, Routes } from 'react-router-dom';
import { Route } from 'lucide-react';
import ReactDOM from 'react-dom/client';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter basename="/URBANPULSE/">
      <Routes>
        <Route path="/" element={<App />} />
      </Routes>
      </BrowserRouter>
  </React.StrictMode>,
)
