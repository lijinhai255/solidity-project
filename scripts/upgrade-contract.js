const { ethers, upgrades } = require("hardhat");

// 升级脚本
async function main() {
  // 获取已部署的代理合约地址
  // 注意：在实际使用中，您需要保存并提供之前部署的代理合约地址
  const proxyAddress = process.env.PROXY_ADDRESS;
  
  if (!proxyAddress) {
    console.error("请提供代理合约地址，设置 PROXY_ADDRESS 环境变量");
    process.exit(1);
  }

  console.log("准备升级合约，代理地址:", proxyAddress);

  // 获取新的实现合约工厂
  const MyUpgradeableContractV2 = await ethers.getContractFactory("MyUpgradeableContractV2");
  
  // 升级代理合约指向新的实现
  console.log("开始升级...");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, MyUpgradeableContractV2);
  
  console.log("合约已升级到V2版本");
  console.log("代理地址 (不变):", upgraded.address);
  console.log("新的实现地址:", await upgrades.erc1967.getImplementationAddress(upgraded.address));
  
  // 调用新版本的方法验证升级
  const version = await upgraded.version();
  console.log("合约版本:", version);
  
  const isUpgraded = await upgraded.isUpgraded();
  console.log("是否已升级:", isUpgraded);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });