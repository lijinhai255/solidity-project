// scripts/transfer-multiple-tokens.js
import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // 获取签名者（发送者）
  const [sender] = await ethers.getSigners();
  console.log("使用账户:", await sender.getAddress());

  // 接收地址
  const recipientAddress = "0x3ad7e0Af623684656C873ae4907bc6C4AcC2c336";
  console.log("接收地址:", recipientAddress);

  // 代币合约地址和名称
  const tokens = [
    {
      address: "0xD61bfEBA1E28356e653977E4fC5AA82F25396256",
      symbol: "MyTokenA",
      name: "My Token A"
    },
    {
      address: "0xbe04b4418BF39066628CCf1e7f8f0aEcC8139E6F",
      symbol: "MyTokenB",
      name: "My Token B"
    },
    {
      address: "0xCf7D10bB0bF822857c91b381c68a555bEB2955f4",
      symbol: "MyTokenD",
      name: "My Token D"
    },
    {
      address: "0x094C27cf4418De2ea944F39d636f059Bf140549c",
      symbol: "MyTokenE",
      name: "My Token E"
    },
    {
      address: "0x7B5Bcf8E85106d9fc9623816936Ba6a95Dd25A4E",
      symbol: "MyTokenF",
      name: "My Token F"
    }
  ];

  // 转账金额 (10 tokens, 18位小数)
  const transferAmount = "100000000000000000000000"; // 10 * 10^18

  // 对每个代币执行转账
  for (const token of tokens) {
    console.log(`\n开始转账 ${token.symbol} (${token.name})...`);

    // 获取代币合约实例
    const tokenContract = await ethers.getContractAt("ERC20", token.address);

    // 检查发送者余额
    const senderBalance = await tokenContract.balanceOf(await sender.getAddress());
    console.log(`您的 ${token.symbol} 余额: ${senderBalance.toString()}`);

    if (senderBalance.lt(transferAmount)) {
      console.log(`余额不足，无法转账 ${transferAmount} ${token.symbol}`);
      continue;
    }

    // 执行转账
    console.log(`转账 ${transferAmount} ${token.symbol} 到 ${recipientAddress}...`);
    const tx = await tokenContract.transfer(recipientAddress, transferAmount);

    // 等待交易确认
    console.log(`交易已提交，等待确认... (交易哈希: ${tx.hash})`);
    await tx.wait();

    // 确认转账后的余额
    const newSenderBalance = await tokenContract.balanceOf(await sender.getAddress());
    const recipientBalance = await tokenContract.balanceOf(recipientAddress);

    console.log(`转账完成!`);
    console.log(`您的新 ${token.symbol} 余额: ${newSenderBalance.toString()}`);
    console.log(`接收地址 ${token.symbol} 余额: ${recipientBalance.toString()}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("转账过程中出错:", error);
    process.exit(1);
  });