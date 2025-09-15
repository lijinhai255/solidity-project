// SPDX-License-Identifier: MIT
const { ethers, upgrades } = require("hardhat");

async function main() {
  console.log("开始部署 MetaNodeStake 合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("使用账户地址:", deployer.address);

  // MetaNode 代币地址 - 使用刚才部署的代币地址
  const metaNodeTokenAddress = "0xfE4dD5CEfE07Ac25dDedE2B7d0EeBd3Fb0547c04";
  // 设置初始化参数
  const currentBlock = await ethers.provider.getBlockNumber();
  console.log("当前区块:", currentBlock);

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
  console.log("ETH 池添加成功");

  // 验证合约已正确部署
  const metaNodeAddress = await metaNodeStake.MetaNode();
  console.log("合约中设置的 MetaNode 地址:", metaNodeAddress);
  console.log("合约中设置的开始区块:", (await metaNodeStake.startBlock()).toString());
  console.log("合约中设置的结束区块:", (await metaNodeStake.endBlock()).toString());
  console.log("合约中设置的每区块奖励:", ethers.utils.formatEther(await metaNodeStake.MetaNodePerBlock()), "MetaNode");

  // 为 MetaNodeStake 合约转入 MetaNode 代币用于奖励
  const metaNodeToken = await ethers.getContractAt("MetaNodeToken", metaNodeTokenAddress);

  // 检查部署账户的代币余额
  const deployerBalance = await metaNodeToken.balanceOf(deployer.address);
  console.log("部署账户的 MetaNode 余额:", ethers.utils.formatEther(deployerBalance));

  // 计算理想的转入代币数量: 每区块奖励 * (结束区块 - 开始区块)
  const idealRewards = metaNodePerBlock.mul(endBlock - startBlock);
  console.log("理想的奖励代币数量:", ethers.utils.formatEther(idealRewards));

  // 实际转入数量 (使用账户余额的一半，或者理想数量，取较小值)
  const actualRewards = deployerBalance.div(2).lt(idealRewards) ?
    deployerBalance.div(2) :
    idealRewards;
  console.log("实际转入 MetaNode 代币数量:", ethers.utils.formatEther(actualRewards));

  // 转入代币
  const transferTx = await metaNodeToken.transfer(metaNodeStake.address, actualRewards);
  await transferTx.wait();

  // 验证转账
  const balance = await metaNodeToken.balanceOf(metaNodeStake.address);
  console.log("MetaNodeStake 合约的 MetaNode 余额:", ethers.utils.formatEther(balance));

  return metaNodeStake.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });