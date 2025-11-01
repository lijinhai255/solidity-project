// scripts/transfer-nfts.js
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // 获取签名者（发送者）
  const [sender] = await ethers.getSigners();
  console.log("使用账户:", await sender.getAddress());

  // 接收地址
  const recipientAddress = "0xc8Ea90b2f341b3D6955641eECAee83750312903C";
  console.log("接收地址:", recipientAddress);

  // NFT合约地址和配置
  const nfts = [
    {
      address: "0x1234567890123456789012345678901234567890", // 替换为实际的WTFApe地址
      name: "WTFApe",
      tokenIds: [1, 2, 3] // 要转账的tokenId列表
    },
    {
      address: "0x1234567890123456789012345678901234567890", // 替换为实际的CryptoMonkeys地址
      name: "CryptoMonkeys",
      tokenIds: [1, 2, 3, 4, 5] // 要转账的tokenId列表
    },
    {
      address: "0x1234567890123456789012345678901234567890", // 替换为实际的TestERC721地址
      name: "TestERC721",
      tokenIds: [1] // 要转账的tokenId列表
    }
  ];

  // 对每个NFT集合执行转账
  for (const nft of nfts) {
    console.log(`\n开始转账 ${nft.name} NFT...`);

    // 获取NFT合约实例
    const nftContract = await ethers.getContractAt("ERC721", nft.address);

    // 检查发送者是否拥有这些NFT
    console.log(`检查 ${nft.name} 的所有权...`);

    for (const tokenId of nft.tokenIds) {
      try {
        const owner = await nftContract.ownerOf(tokenId);
        const senderAddress = await sender.getAddress();

        console.log(`TokenId ${tokenId} 的所有者: ${owner}`);

        if (owner.toLowerCase() !== senderAddress.toLowerCase()) {
          console.log(`您不是TokenId ${tokenId}的所有者，跳过转账`);
          continue;
        }

        // 执行转账
        console.log(`转账 ${nft.name} TokenId ${tokenId} 到 ${recipientAddress}...`);
        const tx = await nftContract.transferFrom(senderAddress, recipientAddress, tokenId);

        // 等待交易确认
        console.log(`交易已提交，等待确认... (交易哈希: ${tx.hash})`);
        await tx.wait();

        console.log(`${nft.name} TokenId ${tokenId} 转账成功!`);

        // 确认新的所有者
        const newOwner = await nftContract.ownerOf(tokenId);
        console.log(`TokenId ${tokenId} 的新所有者: ${newOwner}`);

      } catch (error) {
        console.error(`处理 ${nft.name} TokenId ${tokenId} 时出错:`, error.message);
      }
    }
  }

  console.log("\nNFT转账操作完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("NFT转账过程中出错:", error);
    process.exit(1);
  });