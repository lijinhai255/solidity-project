import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-waffle";
import "@nomiclabs/hardhat-ethers";
import "hardhat-deploy";
import "@openzeppelin/hardhat-upgrades"; // 添加 OpenZeppelin 升级插件
import fs from "fs";
import { subtask } from "hardhat/config";
import { TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS } from "hardhat/builtin-tasks/task-names";
import { task } from "hardhat/config";
import * as dotenv from "dotenv"; // 添加 dotenv 导入

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
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  networks: {
    hardhat: {
      // 默认内存网络
      saveDeployments: true, // 尝试保存部署，即使是内存网络
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      saveDeployments: true,
    },
    sepolia: {
      url: 'https://sepolia.infura.io/v3/39b58b9526fd49129246cda88be59a96',
       accounts: process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [],
    },
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    user1: {
      default: 1,
    },
    user2: {
      default: 2,
    },
  },
};

// 修改后的任务，使用不同的参数名称
task("show-deployments", "Shows the generated deployment files")
  .addOptionalParam("net", "Network to show deployments for (defaults to current network)", "")
  .setAction(async (taskArgs, hre) => {
    const fs = require("fs");
    const path = require("path");
    
    const network = taskArgs.net || hre.network.name;
    const deploymentsPath = path.join("deployments", network);
    
    console.log(`Checking deployment files for network ${network}...`);
    
    if (!fs.existsSync(deploymentsPath)) {
      console.log(`No deployments found for network ${network}. You need to deploy contracts first.`);
      console.log(`Try running: npx hardhat deploy --network ${network}`);
      return;
    }
    
    const files = fs.readdirSync(deploymentsPath);
    if (files.length === 0) {
      console.log(`No deployment files found in ${deploymentsPath}`);
      return;
    }
    
    console.log(`Found ${files.length} deployment files:`);
    for (const file of files) {
      if (file.endsWith(".json")) {
        try {
          const content = JSON.parse(fs.readFileSync(path.join(deploymentsPath, file), "utf8"));
          console.log(`\n- ${file}:`);
          console.log(`  Address: ${content.address || 'N/A'}`);
          if (content.implementation) {
            console.log(`  Implementation: ${content.implementation}`);
          }
          console.log(`  Deployed at block: ${content.receipt?.blockNumber || 'N/A'}`);
          console.log(`  Transaction hash: ${content.transactionHash || content.receipt?.transactionHash || 'N/A'}`);
        } catch (error) {
          console.log(`  Error reading ${file}: ${error.message}`);
        }
      }
    }
  });

// 添加一个任务来列出所有部署目录
task("list-deployment-dirs", "Lists all deployment directories")
  .setAction(async () => {
    const fs = require("fs");
    const path = require("path");
    
    const deploymentsDir = "deployments";
    
    if (!fs.existsSync(deploymentsDir)) {
      console.log("No deployments directory found");
      return;
    }
    
    const networks = fs.readdirSync(deploymentsDir);
    console.log(`Found ${networks.length} deployment networks:`);
    
    for (const network of networks) {
      const networkPath = path.join(deploymentsDir, network);
      if (fs.statSync(networkPath).isDirectory()) {
        const files = fs.readdirSync(networkPath).filter(f => f.endsWith('.json'));
        console.log(`- ${network}: ${files.length} deployment files`);
      }
    }
  });

export default config;