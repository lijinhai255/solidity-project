// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract WTFApe is ERC721, Ownable {
    uint256 private _nextTokenId;
    
    uint public MAX_APES = 10000; // 总量
    
    // 记录已经铸造的tokenId
    mapping(uint => bool) private _mintedTokens;

    // 构造函数
    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {
    }

    // BAYC的baseURI为ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/ 
    function _baseURI() internal pure override returns (string memory) {
        return "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";
    }
    
    // 指定tokenId铸造函数 (仅限管理员)
    function mint(address to, uint tokenId) external onlyOwner {
        require(tokenId >= 0 && tokenId < MAX_APES, "tokenId out of range");
        require(!_mintedTokens[tokenId], "Token already minted");
        
        _mintedTokens[tokenId] = true;
        _mint(to, tokenId);
    }
    
    // 自动分配tokenId铸造函数 (仅限管理员)
    function safeMint(address to) external onlyOwner {
        uint256 tokenId = _nextTokenId;
        require(tokenId < MAX_APES, "All tokens have been minted");
        
        _nextTokenId++;
        _mint(to, tokenId);
    }
    
    // 公开铸造函数 (可以添加价格限制)
    function publicMint() external {
        uint256 tokenId = _nextTokenId;
        require(tokenId < MAX_APES, "All tokens have been minted");
        
        _nextTokenId++;
        _mint(msg.sender, tokenId);
    }
    
    // 获取已铸造的代币数量
    function totalMinted() public view returns (uint256) {
        return _nextTokenId;
    }
    
    // 检查tokenId是否已被铸造
    function isMinted(uint256 tokenId) public view returns (bool) {
        return _mintedTokens[tokenId] || tokenId < _nextTokenId;
    }
}