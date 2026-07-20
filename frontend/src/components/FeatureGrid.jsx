import React from 'react';
import { motion } from 'framer-motion';
import './FeatureGrid.css';

const features = [
  {
    id: '01',
    title: 'Lightning Execution',
    description: 'Agents execute on X Layer with minimal latency, ensuring you never miss a market opportunity. Built for speed and absolute precision.'
  },
  {
    id: '02',
    title: 'Secure Workflows',
    description: 'Every autonomous action is constrained by strict cryptographic risk parameters and audited templates. Trustless operation.'
  },
  {
    id: '03',
    title: 'OKX Integration',
    description: 'Natively integrated into the OKX AI marketplace for seamless deployment and scale. A turnkey solution for builders.'
  }
];

export default function FeatureGrid() {
  return (
    <section className="section feature-section" id="workflows">
      <div className="container">
        <motion.div 
          className="feature-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2>Technical Specifications</h2>
        </motion.div>
        
        <div className="feature-list">
          {features.map((feat, index) => (
            <motion.div 
              key={feat.id} 
              className="feature-item"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, ease: "easeOut", delay: index * 0.1 }}
            >
              <div className="feature-id">{feat.id}</div>
              <div className="feature-text">
                <h3 className="feature-title">{feat.title}</h3>
                <p className="feature-desc">{feat.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
