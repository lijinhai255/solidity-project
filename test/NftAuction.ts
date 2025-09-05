import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

// 使用 ethers v5 的类型定义
describe("NftAuction", function () {
  let nftAuction: Contract;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  beforeEach(async function () {
    // 获取签名者
    [owner, addr1, addr2] = await ethers.getSigners();

    // 部署合约
    const NftAuctionFactory = await ethers.getContractFactory("NftAuction");
    nftAuction = await NftAuctionFactory.deploy();
    await nftAuction.deployed();
  });

  it("Should create an auction correctly", async function () {
    // 模拟一个NFT合约地址
    const mockNftAddress = "0x0000000000000000000000000000000000000001";
    
    // 创建拍卖
    const duration = 60 * 60 * 1000; // 1小时（毫秒）
    const startPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH
    const tokenId = 1;
    
    await nftAuction.createAuction(
      duration,
      startPrice,
      mockNftAddress,
      tokenId
    );
    
    // 获取拍卖信息
    const auction = await nftAuction.auctions(0);
    console.log('auction', auction);
    
    // 验证拍卖信息
    expect(auction.seller).to.equal(owner.address);
    expect(auction.duration).to.equal(duration);
    expect(auction.startPrice).to.equal(startPrice);
    expect(auction.ended).to.be.false;
    expect(auction.highestBidder).to.equal("0x0000000000000000000000000000000000000000");
    expect(auction.highestBid).to.equal(0);
    expect(auction.nftContract).to.equal(mockNftAddress);
    expect(auction.tokenId).to.equal(tokenId);
  });

  it("Should allow bidding on an auction", async function () {
    // 模拟一个NFT合约地址
    const mockNftAddress = "0x0000000000000000000000000000000000000001";
    
    // 创建拍卖
    const duration = 60 * 60 * 1000; // 1小时（毫秒）
    const startPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH
    const tokenId = 1;
    
    await nftAuction.createAuction(
      duration,
      startPrice,
      mockNftAddress,
      tokenId
    );
    
    // addr1 出价 0.2 ETH
    const bidAmount = ethers.utils.parseEther("0.2");
    await nftAuction.connect(addr1).placeBid(0, { value: bidAmount });
    
    // 验证出价信息
    const auction = await nftAuction.auctions(0);
    expect(auction.highestBidder).to.equal(addr1.address);
    expect(auction.highestBid).to.equal(bidAmount);
    
    // addr2 出价 0.3 ETH
    const higherBidAmount = ethers.utils.parseEther("0.3");
    await nftAuction.connect(addr2).placeBid(0, { value: higherBidAmount });
    
    // 验证新的出价信息
    const updatedAuction = await nftAuction.auctions(0);
    expect(updatedAuction.highestBidder).to.equal(addr2.address);
    expect(updatedAuction.highestBid).to.equal(higherBidAmount);
  });
});