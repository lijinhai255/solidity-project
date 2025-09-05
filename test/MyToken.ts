import { network } from "hardhat";
import { expect } from "chai";
import { BaseContract, ContractTransactionResponse } from "ethers";
// 在 ethers v6 中，BigNumberish 类型需要从 ethers 的子模块导入
import type { BigNumberish } from "ethers";

const { ethers } = await network.connect();

// 为 MyToken 合约定义接口
interface MyTokenContract extends BaseContract {
  name(): Promise<string>;
  symbol(): Promise<string>;
  balanceOf(account: string): Promise<bigint>;
  totalSupply(): Promise<bigint>;
  decimals(): Promise<number>;
  transfer(to: string, amount: BigNumberish): Promise<ContractTransactionResponse>;
  deploymentTransaction(): ContractTransactionResponse;
  getAddress(): Promise<string>;
  waitForDeployment(): Promise<MyTokenContract>;
}

describe("MyToken Test", function() {
  // 使用 BigInt 表示初始供应量，包括 18 位小数
  const initialSupply = 100000n * 10n ** 18n; // 100,000 tokens with 18 decimals
  let myTokenContract: MyTokenContract;
  let owner: { address: string; };
  let recipient: { address: string; }; // 添加接收者账户

  beforeEach(async function() {
    // 获取签名者（部署者和接收者）
    const signers = await ethers.getSigners();
    owner = signers[0];
    recipient = signers[1]; // 使用第二个账户作为接收者
    
    // 部署合约
    const MyToken = await ethers.getContractFactory("MyToken");
    
    // 确保参数作为数组传递，并且是正确的类型
    myTokenContract = (await MyToken.deploy(initialSupply)) as unknown as MyTokenContract;
    await myTokenContract.waitForDeployment();
    
    const contractAddress = await myTokenContract.getAddress();
    console.log("Contract deployed to:", contractAddress);
  });

  it("should have correct name and symbol", async function() {
    expect(await myTokenContract.name()).to.equal("MyToken");
    expect(await myTokenContract.symbol()).to.equal("MTK");
  });

  it("should assign the initial supply to the owner", async function() {
    const ownerBalance = await myTokenContract.balanceOf(owner.address);
    expect(ownerBalance).to.equal(initialSupply);
  });
  
  it("验证下面的约的 name, symbol, decimal", async () => {
    const name = await myTokenContract.name();
    const symbol = await myTokenContract.symbol();
    const decimal = await myTokenContract.decimals();
    
    expect(name).to.equal("MyToken");
    expect(symbol).to.equal("MTK");
    expect(decimal).to.equal(18);
  });

  it("应该能够成功转账代币", async function() {
    // 转账金额：1000个代币
    const transferAmount = 1000n * 10n ** 18n;
    
    // 获取转账前的余额
    const ownerBalanceBefore = await myTokenContract.balanceOf(owner.address);
    const recipientBalanceBefore = await myTokenContract.balanceOf(recipient.address);
    
    // 执行转账
    await myTokenContract.transfer(recipient.address, transferAmount);
    
    // 获取转账后的余额
    const ownerBalanceAfter = await myTokenContract.balanceOf(owner.address);
    const recipientBalanceAfter = await myTokenContract.balanceOf(recipient.address);
    
    // 验证余额变化
    expect(ownerBalanceAfter).to.equal(ownerBalanceBefore - transferAmount);
    expect(recipientBalanceAfter).to.equal(recipientBalanceBefore + transferAmount);
  });
  
  it("当余额不足时应该无法转账", async function() {
    // 尝试转账超过余额的金额
    const excessiveAmount = initialSupply + 1n;
    
    // 使用新的 .revert(ethers) 断言来检查交易是否失败
    await expect(
      myTokenContract.transfer(recipient.address, excessiveAmount)
    ).to.revert(ethers);
  });
});