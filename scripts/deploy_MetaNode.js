// SPDX-License-Identifier: MIT
import { ethers } from "hardhat";

async function main() {
  console.log("开始部署 MetaNode 代币合约...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("使用账户地址:", deployer.address);

  // 部署 MetaNodeToken 代币合约
  const MetaNodeToken = await ethers.getContractFactory("MetaNodeToken");
  const metaNodeToken = await MetaNodeToken.deploy();
  await metaNodeToken.deployed();

  console.log("MetaNode 代币已部署到地址:", metaNodeToken.address);

  return metaNodeToken.address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });