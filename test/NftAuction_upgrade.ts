import { expect } from "chai";
import { ethers, deployments } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFT Auction Upgrade Test", function () {
  let nftAuctionProxy: string;
  let nftAuction: Contract;
  let owner: SignerWithAddress;

  before(async function () {
    [owner] = await ethers.getSigners();
  });

  describe("Test upgrade", async function () {
    it("Should be able to deploy", async function () {
      // 1. 部署初始版本合约
      await deployments.fixture(["nftauction"]);
      
      // 获取代理合约地址
      const deployment = await deployments.get("NftAuction");
      nftAuctionProxy = deployment.address;
      console.log("NFT Auction 代理地址:", nftAuctionProxy);
      
      // 获取合约实例
      nftAuction = await ethers.getContractAt("NftAuction", nftAuctionProxy);
      
      // 2. 调用 createAuction 方法创建拍卖
      await nftAuction.createAuction(
        100 * 1000, // 持续时间 100 秒
        ethers.utils.parseEther("0.01"), // 起拍价 0.01 ETH
        ethers.constants.AddressZero, // 模拟 NFT 合约地址
        1 // NFT ID
      );
      
      const auction = await nftAuction.auctions(0);
      console.log("创建拍卖成功:", auction);
      
      // 3. 升级合约
      await deployments.fixture(["upgrade", "v2"]);
      
      // 4. 获取升级后的合约
      const nftAuctionV2 = await ethers.getContractAt("NftAuctionV2", nftAuctionProxy);
      const auction2 = await nftAuctionV2.auctions(0);
      console.log("升级后读取拍卖成功:", auction2);
      
      // 验证升级后数据是否保留
      expect(auction2.startTime).to.equal(auction.startTime);
      expect(auction2.seller).to.equal(auction.seller);
      expect(auction2.startPrice).to.equal(auction.startPrice);
      expect(auction2.tokenId).to.equal(auction.tokenId);
      
      // 测试新增功能
      const testResult = await nftAuctionV2.testHellowFn();
      expect(testResult).to.equal("hellow world");
      console.log("测试新函数成功:", testResult);
    });
  });
});