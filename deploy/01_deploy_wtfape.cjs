// deploy/01_deploy_wtfape.js
const { ethers } = require('hardhat');

module.exports = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  console.log("Deploying WTFApe with account:", deployer);
  
  // 部署WTFApe合约
  const wtfApe = await deploy("WTFApe", {
    from: deployer,
    args: ["WTF Ape", "WTFA"], // 构造函数参数：name, symbol
    log: true,
    waitConfirmations: 1, // 等待的确认数
  });
  
  console.log("WTFApe deployed to:", wtfApe.address);
  
  // 如果在非本地网络上，验证合约
  try {
    const { network, run } = require('hardhat');
    if (network.name !== "hardhat" && network.name !== "localhost") {
      console.log("Verifying contract on Etherscan...");
      await run("verify:verify", {
        address: wtfApe.address,
        constructorArguments: ["WTF Ape", "WTFA"],
      });
      console.log("Contract verified successfully");
    }
  } catch (error) {
    console.log("Verification error:", error);
  }
}

module.exports.tags = ["WTFApe"];