// scripts/deploy-and-transfer-sepolia.js
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  console.log("🚀 开始在Sepolia测试网上部署合约并执行转账...");

  // 获取签名者
  const [deployer] = await ethers.getSigners();
  console.log("👤 部署者账户:", await deployer.getAddress());

  // 检查账户余额
  const balance = await deployer.getBalance();
  console.log("💰 账户ETH余额:", ethers.utils.formatEther(balance), "ETH");

  if (balance.lt(ethers.utils.parseEther("0.01"))) {
    console.log("❌ 余额不足，请至少充值0.01 ETH到部署账户");
    return;
  }

  // 接收地址
  const recipientAddress = "0xc8Ea90b2f341b3D6955641eECAee83750312903C";
  console.log("📨 接收地址:", recipientAddress);

  // 转账金额 (1000 tokens, 18位小数)
  const transferAmount = ethers.utils.parseEther("1000");

  try {
    // 1. 部署 ERC20 代币
    console.log("\n=== 🏗️ 部署 ERC20 代币 ===");

    // 部署 MyToken
    console.log("🪙 部署 MyToken...");
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy(ethers.utils.parseEther("1000000"));
    await myToken.deployed();
    console.log("✅ MyToken 部署地址:", myToken.address);

    // 部署 MyTokenA
    console.log("🪙 部署 MyTokenA...");
    const MyTokenA = await ethers.getContractFactory("MyTokenA");
    const myTokenA = await MyTokenA.deploy(recipientAddress);
    await myTokenA.deployed();
    console.log("✅ MyTokenA 部署地址:", myTokenA.address);

    // 2. 部署 ERC721 代币
    console.log("\n=== 🖼️ 部署 ERC721 代币 ===");

    // 部署 WTFApe
    console.log("🦍 部署 WTFApe...");
    const WTFApe = await ethers.getContractFactory("WTFApe");
    const wtfApe = await WTFApe.deploy("WTFApe", "WTF");
    await wtfApe.deployed();
    console.log("✅ WTFApe 部署地址:", wtfApe.address);

    // 部署 CryptoMonkeys
    console.log("🐵 部署 CryptoMonkeys...");
    const CryptoMonkeys = await ethers.getContractFactory("CryptoMonkeys");
    const cryptoMonkeys = await CryptoMonkeys.deploy("CryptoMonkeys", "CMK");
    await cryptoMonkeys.deployed();
    console.log("✅ CryptoMonkeys 部署地址:", cryptoMonkeys.address);

    // 3. 执行 ERC20 转账
    console.log("\n=== 💸 执行 ERC20 转账 ===");

    // 检查 MyToken 余额
    const myTokenBalance = await myToken.balanceOf(await deployer.getAddress());
    console.log("📊 部署者 MyToken 余额:", ethers.utils.formatEther(myTokenBalance));

    // 转账 MyToken
    console.log("📤 转账 MyToken 到接收地址...");
    const tx1 = await myToken.transfer(recipientAddress, transferAmount);
    console.log("⏳ 交易已提交，等待确认... (交易哈希:", tx1.hash, ")");
    const receipt1 = await tx1.wait();
    console.log("✅ MyToken 转账成功! Gas使用:", receipt1.gasUsed.toString());

    // 检查 MyTokenA 余额（已经在构造函数中转账了）
    const myTokenABalance = await myTokenA.balanceOf(recipientAddress);
    console.log("📊 接收地址 MyTokenA 余额:", ethers.utils.formatEther(myTokenABalance));

    // 4. 执行 ERC721 转账
    console.log("\n=== 🎨 执行 ERC721 转账 ===");

    // 为 WTFApe 铸造并转账 NFT
    console.log("🦍 铸造 WTFApe NFT...");
    const mintTx1 = await wtfApe.mint(recipientAddress, 1);
    console.log("⏳ WTFApe TokenId 1 交易已提交，等待确认... (交易哈希:", mintTx1.hash, ")");
    const mintReceipt1 = await mintTx1.wait();
    console.log("✅ WTFApe TokenId 1 铸造并转账成功! Gas使用:", mintReceipt1.gasUsed.toString());

    const mintTx2 = await wtfApe.mint(recipientAddress, 2);
    console.log("⏳ WTFApe TokenId 2 交易已提交，等待确认... (交易哈希:", mintTx2.hash, ")");
    const mintReceipt2 = await mintTx2.wait();
    console.log("✅ WTFApe TokenId 2 铸造并转账成功! Gas使用:", mintReceipt2.gasUsed.toString());

    // 为 CryptoMonkeys 铸造并转账 NFT
    console.log("🐵 铸造 CryptoMonkeys NFT...");
    const mintTx3 = await cryptoMonkeys.mint(recipientAddress, 1);
    console.log("⏳ CryptoMonkeys TokenId 1 交易已提交，等待确认... (交易哈希:", mintTx3.hash, ")");
    const mintReceipt3 = await mintTx3.wait();
    console.log("✅ CryptoMonkeys TokenId 1 铸造并转账成功! Gas使用:", mintReceipt3.gasUsed.toString());

    const mintTx4 = await cryptoMonkeys.mint(recipientAddress, 2);
    console.log("⏳ CryptoMonkeys TokenId 2 交易已提交，等待确认... (交易哈希:", mintTx4.hash, ")");
    const mintReceipt4 = await mintTx4.wait();
    console.log("✅ CryptoMonkeys TokenId 2 铸造并转账成功! Gas使用:", mintReceipt4.gasUsed.toString());

    // 5. 显示最终余额
    console.log("\n=== 📋 最终余额汇总 ===");

    const finalMyTokenBalance = await myToken.balanceOf(recipientAddress);
    const finalMyTokenABalance = await myTokenA.balanceOf(recipientAddress);

    console.log("💰 接收地址 MyToken 余额:", ethers.utils.formatEther(finalMyTokenBalance));
    console.log("💰 接收地址 MyTokenA 余额:", ethers.utils.formatEther(finalMyTokenABalance));
    console.log("🖼️ 接收地址 WTFApe NFT 数量:", (await wtfApe.balanceOf(recipientAddress)).toString());
    console.log("🖼️ 接收地址 CryptoMonkeys NFT 数量:", (await cryptoMonkeys.balanceOf(recipientAddress)).toString());

    // 6. 显示部署信息
    console.log("\n=== 📝 部署信息汇总 ===");
    console.log("🌐 网络: Sepolia Testnet");
    console.log("🔗 Etherscan: https://sepolia.etherscan.io/");
    console.log("📨 接收地址:", recipientAddress);
    console.log("👤 部署者地址:", await deployer.getAddress());
    console.log("💸 总Gas费用:", ethers.utils.formatEther(balance.sub(await deployer.getBalance())), "ETH");

    console.log("\n🎉 Sepolia测试网部署和转账完成!");
    console.log("📊 您可以在 https://sepolia.etherscan.io/ 查看所有交易记录");

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