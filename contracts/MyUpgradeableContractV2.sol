// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";

contract MyUpgradeableContractV2 is Initializable {
    string private greeting;
    bool private upgraded;
    
    // 初始化函数，与V1版本兼容
    function initialize(string memory _greeting) public initializer {
        greeting = _greeting;
        upgraded = false;
    }
    
    function greet() public view returns (string memory) {
        return greeting;
    }
    
    function setGreeting(string memory _greeting) public {
        greeting = _greeting;
    }
    
    // 新增功能
    function isUpgraded() public view returns (bool) {
        return true; // 总是返回true表示这是升级版
    }
    
    // 新增功能
    function version() public pure returns (string memory) {
        return "V2";
    }
}