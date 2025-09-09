import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployments, getNamedAccounts, network } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  log('----------------------------------------------------');
  log(`部署 Counter 合约到 ${network.name} 网络`);
  log(`部署账户: ${deployer}`);

  try {
    // 获取签名者
    const [signer] = await ethers.getSigners();
    
    if (!signer) {
      throw new Error("没有可用的签名者。请确保您已正确设置私钥环境变量。");
    }
    
    log(`使用签名者地址: ${await signer.getAddress()}`);

    // 部署 Counter 合约
    log('正在部署 Counter 合约...');
    
    const counterDeployment = await deploy('Counter', {
      from: deployer,
      args: [], // Counter 合约没有构造函数参数
      log: true,
      waitConfirmations: network.name === 'hardhat' ? 1 : 2, // 在测试网上等待更多确认
    });
    
    log(`Counter 合约部署成功，地址: ${counterDeployment.address}`);
    log(`交易哈希: ${counterDeployment.transactionHash}`);
    
    // 如果不是本地网络，则验证合约
    if (network.name !== 'hardhat' && network.name !== 'localhost') {
      log('请等待足够的区块确认后再验证合约');
      log(`验证命令: npx hardhat verify --network ${network.name} ${counterDeployment.address}`);
    }
    
    // 与合约交互
    const counter = await ethers.getContractAt('Counter', counterDeployment.address);
    const initialValue = await counter.x();
    log(`初始计数值: ${initialValue}`);
    
    // 调用 inc 函数
    log('调用 inc() 函数...');
    const tx = await counter.inc();
    await tx.wait();
    
    // 获取更新后的值
    const updatedValue = await counter.x();
    log(`更新后的计数值: ${updatedValue}`);
    
  } catch (error) {
    log(`部署失败: ${error.message}`);
    log('详细错误信息:');
    console.error(error);
  }
  
  log('----------------------------------------------------');
};

func.tags = ['Counter'];
export default func;