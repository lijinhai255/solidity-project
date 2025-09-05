// 使用 ES 模块语法
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 检查 artifacts 目录
const artifactsDir = path.join(__dirname, '../artifacts');
console.log('检查 artifacts 目录是否存在:', fs.existsSync(artifactsDir));

if (fs.existsSync(artifactsDir)) {
  // 列出 artifacts 目录下的内容
  const files = fs.readdirSync(artifactsDir);
  console.log('artifacts 目录内容:', files);
  
  // 检查 contracts 子目录
  const contractsDir = path.join(artifactsDir, 'contracts');
  if (fs.existsSync(contractsDir)) {
    const contractFiles = fs.readdirSync(contractsDir);
    console.log('contracts 子目录内容:', contractFiles);
  }
}

// 尝试查找所有 JSON 文件
function findJsonFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      findJsonFiles(filePath, fileList);
    } else if (file.endsWith('.json') && !file.endsWith('.dbg.json')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

try {
  const jsonFiles = findJsonFiles(artifactsDir);
  console.log('找到的 JSON 文件数量:', jsonFiles.length);
  if (jsonFiles.length > 0) {
    console.log('JSON 文件示例:', jsonFiles.slice(0, 3));
  }
} catch (error) {
  console.error('查找 JSON 文件时出错:', error);
}