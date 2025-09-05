import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MyTokenModule", (m) => {
  // 部署 MyToken 合约，初始供应量为 1,000,000 个代币（带 18 位小数）
  const initialSupply = 1000000n * 10n ** 18n; // 1百万代币，18位小数
  const myToken = m.contract("MyToken", [initialSupply]);

  return { myToken };
});