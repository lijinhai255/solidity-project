import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

const deployMyTokenA: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // 设置接收地址
  const recipientAddress = "0xb975c82cafF9Fd068326b0Df0eD0eA0d839f24b4";

  console.log("开始部署 MyTokenA ERC20 合约...");
  console.log("部署账户:", deployer);
  console.log("接收地址:", recipientAddress);
  console.log("转账数量: 100000 MyTokenA");

  const myTokenA = await deploy("MyTokenA", {
    from: deployer,
    args: [recipientAddress], // 将接收地址作为构造函数参数传入
    log: true,
    waitConfirmations: 1,
  });

  console.log("MyTokenA 合约已部署到地址:", myTokenA.address);
  console.log("交易哈希:", myTokenA.transactionHash);
  console.log("部署完成! 100000 MyTokenA 已转账至接收地址");
};

deployMyTokenA.tags = ["MyTokenA", "ERC20"];

export default deployMyTokenA;