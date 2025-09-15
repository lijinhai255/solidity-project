// deploy/02_deploy_MetaNodeStake.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ethers } from "hardhat";

const deployMetaNodeStake: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();
  
  console.log("Deploying MetaNodeStake with account:", deployer);
  
  // 获取之前部署的 MetaNodeToken 地址
  const metaNodeToken = await get("MetaNodeToken");
  const metaNodeTokenAddress = metaNodeToken.address;
  
  // 设置初始化参数
  const currentBlock = await ethers.provider.getBlockNumber();
  console.log("Current block:", currentBlock);
  
  const startBlock = currentBlock + 100; // 从当前区块后100个区块开始
  const endBlock = startBlock + 2102400; // 假设一年后结束 (按每15秒一个区块计算)
  const metaNodePerBlock = ethers.utils.parseEther("10"); // 每区块10个 MetaNode 代币
  
  console.log("Deployment parameters:");
  console.log("- MetaNodeToken address:", metaNodeTokenAddress);
  console.log("- Start block:", startBlock);
  console.log("- End block:", endBlock);
  console.log("- MetaNode per block:", ethers.utils.formatEther(metaNodePerBlock), "MetaNode");
  
  // 部署 MetaNodeStake 代理合约
  const metaNodeStakeProxy = await deploy("MetaNodeStake_Proxy", {
    from: deployer,
    contract: "MetaNodeStake",
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize",
          args: [metaNodeTokenAddress, startBlock, endBlock, metaNodePerBlock],
        },
      },
    },
    log: true,
    waitConfirmations: 1,
  });
  
  console.log("MetaNodeStake deployed to:", metaNodeStakeProxy.address);
  
  // 获取 MetaNodeStake 合约实例
  const MetaNodeStake = await ethers.getContractFactory("MetaNodeStake");
  const metaNodeStake = await MetaNodeStake.attach(metaNodeStakeProxy.address);
  
  // 添加 ETH 池 (第一个池子必须是 ETH 池)
  console.log("Adding ETH pool...");
  const poolWeight = 100; // 池子权重
  const minDepositAmount = ethers.utils.parseEther("0.01"); // 最小质押 0.01 ETH (测试网上使用较小的值)
  const unstakeLockedBlocks = 1000; // 测试网上使用较短的锁定期
  
  const tx = await metaNodeStake.addPool(
    "0x0000000000000000000000000000000000000000", // ETH 池地址为 0x0
    poolWeight,
    minDepositAmount,
    unstakeLockedBlocks,
    true // 更新所有池子
  );
  
  await tx.wait();
  console.log("ETH pool added successfully");
  
  // 为 MetaNodeStake 合约转入 MetaNode 代币用于奖励
  const metaNodeTokenContract = await ethers.getContractAt("MetaNodeToken", metaNodeTokenAddress);
  
  // 检查部署账户的代币余额
  const deployerBalance = await metaNodeTokenContract.balanceOf(deployer);
  console.log("Deployer MetaNode balance:", ethers.utils.formatEther(deployerBalance));
  
  // 计算理想的转入代币数量: 每区块奖励 * (结束区块 - 开始区块)
  const idealRewards = metaNodePerBlock.mul(endBlock - startBlock);
  console.log("Ideal rewards amount:", ethers.utils.formatEther(idealRewards));
  
  // 实际转入数量 (使用账户余额的一半，或者理想数量，取较小值)
  const actualRewards = deployerBalance.div(2).lt(idealRewards) ?
    deployerBalance.div(2) :
    idealRewards;
  console.log("Actual transfer amount:", ethers.utils.formatEther(actualRewards));
  
  // 转入代币
  const transferTx = await metaNodeTokenContract.transfer(metaNodeStakeProxy.address, actualRewards);
  await transferTx.wait();
  
  // 验证转账
  const balance = await metaNodeTokenContract.balanceOf(metaNodeStakeProxy.address);
  console.log("MetaNodeStake MetaNode balance:", ethers.utils.formatEther(balance));
  
  // 如果在非本地网络上，验证实现合约
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying implementation contract on Etherscan...");
    try {
      // 获取实现合约地址
      const implementationAddress = await hre.ethers.provider.getStorageAt(
        metaNodeStakeProxy.address,
        "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc"
      );
      
      // 移除前缀 0x000000000000000000000000
      const cleanImplementationAddress = "0x" + implementationAddress.slice(26);
      
      await hre.run("verify:verify", {
        address: cleanImplementationAddress,
        constructorArguments: [],
      });
      console.log("Implementation contract verified successfully");
    } catch (error) {
      console.log("Verification error:", error);
    }
  }
};

deployMetaNodeStake.tags = ["MetaNodeStake"];
deployMetaNodeStake.dependencies = ["MetaNodeToken"]; // 确保 MetaNodeToken 先部署

export default deployMetaNodeStake;