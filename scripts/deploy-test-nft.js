// scripts/deploy-test-nft.js
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("Deploying TestERC721 contract...");

  // 获取部署账户
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  // 编译并部署合约
  const TestERC721Factory = await ethers.getContractFactory("TestERC721");
  const testNft = await TestERC721Factory.deploy();
  await testNft.deployed();

  console.log("TestERC721 deployed to:", testNft.address);

  // 可选：设置默认的 tokenURI
  // const defaultTokenURI = "ipfs://your-default-uri-here";
  // await testNft.setTokenURI(defaultTokenURI);
  // console.log("Default tokenURI set to:", defaultTokenURI);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });