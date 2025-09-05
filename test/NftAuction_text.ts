import { expect } from "chai";
import { ethers, deployments, upgrades } from "hardhat";
import { Contract } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("NftAuction 合约测试", function () {
    let nftAuction: Contract;
    let nftAuctionV2: Contract;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;
    let proxyAddress: string;

    // 测试参数
    const duration = 1000 * 60 * 60; // 1小时
    const startPrice = ethers.utils.parseEther("0.1"); // 0.1 ETH
    const mockNftAddress = "0x0000000000000000000000000000000000000001"; // 模拟NFT合约地址
    const tokenId = 1; // 模拟NFT的ID

    before(async function () {
        // 获取测试账户
        [owner, addr1, addr2] = await ethers.getSigners();
    });

    describe("合约部署和功能测试", function () {
        it("应该能够部署初始版本合约", async function () {
            // 重置部署状态
            await deployments.fixture();

            // 1. 部署初始版本的合约 - 使用正确的标签 "nftauction"
            await deployments.fixture(["nftauction"]);

            // 输出所有可用的部署，帮助调试
            const allDeployments = await deployments.all();
            console.log("可用的部署:", Object.keys(allDeployments));

            // 获取部署的合约实例
            let proxyDeployment = await deployments.get("NftAuction");
            proxyAddress = proxyDeployment.address;
            console.log("获取到的代理地址:", proxyAddress);

            // 获取合约实例
            nftAuction = await ethers.getContractAt("NftAuction", proxyAddress);

            // 验证合约已正确部署
            expect(await nftAuction.admin()).to.equal(owner.address);
            expect(await nftAuction.nextAuctionId()).to.equal(0);

            console.log("NftAuction 合约已部署，代理地址:", proxyAddress);

            // 2. 调用 createAuction 创建一个拍卖
            await nftAuction.createAuction(
                duration,
                startPrice,
                mockNftAddress,
                tokenId
            );

            // 验证拍卖已创建
            expect(await nftAuction.nextAuctionId()).to.equal(1);

            // 获取拍卖信息
            const auction = await nftAuction.auctions(0);
            expect(auction.seller).to.equal(owner.address);
            expect(auction.startPrice).to.equal(startPrice);
            expect(auction.nftContract).to.equal(mockNftAddress);
            expect(auction.tokenId).to.equal(tokenId);
            expect(auction.ended).to.equal(false);

            console.log("成功创建拍卖，拍卖ID: 0");

            // 保存代理地址到环境变量，供升级脚本使用
            process.env.NFT_AUCTION_PROXY_ADDRESS = proxyAddress;
        });

        it("应该能够使用升级脚本升级到V2版本", async function () {
            // 确保我们有正确的代理地址
            if (!process.env.NFT_AUCTION_PROXY_ADDRESS) {
                const proxyDeployment = await deployments.get("NftAuction");
                process.env.NFT_AUCTION_PROXY_ADDRESS = proxyDeployment.address;
            }

            console.log("升级前的代理地址:", process.env.NFT_AUCTION_PROXY_ADDRESS);

            // 运行升级脚本 - 使用 upgrade 和 v2 标签
            await deployments.fixture(["upgrade", "v2"]);

            // 检查升级后的部署
            const allDeployments = await deployments.all();
            console.log("升级后可用的部署:", Object.keys(allDeployments));

            // 获取升级后的合约实例
            // 注意：升级后可能会有新的部署名称，如 NftAuctionV2
            let updatedProxyAddress;
            try {
                const v2Deployment = await deployments.get("NftAuctionV2");
                updatedProxyAddress = v2Deployment.address;
                console.log("找到 NftAuctionV2 部署，地址:", updatedProxyAddress);
            } catch (error) {
                // 如果找不到 NftAuctionV2，使用原来的代理地址
                updatedProxyAddress = process.env.NFT_AUCTION_PROXY_ADDRESS;
                console.log("使用原来的代理地址:", updatedProxyAddress);
            }

            // 获取升级后的合约实例
            nftAuctionV2 = await ethers.getContractAt("NftAuctionV2", updatedProxyAddress);

            console.log("合约已使用升级脚本升级到 NftAuctionV2");

            // 验证升级后的合约保留了状态
            expect(await nftAuctionV2.admin()).to.equal(owner.address);
            expect(await nftAuctionV2.nextAuctionId()).to.equal(1);

            // 验证之前创建的拍卖数据仍然存在
            const auctionAfterUpgrade = await nftAuctionV2.auctions(0);
            expect(auctionAfterUpgrade.seller).to.equal(owner.address);
            expect(auctionAfterUpgrade.startPrice).to.equal(startPrice);
            expect(auctionAfterUpgrade.nftContract).to.equal(mockNftAddress);
            expect(auctionAfterUpgrade.tokenId).to.equal(tokenId);

            // 测试 V2 版本新增的功能
            const testResult = await nftAuctionV2.testHellowFn();
            expect(testResult).to.equal("hellow world");
            console.log("成功调用 V2 版本新增的函数:", testResult);
        });

        it("应该能够在V2版本中创建新拍卖和参与竞拍", async function () {
            // 确保我们有正确的合约实例
            if (!nftAuctionV2) {
                // 尝试获取升级后的合约地址
                let v2Address;
                try {
                    const v2Deployment = await deployments.get("NftAuctionV2");
                    v2Address = v2Deployment.address;
                } catch (error) {
                    // 如果找不到，使用原来的代理地址
                    v2Address = process.env.NFT_AUCTION_PROXY_ADDRESS;
                }

                nftAuctionV2 = await ethers.getContractAt("NftAuctionV2", v2Address);
            }

            // 在测试前，先创建一个拍卖，因为每个测试都会重置状态
            await nftAuctionV2.createAuction(
                duration,
                startPrice,
                mockNftAddress,
                tokenId
            );

            // 1. 测试在 V2 版本创建新拍卖
            await nftAuctionV2.createAuction(
                duration * 2, // 2小时
                startPrice.mul(2), // 0.2 ETH
                mockNftAddress,
                tokenId + 1
            );

            // 验证新拍卖已创建 - 现在应该是 2，因为我们在测试开始时创建了一个拍卖
            expect(await nftAuctionV2.nextAuctionId()).to.equal(2);
            
            // 获取第二个拍卖的信息
            const newAuction = await nftAuctionV2.auctions(1);
            
            // 验证拍卖信息
            expect(newAuction.seller).to.equal(owner.address);
            expect(newAuction.startPrice).to.equal(startPrice.mul(2));
            expect(newAuction.nftContract).to.equal(mockNftAddress);
            expect(newAuction.tokenId).to.equal(tokenId + 1);

            console.log("在 V2 版本成功创建新拍卖，拍卖ID: 1");

            // 2. 测试竞拍功能
            await expect(
                nftAuctionV2.connect(addr1).placeBid(0, { value: startPrice })
            ).to.be.revertedWith("Bid must be higher than the current highest bid");

            // 正确的出价 (高于起拍价)
            const bidAmount = startPrice.add(ethers.utils.parseEther("0.05"));
            await nftAuctionV2.connect(addr1).placeBid(0, { value: bidAmount });

            // 验证出价已记录
            const auctionAfterBid = await nftAuctionV2.auctions(0);
            expect(auctionAfterBid.highestBidder).to.equal(addr1.address);
            expect(auctionAfterBid.highestBid).to.equal(bidAmount);

            console.log("成功测试竞拍功能");
        });
    });
});