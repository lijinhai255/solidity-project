import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployNftAuction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, ethers, upgrades } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  console.log("Deploying NftAuction contract with account:", deployer);

  // 部署合约
  const nftAuctionDeployment = await deploy("NftAuction", {
    from: deployer,
    args: [], // 构造函数参数为空，因为我们使用initialize函数
    log: true,
    // 如果您想等待确认，可以添加以下选项
    // waitConfirmations: 1,
    proxy: {
      proxyContract: "OpenZeppelinTransparentProxy",
      execute: {
        init: {
          methodName: "initialize", // 初始化函数名
          args: [deployer], // 传递deployer作为管理员地址
        },
      },
    },
  });

  console.log("NftAuction deployed at:", nftAuctionDeployment.address);
  
  // 打印代理合约地址和实现合约地址
  const proxyAddress = nftAuctionDeployment.address;
  console.log("代理合约地址: ", proxyAddress);
  console.log("实现合约地址: ", await deployments.get("NftAuction_Implementation").then(deployment => deployment.address));
};

deployNftAuction.tags = ["all", "nftauction"];

export default deployNftAuction;