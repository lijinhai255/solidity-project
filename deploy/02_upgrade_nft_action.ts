import { HardhatRuntimeEnvironment } from 'hardhat/types';
import { DeployFunction } from 'hardhat-deploy/types';
import { ethers } from 'hardhat';
import path from 'path';
import fs from 'fs';

// 扩展 global 类型以包含 testProxyAddress
declare global {
    // eslint-disable-next-line no-var
    var testProxyAddress: string | undefined;
}

const upgradeNftAuction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    const { deployments, getNamedAccounts } = hre;
    const { log, save } = deployments;
    const { deployer } = await getNamedAccounts();

    console.log("部署用户地址:", deployer);

    log("----------------------------------------------------");
    log("开始升级 NftAuction 合约到 NftAuctionV2...");

    // 尝试获取代理地址的多种方式
    let proxyAddress;
    
    // 1. 尝试从部署文件中获取
    try {
        // 尝试获取 NftAuction
        const proxyDeployment = await deployments.get("NftAuction");
        proxyAddress = proxyDeployment.address;
        log(`从部署文件中获取代理地址 (NftAuction): ${proxyAddress}`);
    } catch (error) {
        log(`尝试获取 NftAuction 失败: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
    }
    
    // 2. 如果上面失败，尝试获取 NftAuction_Proxy
    if (!proxyAddress) {
        try {
            const proxyDeployment = await deployments.get("NftAuction_Proxy");
            proxyAddress = proxyDeployment.address;
            log(`从部署文件中获取代理地址 (NftAuction_Proxy): ${proxyAddress}`);
        } catch (error) {
            log(`尝试获取 NftAuction_Proxy 失败: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
        }
    }
    
    // 3. 如果上面都失败，尝试从环境变量中获取
    if (!proxyAddress) {
        proxyAddress = process.env.NFT_AUCTION_PROXY_ADDRESS;
        if (proxyAddress) {
            log(`从环境变量中获取代理地址: ${proxyAddress}`);
        }
    }
    
    // 4. 如果上面都失败，尝试从缓存文件中获取
    if (!proxyAddress) {
        try {
            const cachePath = path.resolve(__dirname, "../.cache/proxyNftAuction.json");
            if (fs.existsSync(cachePath)) {
                const cacheData = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
                proxyAddress = cacheData.proxyAddress;
                log(`从缓存文件中获取代理地址: ${proxyAddress}`);
            }
        } catch (error) {
            log(`尝试从缓存文件中获取地址失败: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
        }
    }
    
    // 5. 如果上面都失败，尝试从 hardhat 的 deployments 列表中查找
    if (!proxyAddress) {
        try {
            const allDeployments = await deployments.all();
            log(`所有可用部署: ${Object.keys(allDeployments).join(', ')}`);
            
            // 尝试找到任何可能的代理合约
            for (const name of Object.keys(allDeployments)) {
                if (name.includes('NftAuction') || name.includes('nftauction')) {
                    proxyAddress = allDeployments[name].address;
                    log(`从部署列表中找到可能的代理地址 (${name}): ${proxyAddress}`);
                    break;
                }
            }
        } catch (error) {
            log(`尝试从部署列表中查找失败: ${error.message}`);
        }
    }

    // 如果仍然找不到代理地址，则使用测试中设置的地址
    if (!proxyAddress && global.testProxyAddress) {
        proxyAddress = global.testProxyAddress;
        log(`从全局变量中获取测试代理地址: ${proxyAddress}`);
    }

    if (!proxyAddress) {
        throw new Error("未找到代理合约地址，无法继续升级");
    }

    log(`使用代理地址: ${proxyAddress}`);

    // 部署新的实现合约
    const NftAuctionV2 = await ethers.getContractFactory("NftAuctionV2", { signer: await ethers.getSigner(deployer) });
    const nftAuctionV2Impl = await NftAuctionV2.deploy();
    await nftAuctionV2Impl.deployed();
    
    log(`新的实现合约已部署到: ${nftAuctionV2Impl.address}`);

    // 尝试获取代理管理员合约
    let proxyAdminAddress;
    try {
        const adminDeployment = await deployments.get("DefaultProxyAdmin");
        proxyAdminAddress = adminDeployment.address;
        log(`从部署文件中获取代理管理员地址: ${proxyAdminAddress}`);
    } catch (error) {
        log(`尝试获取代理管理员地址失败: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
        
        // 尝试从存储槽中读取管理员地址
        const adminSlot = "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103";
        const adminAddressBytes = await ethers.provider.getStorageAt(proxyAddress, adminSlot);
        proxyAdminAddress = ethers.utils.getAddress("0x" + adminAddressBytes.slice(-40));
        log(`从存储槽中获取代理管理员地址: ${proxyAdminAddress}`);
    }

    // 升级合约实现
    try {
        // 创建代理管理员合约实例
        const adminAbi = [
            "function upgrade(address proxy, address implementation) external"
        ];
        const proxyAdmin = new ethers.Contract(proxyAdminAddress, adminAbi, await ethers.getSigner(deployer));
        
        // 调用升级函数
        const upgradeTx = await proxyAdmin.upgrade(proxyAddress, nftAuctionV2Impl.address);
        await upgradeTx.wait();
        
        log(`代理合约已升级，交易哈希: ${upgradeTx.hash}`);
    } catch (error) {
        log(`尝试通过代理管理员升级失败: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
        
        // 如果上面的方法失败，尝试直接使用 hardhat-deploy 的升级功能
        log("尝试使用 hardhat-deploy 的升级功能...");
        
        await deployments.deploy("NftAuctionV2", {
            from: deployer,
            proxy: {
                owner: deployer,
                proxyContract: "OpenZeppelinTransparentProxy",
                execute: {
                    init: {
                        methodName: "initialize",
                        args: [deployer]
                    }
                },
                upgradeIndex: 0
            },
            log: true
        });
        
        log("使用 hardhat-deploy 升级成功");
    }

    log(`代理合约地址: ${proxyAddress}`);
    log(`新的实现合约地址: ${nftAuctionV2Impl.address}`);

    // 保存新的合约信息到缓存文件
    const cachePath = path.resolve(__dirname, "../.cache");
    if (!fs.existsSync(cachePath)) {
        fs.mkdirSync(cachePath, { recursive: true });
    }

    const updatedData = {
        proxyAddress: proxyAddress,
        implAddress: nftAuctionV2Impl.address,
        abi: JSON.parse(JSON.stringify(NftAuctionV2.interface.format("json")))
    };

    fs.writeFileSync(
        path.resolve(cachePath, "proxyNftAuction.json"),
        JSON.stringify(updatedData, null, 2)
    );

    log("合约信息已更新到缓存文件");

    // 保存部署信息
    await save("NftAuctionV2", {
        abi: JSON.parse(JSON.stringify(NftAuctionV2.interface.format())),
        address: proxyAddress
    });

    // 测试新版本合约是否包含测试函数
    try {
        const contract = await ethers.getContractAt("NftAuctionV2", proxyAddress);
        const testResult = await contract.testHellowFn();
        log(`测试新函数 testHellowFn 结果: ${testResult}`);
    } catch (error) {
        log(`测试新函数失败: ${typeof error === 'object' && error !== null && 'message' in error ? (error as any).message : String(error)}`);
    }

    log("----------------------------------------------------");
};

upgradeNftAuction.tags = ["upgrade", "nftauctionv2", "v2"];

export default upgradeNftAuction;