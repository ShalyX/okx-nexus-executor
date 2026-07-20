import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

/** @type import('hardhat/config').HardhatUserConfig */
export default {
  solidity: "0.8.19",
  networks: {
    xlayer: {
      url: "https://rpc.xlayer.tech",
      chainId: 196,
      accounts: process.env.XLAYER_MAINNET_PRIVATE_KEY ? [process.env.XLAYER_MAINNET_PRIVATE_KEY] : []
    }
  }
};
