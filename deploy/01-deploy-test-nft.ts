import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployTestNft: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying TestERC721 contract with account:", deployer);

  // 编译并部署合约，只关注 TestERC721
  await hre.run("compile", {
    only: ["TestERC721"]
  });

  // 部署合约
  const testNftDeployment = await deploy("TestERC721", {
    from: deployer,
    args: [], // 构造函数不需要参数
    log: true,
    // 如果您想等待确认，可以添加以下选项
    // waitConfirmations: 1,
  });

  console.log("TestERC721 deployed at:", testNftDeployment.address);
  
  // 获取部署后的合约实例
  const testNft = await ethers.getContractAt("TestERC721", testNftDeployment.address);
  
  // 设置默认的tokenURI (可选)
  // 如果您想在部署后立即设置一个默认的tokenURI，可以取消下面的注释
  // const defaultTokenURI = "ipfs://your-default-uri-here";
  // await testNft.setTokenURI(defaultTokenURI);
  // console.log("Default tokenURI set to:", defaultTokenURI);
};

deployTestNft.tags = ["all", "testnft"];

export default deployTestNft;