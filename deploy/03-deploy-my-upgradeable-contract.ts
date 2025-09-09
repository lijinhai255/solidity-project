import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers, upgrades } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { log } = deployments;

  log('----------------------------------------------------');
  log(`检查部署状态并尝试完成部署到 ${network.name} 网络...`);
  
  // 实现合约地址和交易哈希
  const implAddress = '0xe9a87e71d6FDEC64AE5e7C513d19Eb7065B826d5';
  const txHash = '0xbc4cd95b444c343f3e75771cb49e0526f15777b4decc5bc4677ae178f11d2c68';
  
  try {
    // 获取交易收据
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    
    if (receipt) {
      log(`交易已确认，区块号: ${receipt.blockNumber}`);
      
      // 获取签名者
      const [signer] = await ethers.getSigners();
      log(`使用签名者地址: ${await signer.getAddress()}`);
      
      // 获取合约工厂
      const MyUpgradeableContractFactory = await ethers.getContractFactory("MyUpgradeableContract");
      
      // 部署代理合约
      log('正在部署代理合约...');
      const initialGreeting = "Hello, Upgradeable World!";
      
      const deployOptions = {
        timeout: 300000, // 5分钟
        pollingInterval: 15000, // 15秒
        kind: 'transparent',
        initializer: 'initialize'
      };
      
      const proxy = await upgrades.deployProxy(
        MyUpgradeableContractFactory, 
        [initialGreeting],
        deployOptions
      );
      
      await proxy.waitForDeployment();
      
      const proxyAddress = await proxy.getAddress();
      log(`代理合约部署成功，地址: ${proxyAddress}`);
      
      // 获取实现合约地址
      const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
      log(`实现合约地址: ${implementationAddress}`);
      
      // 获取代理管理员地址
      const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
      log(`代理管理员地址: ${adminAddress}`);
      
      // 测试合约功能
      const contract = await ethers.getContractAt("MyUpgradeableContract", proxyAddress);
      const greeting = await contract.greet();
      log(`当前问候语: ${greeting}`);
    } else {
      log('交易尚未确认，可能需要更长时间或交易失败');
      log('请在 Sepolia 区块浏览器中检查交易状态:');
      log(`https://sepolia.etherscan.io/tx/${txHash}`);
    }
  } catch (error) {
    log(`操作失败: ${error.message}`);
    log('详细错误信息:');
    console.error(error);
  }
  
  log('----------------------------------------------------');
};

func.tags = ['MyUpgradeableContract'];
export default func;