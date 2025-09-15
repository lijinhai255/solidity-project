// scripts/deploy-cryptomonkeys.js
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("开始部署CryptoMonkeys合约...");

  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("使用账户部署:", deployer.address);

  // 部署合约
  const CryptoMonkeys = await ethers.getContractFactory("CryptoMonkeys");
  const cryptoMonkeys = await CryptoMonkeys.deploy("Crypto Monkeys", "CMONKEY");
  
  await cryptoMonkeys.deployed();
  
  console.log("CryptoMonkeys合约已部署到:", cryptoMonkeys.address);
  console.log("部署交易哈希:", cryptoMonkeys.deployTransaction.hash);
  
  // 打印合约所有者
  const owner = await cryptoMonkeys.owner();
  console.log("合约所有者:", owner);
  
  console.log("部署完成!");
}

// 执行部署
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });