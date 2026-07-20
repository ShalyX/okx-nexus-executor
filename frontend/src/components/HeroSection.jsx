import React from 'react';
import { motion } from 'framer-motion';
import './HeroSection.css';
import agentSculpture from '../assets/agent_sculpture.jpg';

export default function HeroSection() {
  return (
    <section className="hero-section section">
      <div className="container hero-container">
        <div className="hero-content">
          <motion.div 
            className="hero-data"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <p><strong>[SYSTEM]</strong> ONLINE</p>
            <p><strong>[LATENCY]</strong> 12MS</p>
            <p><strong>[LOC]</strong> X LAYER</p>
            <p className="signal-text"><strong>[STATE]</strong> AWAITING INSTRUCTION</p>
          </motion.div>
          
          <motion.h1 
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          >
            AUTONOMOUS<br/>
            AGENTS.
          </motion.h1>
          
          <motion.p 
            className="hero-subtitle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
          >
            Bespoke instruments for automated decentralized finance on the OKX AI marketplace.
          </motion.p>
        </div>
        
        <motion.div 
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
        >
          <img src={agentSculpture} alt="Abstract Chrome Sculpture" className="sculpture-img" />
        </motion.div>
      </div>
    </section>
  );
}
