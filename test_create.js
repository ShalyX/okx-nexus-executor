const { spawnSync } = require('child_process');
const result = spawnSync('C:\\Users\\USER\\.local\\bin\\onchainos.exe', [
  'agent', 'create',
  '--role', 'asp',
  '--name', 'Nexus Executor',
  '--description', 'We provide production-grade smart contract execution and sentiment-driven trading endpoints.',
  '--picture', 'https://static.okx.com/cdn/web3/wallet/marketplace/headimages/agent/avatar/53dcad2f-0fc1-491a-9f7d-a8ff267a3515.jpg',
  '--service', '[{"serviceName":"Nexus Smart Executor","serviceDescription":"Executes validated trades across X Layer AMMs and provides token sentiment analysis. User must provide: 1. wallet address 2. trade amount 3. target token 4. chain.","serviceType":"A2A","fee":"5","endpoint":""}]'
], { encoding: 'utf-8' });
console.log("Stdout:", result.stdout);
console.log("Stderr:", result.stderr);
