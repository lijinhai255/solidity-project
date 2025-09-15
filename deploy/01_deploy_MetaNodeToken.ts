// deploy/01_deploy_MetaNodeToken.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMetaNodeToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
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
  
  // 如果在非本地网络上，验证合约
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: metaNodeToken.address,
        constructorArguments: [],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification error:", error);
    }
  }
};

deployMetaNodeToken.tags = ["MetaNodeToken"];

export default deployMetaNodeToken;