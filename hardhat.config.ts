import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-etherscan";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-gas-reporter";
import "solidity-coverage";
import "@typechain/hardhat";
import "hardhat-contract-sizer";
import fs from "fs";
import { subtask } from "hardhat/config";
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import * as dotenv from "dotenv";

// 加载 .env 文件
dotenv.config();


// 添加子任务来过滤 .t.sol 文件
subtask(TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS)
  .setAction(async (_, { config }, runSuper) => {
    const paths = await runSuper();
    return paths.filter((p: string) => !p.endsWith(".t.sol"));
  });

// 扩展 HardhatUserConfig 类型以包含 hardhat-deploy 的配置
declare module "hardhat/config" {
  interface HardhatUserConfig {
    namedAccounts?: {
      [name: string]: {
        default: number;
        [networkName: string]: number;
      };
    };
  }
}

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      metadata: {
        bytecodeHash: "none",
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
    deploy: "./deploy",
    deployments: "./deployments"
  },
  networks: {
    hardhat: {
      saveDeployments: true,
      forking: process.env.FORKING_URL ? {
        url: process.env.FORKING_URL,
        blockNumber: process.env.FORKING_BLOCK_NUMBER ? parseInt(process.env.FORKING_BLOCK_NUMBER) : undefined,
      } : undefined,
      chainId: 31337,
      accounts: {
        count: 20,
        accountsBalance: "100000000000000000000000", // 100k ETH
      },
      gasPrice: 20000000000, // 20 gwei
      blockGasLimit: 30000000,
      allowUnlimitedContractSize: true,
      timeout: 1800000,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      saveDeployments: true,
      chainId: 31337,
      gasPrice: 20000000000,
      blockGasLimit: 30000000,
    },
    // 以太坊测试网
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || 'https://sepolia.infura.io/v3/39b58b9526fd49129246cda88be59a96',
      accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
      chainId: 11155111,
      gasPrice: "auto",
      gas: "auto",
      saveDeployments: true,
    },
    goerli: {
      url: process.env.GOERLI_RPC_URL || 'https://goerli.infura.io/v3/YOUR_PROJECT_ID',
      accounts: process.env.GOERLI_PRIVATE_KEY ? [process.env.GOERLI_PRIVATE_KEY.split(',')] : [],
      chainId: 5,
      gasPrice: "auto",
      gas: "auto",
      saveDeployments: true,
    },
    // 以太坊主网
    mainnet: {
      url: process.env.MAINNET_RPC_URL || 'https://mainnet.infura.io/v3/YOUR_PROJECT_ID',
      accounts: process.env.MAINNET_PRIVATE_KEY ? [process.env.MAINNET_PRIVATE_KEY.split(',')] : [],
      chainId: 1,
      gasPrice: "auto",
      gas: "auto",
      saveDeployments: true,
      timeout: 600000, // 10 minutes
    },
    // Layer 2 网络
    arbitrum: {
      url: process.env.ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
      accounts: process.env.ARBITRUM_PRIVATE_KEY ? [process.env.ARBITRUM_PRIVATE_KEY.split(',')] : [],
      chainId: 42161,
      gasPrice: "auto",
      saveDeployments: true,
    },
    optimism: {
      url: process.env.OPTIMISM_RPC_URL || 'https://mainnet.optimism.io',
      accounts: process.env.OPTIMISM_PRIVATE_KEY ? [process.env.OPTIMISM_PRIVATE_KEY.split(',')] : [],
      chainId: 10,
      gasPrice: "auto",
      saveDeployments: true,
    },
    polygon: {
      url: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
      accounts: process.env.POLYGON_PRIVATE_KEY ? [process.env.POLYGON_PRIVATE_KEY.split(',')] : [],
      chainId: 137,
      gasPrice: "auto",
      saveDeployments: true,
    },
    // BSC 网络
    bsc: {
      url: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
      accounts: process.env.BSC_PRIVATE_KEY ? [process.env.BSC_PRIVATE_KEY.split(',')] : [],
      chainId: 56,
      gasPrice: "auto",
      saveDeployments: true,
    },
    bsc_testnet: {
      url: process.env.BSC_TESTNET_RPC_URL || 'https://data-seed-prebsc-1-s1.binance.org:8545',
      accounts: process.env.BSC_TESTNET_PRIVATE_KEY ? [process.env.BSC_TESTNET_PRIVATE_KEY.split(',')] : [],
      chainId: 97,
      gasPrice: "auto",
      saveDeployments: true,
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
      sepolia: process.env.SEPOLIA_DEPLOYER_INDEX ? parseInt(process.env.SEPOLIA_DEPLOYER_INDEX) : 0,
      mainnet: process.env.MAINNET_DEPLOYER_INDEX ? parseInt(process.env.MAINNET_DEPLOYER_INDEX) : 0,
    },
    oracle: {
      default: 1,
      sepolia: process.env.SEPOLIA_ORACLE_INDEX ? parseInt(process.env.SEPOLIA_ORACLE_INDEX) : 1,
      mainnet: process.env.MAINNET_ORACLE_INDEX ? parseInt(process.env.MAINNET_ORACLE_INDEX) : 1,
    },
    multisig1: {
      default: 2,
    },
    multisig2: {
      default: 3,
    },
    multisig3: {
      default: 4,
    },
    user1: {
      default: 5,
    },
    user2: {
      default: 6,
    },
    feeRecipient: {
      default: 7,
    },
  },
  // Gas 报告配置
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
    gasPrice: 20,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    token: "ETH",
    gasPriceApi: "https://api.etherscan.io/api?module=proxy&action=eth_gasPrice",
    showTimeSpent: true,
    showMethodSig: true,
  },
  // Etherscan 验证配置
  etherscan: {
    apiKey: {
      mainnet: process.env.ETHERSCAN_API_KEY,
      sepolia: process.env.ETHERSCAN_API_KEY,
      goerli: process.env.ETHERSCAN_API_KEY,
      arbitrumOne: process.env.ARBISCAN_API_KEY,
      optimisticEthereum: process.env.OPTIMISM_API_KEY,
      polygon: process.env.POLYGONSCAN_API_KEY,
      bsc: process.env.BSCSCAN_API_KEY,
      bscTestnet: process.env.BSCSCAN_API_KEY,
    },
  },
  // TypeChain 配置
  typechain: {
    outDir: "src/types",
    target: "ethers-v5",
    alwaysGenerateOverloads: false,
    externalArtifacts: ["externalArtifacts/*.json"],
  },
  // 合约大小检查
  contractSizer: {
    alphaSort: true,
    disambiguatePaths: false,
    runOnCompile: true,
    strict: true,
    only: [],
  },
  // Mocha 测试配置
  mocha: {
    timeout: 1200000, // 20 minutes
    bail: process.env.BAIL_ON_ERROR === "true",
    reporter: process.env.MOCHA_REPORTER || "spec",
  },
};

