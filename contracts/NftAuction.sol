// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
// 实现uups
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

// nft
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

// 修改这一行，使用我们本地的接口文件
import {AggregatorV3Interface} from  "./interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";


contract NftAuction is Initializable,UUPSUpgradeable {
    using SafeERC20 for IERC20;
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
        // 参与竞价的资产类型 0x 地址表示eth，其他地址表示erc20
        address tokenAddress;

    }

    // 状态变量
    mapping(uint256 => Auction) public auctions;
    // 下一个拍卖的id
    uint256 public nextAuctionId;
    // 管理员地址
    address public admin;

    AggregatorV3Interface internal priceFeed;
    event PriceUpdated(int256 price);
    
    

   function setPriceEthFeed(address _priceETHFeed) public {
        priceFeed = AggregatorV3Interface(_priceETHFeed);
    }


function getLatestPrice() public returns (int256) {
    require(address(priceFeed) != address(0), "Price feed not set");

    (, int256 price, , , uint80 answeredInRound) = priceFeed.latestRoundData();
    require(price > 0 && answeredInRound > 0, "Invalid or stale price");

    emit PriceUpdated(price);
    return price;
}


    // 替换构造函数为初始化函数
    function initialize(address _admin) public initializer {
        admin = _admin != address(0) ? _admin : msg.sender;
    }

    // 创建拍卖函数 
    function createAuction(uint256 duration, uint256 startPrice,address _nftAddress,uint256 tonkenId,address _tokenAddress) public {
        // 只有管理员 创建拍马 
        require(msg.sender == admin, 'only admin can create Auction');   

        require(duration > 1000*60, "Duration must be greater than 0");
        require(startPrice > 0, "Start price must be greater than 0");

        // 移除这一行，因为approve应该在外部调用
        // IERC721(_nftAddress).approve(address(this), tonkenId);
        
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
            tokenId:tonkenId,
            tokenAddress: _tokenAddress
        });
        // 增加拍卖id
        nextAuctionId++;
    }
    
    // 买家参与竞拍
    // TODO：ERC20也能参加拍卖
    function placeBid(uint256 _auctionId, uint256 amount, address _tokenAddress) external payable {
        Auction storage auction = auctions[_auctionId];
        require(!auction.ended && block.timestamp < auction.startTime + auction.duration, "Auction has ended");

        address token = _tokenAddress == address(0) ? address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE) : _tokenAddress;
        require(token == auction.tokenAddress, "Token mismatch");

        uint256 bidValue;
        if (token == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {
            // ETH bid
            bidValue = msg.value;
            require(bidValue > auction.highestBid && bidValue >= auction.startPrice, "Bid too low");
        } else {
            // ERC20 bid
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            bidValue = amount;
            require(bidValue > auction.highestBid && bidValue >= auction.startPrice, "Bid too low");
        }

        if (auction.highestBidder != address(0)) {
            if (auction.tokenAddress == address(0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE)) {
                payable(auction.highestBidder).transfer(auction.highestBid);
            } else {
                IERC20(auction.tokenAddress).safeTransfer(auction.highestBidder, auction.highestBid);
            }
        }
        auction.highestBidder = payable(msg.sender);
        auction.highestBid = bidValue;
    }
    
    // 拍卖结束 
    function endAuction(uint256 _auctionId) external {
        Auction storage auction = auctions[_auctionId];
        // 判断当前拍卖是否已经结束
        require(!auction.ended, "Auction has already ended");
        // 判断拍卖时间是否已经结束
        require(auction.startTime + auction.duration < block.timestamp, "Auction has not ended");
        // 将NFT转移给最高出价者
        IERC721(auction.nftContract).safeTransferFrom(address(this), auction.highestBidder, auction.tokenId);
        // 将竞拍金额转给卖家
        payable(auction.seller).transfer(auction.highestBid);
        auction.ended = true;
    }
    
    function _authorizeUpgrade(address) internal override view{
        require(msg.sender == admin,"only admin can upgrade");
    }
}