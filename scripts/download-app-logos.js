const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

// 目标目录
const logoDir = path.join(__dirname, '../public/web3');

// 确保目录存在
if (!fs.existsSync(logoDir)) {
  fs.mkdirSync(logoDir, { recursive: true });
  console.log(`创建目录: ${logoDir}`);
} else {
  console.log(`目录已存在: ${logoDir}`);
}

// Web3 应用官方LOGO URL (主要源和备用源)
const logoSources = {
  uniswap: [
    "https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=029", 
    "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=029"
  ],
  pancakeswap: [
    "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg?v=029", 
    "https://assets.coingecko.com/coins/images/12632/large/pancakeswap-cake-logo.png"
  ],
  curve: [
    "https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg?v=029", 
    "https://cryptologos.cc/logos/curve-dao-token-crv-logo.png?v=029"
  ],
  sushiswap: [
    "https://cryptologos.cc/logos/sushiswap-sushi-logo.svg?v=029", 
    "https://cryptologos.cc/logos/sushiswap-sushi-logo.png?v=029"
  ],
  raydium: [
    "https://cryptologos.cc/logos/raydium-ray-logo.svg?v=029", 
    "https://cryptologos.cc/logos/raydium-ray-logo.png?v=029"
  ],
  aave: [
    "https://cryptologos.cc/logos/aave-aave-logo.svg?v=029", 
    "https://cryptologos.cc/logos/aave-aave-logo.png?v=029"
  ],
  compound: [
    "https://cryptologos.cc/logos/compound-comp-logo.svg?v=029", 
    "https://cryptologos.cc/logos/compound-comp-logo.png?v=029"
  ],
  makerdao: [
    "https://cryptologos.cc/logos/maker-mkr-logo.svg?v=029", 
    "https://cryptologos.cc/logos/maker-mkr-logo.png?v=029"
  ],
  lido: [
    "https://cryptologos.cc/logos/lido-dao-ldo-logo.svg?v=029", 
    "https://cryptologos.cc/logos/lido-dao-ldo-logo.png?v=029"
  ],
  opensea: [
    "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg", 
    "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png"
  ],
  blur: [
    "https://storage.opensea.io/files/1d0238b2671e69ff1460529d23b2c299.png",
    "https://pbs.twimg.com/profile_images/1593789199617536001/jt7WVuOh_400x400.jpg"
  ],
  magiceden: [
    "https://staratlas.com/images/partner-magiceden.svg",
    "https://pbs.twimg.com/profile_images/1568362506740543501/vMLwWXK-_400x400.jpg"
  ],
  axieinfinity: [
    "https://cryptologos.cc/logos/axie-infinity-axs-logo.svg?v=029",
    "https://cryptologos.cc/logos/axie-infinity-axs-logo.png?v=029"
  ],
  sandbox: [
    "https://cryptologos.cc/logos/the-sandbox-sand-logo.svg?v=029",
    "https://cryptologos.cc/logos/the-sandbox-sand-logo.png?v=029"
  ],
  stepn: [
    "https://cryptologos.cc/logos/stepn-gmt-logo.svg?v=029",
    "https://cryptologos.cc/logos/stepn-gmt-logo.png?v=029"
  ],
  gala: [
    "https://cryptologos.cc/logos/gala-gala-logo.svg?v=029",
    "https://cryptologos.cc/logos/gala-gala-logo.png?v=029"
  ],
  metamask: [
    "https://seeklogo.com/images/M/metamask-logo-09EDE53DBD-seeklogo.com.png",
    "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
  ],
  phantom: [
    "https://cdn.jsdelivr.net/gh/phantom-labs/assets/logo-no-shadow.svg",
    "https://play-lh.googleusercontent.com/mbc4b6MnM0N0hl-9H5y6N0eJDK1SKd0yhIRaYUmwIJpgk2F5CEUfYgS4yBdR7MkTXQ=w240-h480-rw"
  ],
  wallet_connect: [
    "https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png",
    "https://avatars.githubusercontent.com/u/37784886"
  ],
  chainlink: [
    "https://cryptologos.cc/logos/chainlink-link-logo.svg?v=029",
    "https://cryptologos.cc/logos/chainlink-link-logo.png?v=029"
  ],
  the_graph: [
    "https://cryptologos.cc/logos/the-graph-grt-logo.svg?v=029",
    "https://cryptologos.cc/logos/the-graph-grt-logo.png?v=029"
  ],
  dydx: [
    "https://cryptologos.cc/logos/dydx-dydx-logo.svg?v=029",
    "https://cryptologos.cc/logos/dydx-dydx-logo.png?v=029"
  ],
  gmx: [
    "https://cryptologos.cc/logos/gmx-gmx-logo.svg?v=029",
    "https://cryptologos.cc/logos/gmx-gmx-logo.png?v=029"
  ],
  alchemix: [
    "https://s2.coinmarketcap.com/static/img/coins/200x200/14364.png",
    "https://assets.coingecko.com/coins/images/14113/large/Alchemix.png"
  ],
  euler: [
    "https://s2.coinmarketcap.com/static/img/coins/200x200/19913.png",
    "https://assets.coingecko.com/coins/images/26149/large/YCvKDfl8_400x400.jpeg"
  ],
  venus: [
    "https://cryptologos.cc/logos/venus-xvs-logo.svg?v=029",
    "https://cryptologos.cc/logos/venus-xvs-logo.png?v=029"
  ],
  foundation: [
    "https://pbs.twimg.com/profile_images/1415274313636712449/zXDEYp-V_400x400.jpg",
    "https://foundation.app/favicon.ico"
  ],
  sudoswap: [
    "https://sudoswap.xyz/favicon.png",
    "https://pbs.twimg.com/profile_images/1526942918403039232/zZHXj4Ba_400x400.jpg"
  ],
  element: [
    "https://pbs.twimg.com/profile_images/1549739145416941569/Pz0GbMZ3_400x400.jpg",
    "https://element.market/favicon.png"
  ],
  illuvium: [
    "https://cryptologos.cc/logos/illuvium-ilv-logo.svg?v=029",
    "https://cryptologos.cc/logos/illuvium-ilv-logo.png?v=029"
  ],
  splinterlands: [
    "https://d36mxiodymuqjm.cloudfront.net/website/icons/512/splinterlands-logo.png",
    "https://images.hive.blog/0x0/https://images.ecency.com/DQmNXya3sJcJPyZKTAKyDY3cSaTXKBsmEACCwGAEpZjRZ5V/splinterlands.png"
  ],
  bigtime: [
    "https://d2qfvg9oqjucl2.cloudfront.net/store/logo/big-time-logo.webp",
    "https://bigtime.gg/favicon.png"
  ],
  traderjoe: [
    "https://cryptologos.cc/logos/trader-joe-joe-logo.svg?v=029",
    "https://cryptologos.cc/logos/trader-joe-joe-logo.png?v=029"
  ]
};

