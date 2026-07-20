import hre from "hardhat";

async function main() {
  console.log("Deploying NexusExecutor to X Layer Mainnet...");

  const Executor = await hre.ethers.getContractFactory("NexusExecutor");
  const executor = await Executor.deploy();

  await executor.waitForDeployment();

  console.log(`NexusExecutor successfully deployed to Mainnet at: ${await executor.getAddress()}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
