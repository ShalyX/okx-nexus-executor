import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import './CallToAction.css';

export default function CallToAction() {
  return (
    <section className="section cta-section" id="integration">
      <div className="container cta-container">
        <motion.div 
          className="cta-content"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2>DEPLOY ON X LAYER</h2>
          <p>Join the Genesis Hackathon and build the next generation of AI Agents.</p>
        </motion.div>
        
        <motion.div 
          className="cta-action"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
        >
          <Link to="/marketplace" className="btn btn-primary cta-btn">
            VIEW MARKETPLACE
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
