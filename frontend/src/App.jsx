import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';

function App() {
  return (
    <Router>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/marketplace" element={<Marketplace />} />
        </Routes>
      </main>
      <footer style={{ padding: '80px 40px', borderTop: '1px solid var(--color-line)', marginTop: '120px' }}>
        <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.85rem', color: 'var(--color-stone)' }}>
          © 2026 OKX AI GENESIS HACKATHON
        </p>
      </footer>
    </Router>
  );
}

export default App;
