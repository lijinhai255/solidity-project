// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @dev 这是一个简化的 OpenZeppelin ProxyAdmin 接口
 * 只包含我们需要的 upgrade 方法
 */
interface IProxyAdmin {
    function upgrade(address proxy, address implementation) external;
}