const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

// 创建目录（如果不存在）
const logoDir = path.join(__dirname, '../public/images/web3');
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
  console.log(`创建目录: ${logoDir}`);
}

// Web3 应用官方LOGO网络图片URL
const appLogoUrls = {
  uniswap: "https://raw.githubusercontent.com/Uniswap/interface/main/apps/web/public/logos/1/token-logo.png",
  pancakeswap: "https://assets.coingecko.com/coins/images/12632/small/pancakeswap-cake-logo.png",
  curve: "https://assets.coingecko.com/coins/images/12124/small/Curve.png",
  sushiswap: "https://assets.coingecko.com/coins/images/12271/small/sushi.png",
  raydium: "https://assets.coingecko.com/coins/images/13928/small/PSigc4ie_400x400.jpg",
  aave: "https://assets.coingecko.com/coins/images/12645/small/AAVE.png",
  compound: "https://assets.coingecko.com/coins/images/10775/small/COMP.png",
  makerdao: "https://assets.coingecko.com/coins/images/1364/small/Mark_Maker.png",
  lido: "https://assets.coingecko.com/coins/images/13573/small/Lido_DAO.png",
  opensea: "https://opensea.io/static/images/logos/opensea.svg",
  blur: "https://assets.coingecko.com/coins/images/28453/small/blur.png",
  magiceden: "https://storage.googleapis.com/magiceden-prod-bucket/imgs/me-logo.png",
  axieinfinity: "https://assets.coingecko.com/coins/images/13029/small/axie_infinity_logo.png",
  sandbox: "https://assets.coingecko.com/coins/images/12129/small/sandbox_logo.jpg",
  stepn: "https://assets.coingecko.com/coins/images/23597/small/gmt.png",
  gala: "https://assets.coingecko.com/coins/images/12493/small/GALA-COINGECKO.png",
  metamask: "https://github.com/MetaMask/brand-resources/raw/main/SVG/metamask-fox.svg",
  phantom: "https://phantom.app/img/logo.png",
  wallet_connect: "https://walletconnect.com/images/favicon-32x32.png",
  chainlink: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  the_graph: "https://assets.coingecko.com/coins/images/13397/small/Graph_Token.png",
  dydx: "https://assets.coingecko.com/coins/images/17500/small/hjnIm9bV.jpg",
  gmx: "https://assets.coingecko.com/coins/images/18323/small/arbit.png",
  alchemix: "https://assets.coingecko.com/coins/images/14113/small/Alchemix.png",
  euler: "https://assets.coingecko.com/coins/images/26149/small/YCvKDfl8_400x400.jpeg",
  venus: "https://assets.coingecko.com/coins/images/12677/small/venus_symbol_color.png",
  foundation: "https://foundation.app/favicon.ico",
  sudoswap: "https://sudoswap.xyz/favicon.png",
  element: "https://element.market/favicon.png",
  illuvium: "https://assets.coingecko.com/coins/images/14468/small/ILV.JPG",
  splinterlands: "https://images.hive.blog/0x0/https://images.ecency.com/DQmNXya3sJcJPyZKTAKyDY3cSaTXKBsmEACCwGAEpZjRZ5V/splinterlands.png",
  bigtime: "https://bigtime.gg/favicon.png",
  traderjoe: "https://assets.coingecko.com/coins/images/17569/small/JOE.png"
};

// 备用图片URL
const backupLogoUrls = {
  opensea: "https://storage.googleapis.com/opensea-static/Logomark/OpenSea-Logomark-Blue.png",
  blur: "https://blur.io/favicon.ico",
  magiceden: "https://www.magiceden.io/img/favicon.png",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  phantom: "https://phantom.app/static/images/phantom-logo.svg",
  wallet_connect: "https://avatars.githubusercontent.com/u/37784886",
  foundation: "https://mma.prnewswire.com/media/1231690/Foundation_Logo.jpg",
  sudoswap: "https://pbs.twimg.com/profile_images/1526942918403039232/zZHXj4Ba_400x400.jpg",
  element: "https://pbs.twimg.com/profile_images/1616061893577924609/fW_Xbzgo_400x400.jpg",
  bigtime: "https://bigtime.gg/images/social-card.png"
};

