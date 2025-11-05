// scripts/transfer-to-new-address.js
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🚀 开始向新地址转账代币...");

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 发送者账户:", await deployer.getAddress());

  // 获取网络信息
  const network = await ethers.provider.getNetwork();
  console.log("🌐 当前网络:", network.name, "(ChainId:", network.chainId, ")");

  // 检查发送者余额
  const balance = await deployer.getBalance();
  console.log("💰 发送者ETH余额:", ethers.utils.formatEther(balance), "ETH");

  // 新的接收地址
  const recipientAddress = "0xe4c467914772317C4BEa281F3DFa800690fD3bFC";
  console.log("📨 接收地址:", recipientAddress);

  // 转账金额 (500 tokens, 18位小数)
  const transferAmount = ethers.utils.parseEther("500");

  try {
    // 从之前部署中获取合约地址
    const deployedContracts = {
      MyToken: "0x59b670e9fA9D0A427751Af201D676719a970857b",
      MyTokenA: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
      WTFApe: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
      CryptoMonkeys: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f"
    };

    console.log("\n=== 💸 ERC20 代币转账 ===");

    // 连接到已部署的合约
    const myToken = await ethers.getContractAt("MyToken", deployedContracts.MyToken);
    const myTokenA = await ethers.getContractAt("MyTokenA", deployedContracts.MyTokenA);

    // 检查发送者余额
    const myTokenBalance = await myToken.balanceOf(await deployer.getAddress());
    console.log("📊 发送者 MyToken 余额:", ethers.utils.formatEther(myTokenBalance));

    // 转账 MyToken
    console.log("📤 转账 MyToken 到新地址...");
    const tx1 = await myToken.transfer(recipientAddress, transferAmount);
    console.log("⏳ 交易已提交，等待确认... (交易哈希:", tx1.hash, ")");
    const receipt1 = await tx1.wait();
    console.log("✅ MyToken 转账成功! Gas使用:", receipt1.gasUsed.toString());

    // 检查 MyTokenA 余额
    const myTokenABalance = await myTokenA.balanceOf(await deployer.getAddress());
    console.log("📊 发送者 MyTokenA 余额:", ethers.utils.formatEther(myTokenABalance));

    // 转账 MyTokenA
    console.log("📤 转账 MyTokenA 到新地址...");
    const tx2 = await myTokenA.transfer(recipientAddress, ethers.utils.parseEther("50000"));
    console.log("⏳ 交易已提交，等待确认... (交易哈希:", tx2.hash, ")");
    const receipt2 = await tx2.wait();
    console.log("✅ MyTokenA 转账成功! Gas使用:", receipt2.gasUsed.toString());

    console.log("\n=== 🖼️ ERC721 NFT 转账 ===");

    // 连接到NFT合约
    const wtfApe = await ethers.getContractAt("WTFApe", deployedContracts.WTFApe);
    const cryptoMonkeys = await ethers.getContractAt("CryptoMonkeys", deployedContracts.CryptoMonkeys);

    // 检查发送者拥有的NFT
    const wtfApeBalance = await wtfApe.balanceOf(await deployer.getAddress());
    const cryptoMonkeysBalance = await cryptoMonkeys.balanceOf(await deployer.getAddress());

    console.log("📊 发送者 WTFApe NFT 数量:", wtfApeBalance.toString());
    console.log("📊 发送者 CryptoMonkeys NFT 数量:", cryptoMonkeysBalance.toString());

    // 转移WTFApe NFT (使用mint函数)
    console.log("🦍 转移 WTFApe NFT TokenId 3...");
    const nftTx1 = await wtfApe.mint(recipientAddress, 3);
    console.log("⏳ WTFApe TokenId 3 交易已提交，等待确认... (交易哈希:", nftTx1.hash, ")");
    const nftReceipt1 = await nftTx1.wait();
    console.log("✅ WTFApe TokenId 3 转移成功! Gas使用:", nftReceipt1.gasUsed.toString());

    // 转移WTFApe NFT (TokenId: 4)
    console.log("🦍 转移 WTFApe NFT TokenId 4...");
    const nftTx2 = await wtfApe.mint(recipientAddress, 4);
    console.log("⏳ WTFApe TokenId 4 交易已提交，等待确认... (交易哈希:", nftTx2.hash, ")");
    const nftReceipt2 = await nftTx2.wait();
    console.log("✅ WTFApe TokenId 4 转移成功! Gas使用:", nftReceipt2.gasUsed.toString());

    // 转移CryptoMonkeys NFT (使用mint函数)
    console.log("🐵 转移 CryptoMonkeys NFT TokenId 3...");
    const nftTx3 = await cryptoMonkeys.mint(recipientAddress, 3);
    console.log("⏳ CryptoMonkeys TokenId 3 交易已提交，等待确认... (交易哈希:", nftTx3.hash, ")");
    const nftReceipt3 = await nftTx3.wait();
    console.log("✅ CryptoMonkeys TokenId 3 转移成功! Gas使用:", nftReceipt3.gasUsed.toString());

    // 转移CryptoMonkeys NFT (TokenId: 4)
    console.log("🐵 转移 CryptoMonkeys NFT TokenId 4...");
    const nftTx4 = await cryptoMonkeys.mint(recipientAddress, 4);
    console.log("⏳ CryptoMonkeys TokenId 4 交易已提交，等待确认... (交易哈希:", nftTx4.hash, ")");
    const nftReceipt4 = await nftTx4.wait();
    console.log("✅ CryptoMonkeys TokenId 4 转移成功! Gas使用:", nftReceipt4.gasUsed.toString());

    console.log("\n=== 📋 最终余额汇总 ===");

    // 检查最终余额
    const finalMyTokenBalance = await myToken.balanceOf(recipientAddress);
    const finalMyTokenABalance = await myTokenA.balanceOf(recipientAddress);
    const finalWtfApeBalance = await wtfApe.balanceOf(recipientAddress);
    const finalCryptoMonkeysBalance = await cryptoMonkeys.balanceOf(recipientAddress);

    console.log("💰 接收地址 MyToken 余额:", ethers.utils.formatEther(finalMyTokenBalance));
    console.log("💰 接收地址 MyTokenA 余额:", ethers.utils.formatEther(finalMyTokenABalance));
    console.log("🖼️ 接收地址 WTFApe NFT 数量:", finalWtfApeBalance.toString());
    console.log("🖼️ 接收地址 CryptoMonkeys NFT 数量:", finalCryptoMonkeysBalance.toString());

    console.log("\n=== 📝 转账信息汇总 ===");
    console.log("🌐 网络:", network.name, "(ChainId:", network.chainId, ")");
    console.log("👤 发送者地址:", await deployer.getAddress());
    console.log("📨 接收地址:", recipientAddress);
    console.log("💸 总Gas费用:", ethers.utils.formatEther(balance.sub(await deployer.getBalance())), "ETH");
    console.log("🔗 节点地址: http://127.0.0.1:8545/");

    console.log("\n🎉 转账完成!");

  } catch (error) {
    console.error("❌ 操作失败:", error.message);
    if (error.transaction) {
      console.error("🔗 失败的交易:", error.transaction.hash);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 脚本执行错误:", error);
    process.exit(1);
  });