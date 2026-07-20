const { execFileSync } = require('child_process');

const serviceArray = [
  {
    name: "Nexus Smart Executor",
    servicedescription: "Executes validated trades across X Layer AMMs and provides token sentiment analysis. User must provide: 1. wallet address 2. trade amount 3. target token 4. chain.",
    servicetype: "A2A",
    fee: "5",
    endpoint: ""
  }
];

const result = execFileSync('C:\\Users\\USER\\.local\\bin\\onchainos.exe', [
  'agent',
  'validate-listing',
  '--role', 'asp',
  '--name', 'Nexus Executor',
  '--description', 'We provide production-grade smart contract execution and sentiment-driven trading endpoints.',
  '--service', JSON.stringify(serviceArray).replace(/"/g, '\\"')
], { encoding: 'utf-8' });

console.log(result);
