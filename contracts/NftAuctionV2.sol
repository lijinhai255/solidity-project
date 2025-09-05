// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract NftAuctionV2 is Initializable {
    struct Auction {
        // 卖家
        address payable seller;
        // 拍卖持续时间
        uint256 duration;
        // 起拍价格
        uint256 startPrice;
        // 是否结束
        bool ended;
        // 最高出价者
        address payable highestBidder;
        // 最高价格
        uint256 highestBid;
        // 开始时间
        uint256 startTime;
        // 合约地址 
        address nftContract;
        // NFT ID
        uint256 tokenId;
    }

    // 状态变量
    mapping(uint256 => Auction) public auctions;
    // 下一个拍卖的id
    uint256 public nextAuctionId;
    // 管理员地址
    address public admin;

    // 替换构造函数为初始化函数
    function initialize(address _admin) public initializer {
        admin = _admin != address(0) ? _admin : msg.sender;
    }

    // 创建拍卖函数 
    function createAuction(uint256 duration, uint256 startPrice,address _nftAddress,uint256 tonkenId) public {
        // 只有管理员 创建拍马 
        require(msg.sender == admin, 'only admin can create Auction');   

        require(duration > 1000*60, "Duration must be greater than 0");
        require(startPrice > 0, "Start price must be greater than 0");
        
        // 创建新的拍卖
        auctions[nextAuctionId] = Auction({
            seller: payable(msg.sender),
            duration: duration,
            startPrice: startPrice,
            ended: false,
            highestBidder: payable(address(0)),
            highestBid: 0,
            startTime:block.timestamp,
            nftContract:_nftAddress,
            tokenId:tonkenId
        });
        // 增加拍卖id
        nextAuctionId++;
    }
    
    // 买家参与竞拍
    function placeBid(uint256 _auctionId) external payable {
        Auction storage auction = auctions[_auctionId];
        // 判断当前拍卖是否已经结束
        require(!auction.ended && auction.startTime + auction.duration > block.timestamp, "Auction has ended");
        // 判断出价是否大于当前最高出价
        require(msg.value > auction.highestBid && msg.value >= auction.startPrice, "Bid must be higher than the current highest bid");
        // 退回之前的最高出价者
        if (auction.highestBidder != address(0)) {
            payable(auction.highestBidder).transfer(auction.highestBid);
        }
        auction.highestBidder = payable(msg.sender);
        auction.highestBid = msg.value;
    }
    function testHellowFn ()public pure returns (string memory){
        return "hellow world";
    }
}