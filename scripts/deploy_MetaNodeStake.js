// SPDX-License-Identifier: MIT
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("开始部署 MetaNodeStake 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("使用账户地址:", deployer.address);

  // MetaNode 代币地址 - 这里需要替换为实际部署的 MetaNode 代币地址
  const metaNodeTokenAddress = "0x..."; // 替换为实际的 MetaNode 代币地址
  
  // 设置初始化参数
  const currentBlock = await ethers.provider.getBlockNumber();
  const startBlock = currentBlock + 100; // 从当前区块后100个区块开始
  const endBlock = startBlock + 2102400; // 假设一年后结束 (按每15秒一个区块计算)
  const metaNodePerBlock = ethers.utils.parseEther("10"); // 每区块10个 MetaNode 代币
  
  console.log("部署参数:");
  console.log("- MetaNode 代币地址:", metaNodeTokenAddress);
  console.log("- 开始区块:", startBlock);
  console.log("- 结束区块:", endBlock);
  console.log("- 每区块奖励:", ethers.utils.formatEther(metaNodePerBlock), "MetaNode");

  // 部署可升级合约
  const MetaNodeStake = await ethers.getContractFactory("MetaNodeStake");
  const metaNodeStake = await upgrades.deployProxy(
    MetaNodeStake,
    [metaNodeTokenAddress, startBlock, endBlock, metaNodePerBlock],
    { initializer: 'initialize', kind: 'uups' }
  );

  await metaNodeStake.deployed();
  console.log("MetaNodeStake 已部署到地址:", metaNodeStake.address);

  // 添加 ETH 池 (第一个池子必须是 ETH 池)
  console.log("添加 ETH 池...");
  const poolWeight = 100; // 池子权重
  const minDepositAmount = ethers.utils.parseEther("0.1"); // 最小质押 0.1 ETH
  const unstakeLockedBlocks = 40320; // 约一周的区块数 (按15秒一个区块计算)
  
  const tx = await metaNodeStake.addPool(
    "0x0000000000000000000000000000000000000000", // ETH 池地址为 0x0
    poolWeight,
    minDepositAmount,
    unstakeLockedBlocks,
    true // 更新所有池子
  );
  
  await tx.wait();
  console.log("ETH 池添加成功");
  
  // 验证合约已正确部署
  const metaNodeAddress = await metaNodeStake.MetaNode();
  console.log("合约中设置的 MetaNode 地址:", metaNodeAddress);
  console.log("合约中设置的开始区块:", (await metaNodeStake.startBlock()).toString());
  console.log("合约中设置的结束区块:", (await metaNodeStake.endBlock()).toString());
  console.log("合约中设置的每区块奖励:", ethers.utils.formatEther(await metaNodeStake.MetaNodePerBlock()), "MetaNode");
  
  return metaNodeStake.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });