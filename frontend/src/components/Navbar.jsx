import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="container nav-container">
        <div className="brand">
          <Link to="/" className="logo-text">AGENT</Link>
        </div>
        <nav className="nav-links">
          <a href="/#workflows">SPECIFICATIONS</a>
          <Link to="/marketplace">MARKETPLACE</Link>
          <a href="https://web3.okx.com/xlayer/build-x-series" target="_blank" rel="noopener noreferrer" className="btn btn-secondary nav-btn">VIEW GENESIS</a>
        </nav>
      </div>
    </header>
  );
}
