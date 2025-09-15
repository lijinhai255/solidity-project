// deploy/01_deploy_MetaNodeToken.cjs
const { ethers } = require("hardhat");

module.exports = async function ({ getNamedAccounts, deployments, network, run }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying MetaNodeToken with account:", deployer);

  // 部署 MetaNodeToken 合约
  const metaNodeToken = await deploy("MetaNodeToken", {
    from: deployer,
    args: [], // MetaNodeToken 构造函数没有参数
    log: true,
    waitConfirmations: 1, // 等待的确认数
  });

  console.log("MetaNodeToken deployed to:", metaNodeToken.address);

  // 如果在非本地网络上且有 ETHERSCAN_API_KEY，验证合约
  if (network.name !== "hardhat" && network.name !== "localhost" && process.env.ETHERSCAN_API_KEY) {
    console.log("Verifying contract on Etherscan...");
    try {
      await run("verify:verify", {
        address: metaNodeToken.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification error:", error);
    }
  }
};

module.exports.tags = ["MetaNodeToken"];