import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './Marketplace.css';

const mockAgents = [
  { id: 'MK-01', name: 'Smart-Auditor-V2', protocol: 'Code Analysis', latency: 'N/A', success: '100%', endpoint: 'http://localhost:3001/api/audit' },
  { id: 'MK-02', name: 'Sentiment-Trader', protocol: 'OKX v5 API', latency: '12ms', success: '89.4%', endpoint: 'http://localhost:8000/api/trade-sentiment' },
  { id: 'MK-03', name: 'Nexus-Executor', protocol: 'X Layer AMMs', latency: '8ms', success: '99.9%', endpoint: 'onchain' },
];

export default function Marketplace() {
  const [logs, setLogs] = useState({});

  const handleDeploy = async (agent) => {
    setLogs(prev => ({ ...prev, [agent.id]: 'Initializing deployment...\nQueuing job to prevent rate limits...' }));
    
    if (agent.endpoint === 'onchain') {
      setTimeout(() => setLogs(prev => ({ ...prev, [agent.id]: 'Contract NexusExecutor.sol verified on X Layer Mainnet at: 0xa68a7462a7565b5a9726d0045af2327c54e2462f' })), 1000);
      return;
    }

    try {
      // 1. Submit Job to Queue
      const res = await fetch(agent.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contractAddress: '0x123...abc', walletAddress: '0xDemoUser' })
      });
      const data = await res.json();
      
      if (data.status !== 'queued') throw new Error('Failed to queue job');
      
      setLogs(prev => ({ ...prev, [agent.id]: `Job Queued (ID: ${data.jobId}).\nPolling for completion...` }));

      // 2. Poll for Completion
      const pollEndpoint = agent.id === 'MK-01' 
        ? `http://localhost:3001/api/job/${data.jobId}`
        : `http://localhost:8000/api/trade-job/${data.jobId}`;

      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(pollEndpoint);
          const pollData = await pollRes.json();
          
          if (pollData.status === 'completed' || pollData.status === 'failed') {
            clearInterval(pollInterval);
            let resultData = pollData.result || pollData;
            if (typeof resultData === 'string') {
              try { resultData = JSON.parse(resultData); } catch (e) {} // Parse stringified JSON if needed
            }
            setLogs(prev => ({ ...prev, [agent.id]: JSON.stringify(resultData, null, 2) }));
          } else {
            setLogs(prev => ({ ...prev, [agent.id]: `Job Queued (ID: ${data.jobId}).\nPolling for completion... (Status: ${pollData.status})` }));
          }
        } catch (e) {
            // Polling error, do not clear interval yet
        }
      }, 2000);

    } catch (e) {
      setLogs(prev => ({ ...prev, [agent.id]: 'Service offline or overloaded. Try again later.' }));
    }
  };

  return (
    <section className="section mkt-section">
      <div className="container">
        <motion.div 
          className="mkt-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h1>AVAILABLE AGENTS</h1>
          <p>Live inventory on the OKX AI Marketplace</p>
        </motion.div>
        
        <div className="mkt-grid">
          {mockAgents.map((agent, index) => (
            <motion.div 
              key={agent.id} 
              className="mkt-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: index * 0.1 }}
            >
              <div className="mkt-card-header">
                <span className="mkt-id">{agent.id}</span>
                <div className="mkt-status"></div>
              </div>
              <h2 className="mkt-name">{agent.name}</h2>
              
              <div className="mkt-stats">
                <div className="stat">
                  <span className="stat-label">PROTOCOL</span>
                  <span className="stat-value">{agent.protocol}</span>
                </div>
              </div>
              
              <button className="btn btn-primary mkt-btn" onClick={() => handleDeploy(agent)}>
                DEPLOY & RUN
              </button>

              {logs[agent.id] && (
                <div className="mkt-log">
                  <pre>{logs[agent.id]}</pre>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
