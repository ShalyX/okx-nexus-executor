require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenAI } = require('@google/genai');
const { Queue, Worker } = require('bullmq');
const rateLimit = require('express-rate-limit');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const app = express();
const port = process.env.PORT || 3001;
const prisma = new PrismaClient();

// Setup Redis connection for BullMQ
const connection = {
  url: process.env.REDIS_URL || 'redis://localhost:6379'
};

const auditQueue = new Queue('auditQueue', { connection });

// Setup Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many audit requests from this IP, please try again later.',
});

app.use(cors());
app.use(express.json());
app.use('/api/', limiter);

// Input Validation Schema
const auditRequestSchema = z.object({
  contractAddress: z.string().min(1),
  walletAddress: z.string().min(1),
});

// Asynchronous Queueing Endpoint
app.post('/api/audit', async (req, res) => {
  try {
    const { contractAddress, walletAddress } = auditRequestSchema.parse(req.body);
    
    // Check if user exists to fetch their BYOK keys
    let user = await prisma.user.findUnique({ where: { walletAddress } });
    if (!user) {
      user = await prisma.user.create({ data: { walletAddress } });
    }

    // Create Job Execution tracking record in DB
    const jobExecution = await prisma.jobExecution.create({
      data: {
        userId: user.id,
        agentId: 'MK-01',
        status: 'pending'
      }
    });

    // Add job to BullMQ queue
    await auditQueue.add('auditContract', {
      jobId: jobExecution.id,
      contractAddress,
      userId: user.id
    });

    res.json({
      status: 'queued',
      message: 'Audit job has been queued successfully.',
      jobId: jobExecution.id
    });

  } catch (error) {
    res.status(400).json({ error: 'Invalid request', details: error.message });
  }
});

// Polling Endpoint for Frontend
app.get('/api/job/:jobId', async (req, res) => {
  try {
    const job = await prisma.jobExecution.findUnique({
      where: { id: req.params.jobId }
    });
    if (!job) return res.status(404).json({ error: 'Job not found' });
    
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch job status' });
  }
});

// Worker to process the jobs in the background
const worker = new Worker('auditQueue', async job => {
  const { jobId, contractAddress, userId } = job.data;
  
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    // In production, we use user.geminiApiKey.
    const apiKey = user.geminiApiKey;
    
    if (!apiKey) throw new Error('GEMINI_API_KEY missing for user. Please configure BYOK credentials.');
    
    const ai = new GoogleGenAI({ apiKey });
    
    const mockContractCode = `pragma solidity ^0.8.0; contract Token { mapping(address => uint) public balances; function transfer(address to, uint amount) public { balances[msg.sender] -= amount; balances[to] += amount; } }`;
    const prompt = `You are an expert Solidity security auditor. Audit the following code and return a strict JSON object containing EXACTLY: { "score": Number, "summary": String, "vulnerabilities": [{ "type": String, "severity": String, "description": String }] }.\n\nCode:\n${mockContractCode}`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: "application/json" }
    });

    await prisma.jobExecution.update({
      where: { id: jobId },
      data: { status: 'completed', result: response.text }
    });

  } catch (error) {
    console.error("Worker Error:", error);
    await prisma.jobExecution.update({
      where: { id: jobId },
      data: { status: 'failed', result: JSON.stringify({ error: error.message }) }
    });
  }
}, { connection });

app.listen(port, () => {
  console.log(`[Auditor Agent] Scalable Queue Service listening on port ${port}`);
});