// 下载图片函数
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    // 确定使用http还是https
    const client = url.startsWith('https') ? https : http;
    
    const request = client.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`重定向: ${url} -> ${response.headers.location}`);
        downloadImage(response.headers.location, filePath)
          .then(resolve)
          .catch(reject);
        return;
      }
      
      // 检查状态码
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，状态码: ${response.statusCode}`));
        return;
      }
      
      // 获取文件扩展名
      let extension = path.extname(url).toLowerCase();
      if (!extension || extension === '.') {
        // 从内容类型推断扩展名
        const contentType = response.headers['content-type'];
        if (contentType) {
          if (contentType.includes('image/png')) extension = '.png';
          else if (contentType.includes('image/jpeg')) extension = '.jpg';
          else if (contentType.includes('image/svg+xml')) extension = '.svg';
          else if (contentType.includes('image/webp')) extension = '.webp';
          else if (contentType.includes('image/gif')) extension = '.gif';
          else if (contentType.includes('image/x-icon') || contentType.includes('image/vnd.microsoft.icon')) extension = '.ico';
          else extension = '.png'; // 默认扩展名
        } else {
          extension = '.png'; // 默认扩展名
        }
      }
      
      // 确保文件路径具有正确的扩展名
      const finalFilePath = filePath.endsWith(extension) ? filePath : `${filePath}${extension}`;
      
      // 创建文件写入流
      const fileStream = fs.createWriteStream(finalFilePath);
      
      // 写入文件
      response.pipe(fileStream);
      
      // 处理完成事件
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`下载完成: ${finalFilePath}`);
        resolve(finalFilePath);
      });
      
      // 处理错误
      fileStream.on('error', (err) => {
        fs.unlink(finalFilePath, () => {}); // 删除不完整的文件
        reject(err);
      });
    });
    
    // 处理请求错误
    request.on('error', (err) => {
      reject(err);
    });
    
    // 设置请求超时
    request.setTimeout(10000, () => {
      request.abort();
      reject(new Error(`下载超时: ${url}`));
    });
  });
}

// 处理所有下载
async function downloadAllLogos() {
  const failedDownloads = [];
  
  for (const [appId, url] of Object.entries(appLogoUrls)) {
    const filePath = path.join(logoDir, `${appId}`);
    
    try {
      console.log(`开始下载: ${appId} - ${url}`);
      await downloadImage(url, filePath);
      console.log(`成功下载: ${appId}`);
    } catch (error) {
      console.error(`下载失败: ${appId} - ${url}`, error.message);
      failedDownloads.push(appId);
    }
  }
  
  // 尝试使用备用URL下载失败的图片
  console.log('\n===== 尝试使用备用URL下载失败的图片 =====\n');
  
  for (const appId of failedDownloads) {
    if (backupLogoUrls[appId]) {
      const backupUrl = backupLogoUrls[appId];
      const filePath = path.join(logoDir, `${appId}`);
      
      try {
        console.log(`尝试备用URL: ${appId} - ${backupUrl}`);
        await downloadImage(backupUrl, filePath);
        console.log(`备用下载成功: ${appId}`);
        // 从失败列表中移除
        const index = failedDownloads.indexOf(appId);
        if (index > -1) {
          failedDownloads.splice(index, 1);
        }
      } catch (error) {
        console.error(`备用下载失败: ${appId} - ${backupUrl}`, error.message);
      }
    }
  }
  
  // 显示摘要
  console.log('\n===== 下载摘要 =====');
  console.log(`总计尝试: ${Object.keys(appLogoUrls).length} 个图标`);
  console.log(`成功下载: ${Object.keys(appLogoUrls).length - failedDownloads.length} 个`);
  
  if (failedDownloads.length > 0) {
    console.log(`下载失败: ${failedDownloads.length} 个`);
    console.log('失败列表:');
    failedDownloads.forEach(appId => console.log(`  - ${appId}`));
  } else {
    console.log('所有图标下载成功！');
  }
  
  return failedDownloads;
}

// 执行下载
downloadAllLogos().then(failedDownloads => {
  if (failedDownloads.length > 0) {
    console.log('\n需要手动处理以下图标:');
    failedDownloads.forEach(appId => console.log(`  - ${appId}`));
  }
}).catch(error => {
  console.error('下载过程中发生错误:', error);
}); 