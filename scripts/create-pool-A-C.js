import { ethers } from "hardhat";

const deployMyTokenC = async function ({ getNamedAccounts, deployments }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();

  // 设置接收地址
  const recipientAddress = "0xb975c82cafF9Fd068326b0Df0eD0eA0d839f24b4";

  console.log("开始部署 MyTokenC ERC20 合约...");
  console.log("部署账户:", deployer);
  console.log("接收地址:", recipientAddress);
  console.log("转账数量: 100000 MyTokenC");

  const myTokenC = await deploy("MyTokenC", {
    from: deployer,
    args: [recipientAddress],
    log: true,
    waitConfirmations: 1,
  });

  console.log("MyTokenC 合约已部署到地址:", myTokenC.address);
  console.log("交易哈希:", myTokenC.transactionHash);
  console.log("部署完成! 100000 MyTokenC 已转账至接收地址");
};

deployMyTokenC.tags = ["MyTokenC", "ERC20"];

export default deployMyTokenC;