// 第三套备用图片 (通用备用)
const genericFallbacks = {
  uniswap: "https://assets.coingecko.com/coins/images/12504/large/uniswap-uni.png",
  pancakeswap: "https://pancakeswap.finance/favicon.ico",
  curve: "https://curve.fi/favicon.png",
  aave: "https://aave.com/favicon.ico",
  opensea: "https://opensea.io/favicon.ico",
  metamask: "https://metamask.io/images/metamask-fox.svg"
  // 可以根据需要添加更多
};

// 下载图片函数
function downloadImage(url, filePath) {
  return new Promise((resolve, reject) => {
    try {
      // 解析URL
      const parsedUrl = new URL(url);
      
      // 确定使用http还是https
      const client = parsedUrl.protocol === 'https:' ? https : http;
      
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
        let extension = path.extname(parsedUrl.pathname).toLowerCase();
        if (!extension || extension === '.') {
          // 从内容类型推断扩展名
          const contentType = response.headers['content-type'];
          if (contentType) {
            if (contentType.includes('image/png')) extension = '.png';
            else if (contentType.includes('image/jpeg') || contentType.includes('image/jpg')) extension = '.jpg';
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
      request.setTimeout(15000, () => {
        request.abort();
        reject(new Error(`下载超时: ${url}`));
      });
    } catch (error) {
      reject(error);
    }
  });
}

// 处理单个应用图标的下载，尝试所有源
async function downloadAppLogo(appId, urls) {
  const baseFilePath = path.join(logoDir, appId);
  
  // 尝试主要URL列表
  for (const url of urls) {
    try {
      console.log(`尝试下载: ${appId} - ${url}`);
      const filePath = await downloadImage(url, baseFilePath);
      console.log(`成功下载: ${appId} - ${url} -> ${filePath}`);
      return filePath; // 成功下载，返回文件路径
    } catch (error) {
      console.error(`下载失败: ${appId} - ${url}`, error.message);
      // 继续尝试下一个URL
    }
  }
  
  // 尝试通用备用
  if (genericFallbacks[appId]) {
    try {
      const fallbackUrl = genericFallbacks[appId];
      console.log(`尝试通用备用: ${appId} - ${fallbackUrl}`);
      const filePath = await downloadImage(fallbackUrl, baseFilePath);
      console.log(`通用备用下载成功: ${appId} - ${fallbackUrl} -> ${filePath}`);
      return filePath;
    } catch (error) {
      console.error(`通用备用下载失败: ${appId}`, error.message);
    }
  }
  
  // 所有尝试失败
  return null;
}

// 处理所有下载
async function downloadAllLogos() {
  const results = {
    success: [],
    failed: []
  };
  
  for (const [appId, urls] of Object.entries(logoSources)) {
    const filePath = await downloadAppLogo(appId, urls);
    if (filePath) {
      results.success.push({ appId, filePath });
    } else {
      results.failed.push(appId);
    }
  }
  
  // 显示摘要
  console.log('\n===== 下载摘要 =====');
  console.log(`总计尝试: ${Object.keys(logoSources).length} 个应用图标`);
  console.log(`成功下载: ${results.success.length} 个`);
  
  if (results.failed.length > 0) {
    console.log(`下载失败: ${results.failed.length} 个`);
    console.log('失败列表:');
    results.failed.forEach(appId => console.log(`  - ${appId}`));
  } else {
    console.log('所有图标下载成功！');
  }
  
  return results;
}

// 执行下载
console.log('开始下载Web3应用图标...');
downloadAllLogos().then(results => {
  if (results.failed.length > 0) {
    console.log('\n需要手动处理以下图标:');
    results.failed.forEach(appId => console.log(`  - ${appId}`));
    process.exit(1);
  } else {
    console.log('\n全部图标下载成功！');
    process.exit(0);
  }
}).catch(error => {
  console.error('\n下载过程中发生错误:', error);
  process.exit(1);
}); 