// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyTokenF is ERC20, Ownable {
  // 接收地址和转账金额
  address public initialRecipient;
  uint256 public constant INITIAL_TRANSFER_AMOUNT = 100000 * 10**18; // 100000 tokens with 18 decimals

  constructor(address recipient)
    ERC20("MyTokenF", "MyTokenF")
    Ownable(msg.sender)
  {
    // 设置初始接收地址
    initialRecipient = recipient;
    
    // 铸造初始代币并转给合约部署者
    _mint(msg.sender, 1000000 * 10**18); // 铸造 1,000,000 代币作为初始供应量
    
    // 转账 100000 代币到指定地址
    if (recipient != address(0)) {
      _transfer(msg.sender, recipient, INITIAL_TRANSFER_AMOUNT);
    }
  }

  // 公开铸造函数，需要支付 0.01 ETH
  function mint(uint256 amount) public payable {
    require(msg.value == 0.01 ether, "must pay 0.01 ether");
    require(amount > 0, "amount must be greater than 0");
    
    // 铸造代币给调用者
    _mint(msg.sender, amount * 10**18);
  }

  // 允许合约拥有者提取合约中的 ETH
  function withdraw() public onlyOwner {
    uint256 balance = address(this).balance;
    require(balance > 0, "No ETH to withdraw");
    
    (bool success, ) = payable(owner()).call{value: balance}("");
    require(success, "Withdrawal failed");
  }
}