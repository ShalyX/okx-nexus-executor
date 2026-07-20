const { spawnSync } = require('child_process');

const payloads = [
  // 1. Literal from the fix message
  `[{"name":"Nexus Smart Executor","servicedescription":"Test","servicetype":"A2MCP","fee":"0","endpoint":"https://api.nexusexecutor.ai"}]`,
  
  // 2. Without endpoint
  `[{"name":"Nexus Smart Executor","servicedescription":"Test","servicetype":"A2A","fee":"5"}]`,
  
  // 3. With standard keys
  `[{"name":"Nexus Smart Executor","description":"Test","type":"A2A","fee":"5","endpoint":""}]`,

  // 4. Maybe fee as number?
  `[{"name":"Nexus Smart Executor","servicedescription":"Test","servicetype":"A2A","fee":5,"endpoint":""}]`
];

for (let i = 0; i < payloads.length; i++) {
  console.log(`\n--- Test ${i + 1} ---`);
  console.log(`Payload: ${payloads[i]}`);
  const result = spawnSync('C:\\Users\\USER\\.local\\bin\\onchainos.exe', [
    'agent', 'validate-listing',
    '--role', 'asp',
    '--name', 'Nexus Executor',
    '--description', 'We provide production-grade smart contract execution and sentiment-driven trading endpoints.',
    '--service', payloads[i]
  ], { encoding: 'utf-8' });
  
  if (result.stdout.includes("PARSE")) {
    console.log("Result: PARSE ERROR");
  } else {
    console.log("Result: SUCCESS OR DIFFERENT ERROR");
    console.log(result.stdout);
  }
}