// 永续合约相关任务
task("perpetual-setup", "Setup perpetual contract environment")
  .setAction(async (taskArgs, hre) => {
    console.log("🚀 永续合约环境检查...");
    console.log("=" * 50);

    // 检查必要的环境变量
    const requiredEnvVars = [
      "USDT_ADDRESS",
      "ORACLE_ADDRESS",
      "FEE_RECIPIENT_ADDRESS",
      "DEPLOYER_WALLET",
      "ORACLE_WALLET",
      "DEPLOYER_PRIVATE_KEY",
      "ORACLE_PRIVATE_KEY"
    ];

    let missingVars = [];
    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        missingVars.push(envVar);
      }
    }

    if (missingVars.length > 0) {
      console.log("❌ 缺少必需的环境变量:");
      for (const envVar of missingVars) {
        console.log(`   - ${envVar}`);
      }
      console.log("\n💡 请在 .env 文件中设置这些变量");
      console.log("💡 运行 'python deploy.py setup' 获取完整的环境变量列表");
      return;
    }

    console.log("✅ 所有必需的环境变量已设置");
    console.log(`📊 USDT 地址: ${process.env.USDT_ADDRESS}`);
    console.log(`🔮 预言机地址: ${process.env.ORACLE_ADDRESS}`);
    console.log(`💰 费用接收地址: ${process.env.FEE_RECIPIENT_ADDRESS}`);
    console.log(`🚀 部署者钱包: ${process.env.DEPLOYER_WALLET}`);
    console.log(`📈 预言机钱包: ${process.env.ORACLE_WALLET}`);

    // 检查可选的环境变量
    const optionalEnvVars = [
      "MULTISIG_ADDRESS",
      "COINGECKO_API_KEY",
      "BINANCE_API_KEY",
      "ETHERSCAN_API_KEY"
    ];

    console.log("\n🔧 可选配置检查:");
    for (const envVar of optionalEnvVars) {
      if (process.env[envVar]) {
        console.log(`✅ ${envVar}: 已配置`);
      } else {
        console.log(`⚠️  ${envVar}: 未配置 (可选)`);
      }
    }

    console.log("\n🎯 下一步操作:");
    console.log("1. 编译合约: npx hardhat compile");
    console.log("2. 运行测试: npx hardhat test");
    console.log("3. 部署合约: npx hardhat deploy --network <network>");
  });

task("verify-perpetual", "Verify perpetual contract on block explorer")
  .addParam("address", "Contract address to verify")
  .addOptionalParam("networkName", "Network to verify on", "localhost")
  .setAction(async (taskArgs, hre) => {
    const { address, networkName } = taskArgs;

    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [process.env.USDT_ADDRESS],
      });
      console.log(`✅ Contract verified on ${network}: ${address}`);
    } catch (error) {
      console.error(`❌ Verification failed: ${error.message}`);
    }
  });

task("oracle-update-price", "Update oracle price (simulation)")
  .addParam("price", "New price to set")
  .setAction(async (taskArgs, hre) => {
    const { price } = taskArgs;
    const { ethers, getNamedAccounts } = hre;

    const { oracle } = await getNamedAccounts();
    const perpetualContract = await ethers.getContract("PerpetualContract", oracle);

    try {
      const tx = await perpetualContract.updatePrice(ethers.utils.parseUnits(price, 8));
      console.log(`📊 Updating price to $${price}...`);
      await tx.wait();
      console.log(`✅ Price updated successfully! Transaction: ${tx.hash}`);
    } catch (error) {
      console.error(`❌ Price update failed: ${error.message}`);
    }
  });

export default config;