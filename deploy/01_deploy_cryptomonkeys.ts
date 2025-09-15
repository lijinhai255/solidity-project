// deploy/01_deploy_cryptomonkeys.ts
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployCryptoMonkeys: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  
  console.log("Deploying CryptoMonkeys with account:", deployer);
  
  // 部署CryptoMonkeys合约
  const cryptoMonkeys = await deploy("CryptoMonkeys", {
    from: deployer,
    args: ["Crypto Monkeys", "CMONKEY"], // 构造函数参数：name, symbol
    log: true,
    waitConfirmations: 1, // 等待的确认数
  });
  
  console.log("CryptoMonkeys deployed to:", cryptoMonkeys.address);
  
  // 如果在非本地网络上，验证合约
  if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: cryptoMonkeys.address,
        constructorArguments: ["Crypto Monkeys", "CMONKEY"],
      });
      console.log("Contract verified successfully");
    } catch (error) {
      console.log("Verification error:", error);
    }
  }
};

deployCryptoMonkeys.tags = ["CryptoMonkeys"];

export default deployCryptoMonkeys;