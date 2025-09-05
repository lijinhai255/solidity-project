import { expect } from "chai";
import { ethers, upgrades } from "hardhat";
import { TestERC721, NftAuction } from "../typechain-types";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NFT and Auction Tests", function () {
  let testNFT: TestERC721;
  let nftAuction: NftAuction;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];

  const TOKEN_ID = 1;
  const AUCTION_DURATION = 60 * 60 * 24; // 1 day in seconds
  const START_PRICE = ethers.utils.parseEther("0.1"); // 0.1 ETH

  beforeEach(async function () {
    // 获取签名者账户
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // 部署 TestERC721 合约
    const TestNFTFactory = await ethers.getContractFactory("TestERC721");
    testNFT = await TestNFTFactory.deploy() as TestERC721;
    await testNFT.deployed();

    // 设置 NFT 的 tokenURI
    await testNFT.setTokenURI("https://example.com/metadata");

    // 铸造一个 NFT 给 owner
    await testNFT.mint(owner.address, TOKEN_ID);

    // 部署可升级的 NftAuction 合约
    const NftAuctionFactory = await ethers.getContractFactory("NftAuction");
    nftAuction = await upgrades.deployProxy(
      NftAuctionFactory, 
      [owner.address], 
      { kind: 'uups' }
    ) as NftAuction;
    await nftAuction.deployed();
  });

  describe("TestERC721", function () {
    it("Should mint an NFT correctly", async function () {
      expect(await testNFT.ownerOf(TOKEN_ID)).to.equal(owner.address);
    });

    it("Should set and get tokenURI correctly", async function () {
      expect(await testNFT.tokenURI(TOKEN_ID)).to.equal("https://example.com/metadata");
      
      await testNFT.setTokenURI("https://example.com/updated");
      expect(await testNFT.tokenURI(TOKEN_ID)).to.equal("https://example.com/updated");
    });

    it("Should transfer NFT correctly", async function () {
      await testNFT.transferFrom(owner.address, addr1.address, TOKEN_ID);
      expect(await testNFT.ownerOf(TOKEN_ID)).to.equal(addr1.address);
    });

    it("Should fail when non-owner tries to mint", async function () {
      await expect(
        testNFT.connect(addr1).mint(addr1.address, 2)
      ).to.be.reverted; // 使用简单的 reverted 断言
    });
  });

  describe("NftAuction", function () {
    beforeEach(async function () {
      // 授权 NftAuction 合约操作 NFT
      await testNFT.approve(nftAuction.address, TOKEN_ID);
    });

    it("Should initialize with correct admin", async function () {
      expect(await nftAuction.admin()).to.equal(owner.address);
    });

    it("Should create auction successfully", async function () {
      await nftAuction.createAuction(
        AUCTION_DURATION,
        START_PRICE,
        testNFT.address,
        TOKEN_ID
      );

      const auction = await nftAuction.auctions(0);
      expect(auction.seller).to.equal(owner.address);
      expect(auction.duration).to.equal(AUCTION_DURATION);
      expect(auction.startPrice).to.equal(START_PRICE);
      expect(auction.ended).to.be.false;
      expect(auction.nftContract).to.equal(testNFT.address);
      expect(auction.tokenId).to.equal(TOKEN_ID);
    });

    it("Should place bid successfully", async function () {
      await nftAuction.createAuction(
        AUCTION_DURATION,
        START_PRICE,
        testNFT.address,
        TOKEN_ID
      );

      // 在创建拍卖后，将 NFT 转移到拍卖合约
      await testNFT.transferFrom(owner.address, nftAuction.address, TOKEN_ID);

      // addr1 places a bid
      await nftAuction.connect(addr1).placeBid(0, { value: ethers.utils.parseEther("0.2") });
      
      let auction = await nftAuction.auctions(0);
      expect(auction.highestBidder).to.equal(addr1.address);
      expect(auction.highestBid).to.equal(ethers.utils.parseEther("0.2"));

      // addr2 places a higher bid
      await nftAuction.connect(addr2).placeBid(0, { value: ethers.utils.parseEther("0.3") });
      
      auction = await nftAuction.auctions(0);
      expect(auction.highestBidder).to.equal(addr2.address);
      expect(auction.highestBid).to.equal(ethers.utils.parseEther("0.3"));
    });

    it("Should fail when bid is too low", async function () {
      await nftAuction.createAuction(
        AUCTION_DURATION,
        START_PRICE,
        testNFT.address,
        TOKEN_ID
      );

      // 在创建拍卖后，将 NFT 转移到拍卖合约
      await testNFT.transferFrom(owner.address, nftAuction.address, TOKEN_ID);

      await expect(
        nftAuction.connect(addr1).placeBid(0, { value: ethers.utils.parseEther("0.05") })
      ).to.be.revertedWith("Bid must be higher than the current highest bid");
    });

    it("Should end auction successfully", async function () {
      await nftAuction.createAuction(
        AUCTION_DURATION,
        START_PRICE,
        testNFT.address,
        TOKEN_ID
      );

      // 在创建拍卖后，将 NFT 转移到拍卖合约
      await testNFT.transferFrom(owner.address, nftAuction.address, TOKEN_ID);

      // addr1 places a bid
      const bidAmount = ethers.utils.parseEther("0.2");
      await nftAuction.connect(addr1).placeBid(0, { value: bidAmount });
      
      // 模拟时间经过
      await ethers.provider.send("evm_increaseTime", [AUCTION_DURATION + 1]);
      await ethers.provider.send("evm_mine", []);
      
      // 记录卖家之前的余额
      const sellerBalanceBefore = await ethers.provider.getBalance(owner.address);
      
      // 结束拍卖
      await nftAuction.endAuction(0);
      
      // 验证拍卖已结束
      const auction = await nftAuction.auctions(0);
      expect(auction.ended).to.be.true;
      
      // 验证 NFT 已转移给最高出价者
      expect(await testNFT.ownerOf(TOKEN_ID)).to.equal(addr1.address);
      
      // 验证卖家收到了拍卖金额 - 使用接近断言而不是精确相等
      const sellerBalanceAfter = await ethers.provider.getBalance(owner.address);
      const balanceDiff = sellerBalanceAfter.sub(sellerBalanceBefore);
      
      // 使用 closeTo 断言，允许有一定的误差范围（gas 费用）
      expect(balanceDiff).to.be.closeTo(
        bidAmount,
        ethers.utils.parseEther("0.01") // 允许 0.01 ETH 的误差
      );
    });

    it("Should fail to end auction before duration", async function () {
      await nftAuction.createAuction(
        AUCTION_DURATION,
        START_PRICE,
        testNFT.address,
        TOKEN_ID
      );

      // 在创建拍卖后，将 NFT 转移到拍卖合约
      await testNFT.transferFrom(owner.address, nftAuction.address, TOKEN_ID);

      await nftAuction.connect(addr1).placeBid(0, { value: ethers.utils.parseEther("0.2") });
      
      await expect(
        nftAuction.endAuction(0)
      ).to.be.revertedWith("Auction has not ended");
    });
  });
});