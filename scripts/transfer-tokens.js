import pkg from 'hardhat';
const { ethers } = pkg;

async function main() {
  // 定义变量
  const tokenAAddress = "0xD61bfEBA1E28356e653977E4fC5AA82F25396256";
  const tokenBAddress = "0xbe04b4418BF39066628CCf1e7f8f0aEcC8139E6F";
  const recipient = "0x3ad7e0Af623684656C873ae4907bc6C4AcC2c336";

  // 硬编码 1000 * 10^18 (1000个代币，18位小数)
  const transferAmount = "1000000000000000000000";

  // 获取签名者
  const [owner] = await ethers.getSigners();

  // 连接到已部署的合约
  const tokenA = await ethers.getContractAt("ERC20", tokenAAddress);
  const tokenB = await ethers.getContractAt("ERC20", tokenBAddress);

  console.log("开始执行代币转账...");
  // 使用 address 属性或 getAddress 方法，取决于您的 ethers 版本
  console.log("TokenA 地址:", tokenA.address || (tokenA.getAddress ? await tokenA.getAddress() : tokenAAddress));
  console.log("TokenB 地址:", tokenB.address || (tokenB.getAddress ? await tokenB.getAddress() : tokenBAddress));
  console.log("发送地址:", await owner.getAddress());
  console.log("接收地址:", recipient);
  console.log("转账金额: 1000 代币");

  // 获取转账前余额
  const beforeABalance = await tokenA.balanceOf(recipient);
  const beforeBBalance = await tokenB.balanceOf(recipient);

  console.log("转账前 接收地址 TokenA 余额:", beforeABalance.toString());
  console.log("转账前 接收地址 TokenB 余额:", beforeBBalance.toString());

  // 执行 TokenA 转账
  console.log("正在转账 TokenA...");
  const txA = await tokenA.transfer(recipient, transferAmount);
  await txA.wait();
  console.log("TokenA 转账成功! 交易哈希:", txA.hash);

  // 执行 TokenB 转账
  console.log("正在转账 TokenB...");
  const txB = await tokenB.transfer(recipient, transferAmount);
  await txB.wait();
  console.log("TokenB 转账成功! 交易哈希:", txB.hash);

  // 获取转账后余额
  const afterABalance = await tokenA.balanceOf(recipient);
  const afterBBalance = await tokenB.balanceOf(recipient);

  console.log("转账后 接收地址 TokenA 余额:", afterABalance.toString());
  console.log("转账后 接收地址 TokenB 余额:", afterBBalance.toString());

  console.log("转账完成!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("转账过程中出错:", error);
    process.exit(1);
  });