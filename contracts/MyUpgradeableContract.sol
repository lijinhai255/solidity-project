// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyUpgradeableContract is Initializable {
    string private greeting;
    
    // 替代构造函数的初始化函数
    function initialize(string memory _greeting) public initializer {
        greeting = _greeting;
    }
    
    function greet() public view returns (string memory) {
        return greeting;
    }
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
}