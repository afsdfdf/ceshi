"use client"

import { useState } from "react"
import { Search, TrendingUp, Zap, Download, ExternalLink, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BottomNav from "../components/BottomNav"
import EthereumProtection from "../components/EthereumProtection"
import { cn } from "@/lib/utils"
import { useTheme } from "next-themes"

// Web3 应用SVG LOGO数据
const appLogos: Record<string, string> = {
  uniswap: `<svg viewBox="0 0 128 128" fill="none"><path d="M96 64C96 82.7777 80.7777 98 62 98C43.2223 98 28 82.7777 28 64C28 45.2223 43.2223 30 62 30C80.7777 30 96 45.2223 96 64Z" fill="#FF007A"/><path d="M69.9334 60.6669C71.7354 60.6669 73.2001 59.2022 73.2001 57.4002C73.2001 55.5983 71.7354 54.1335 69.9334 54.1335C68.1314 54.1335 66.6667 55.5983 66.6667 57.4002C66.6667 59.2022 68.1314 60.6669 69.9334 60.6669Z" fill="white"/><path d="M59.7333 69.4669C61.5352 69.4669 63 67.1355 63 64.3335C63 61.5316 61.5352 59.2002 59.7333 59.2002C57.9313 59.2002 56.4666 61.5316 56.4666 64.3335C56.4666 67.1355 57.9313 69.4669 59.7333 69.4669Z" fill="white"/><path d="M59.7333 81.3335C61.5353 81.3335 63 79.8688 63 78.0668C63 76.2649 61.5353 74.8002 59.7333 74.8002C57.9313 74.8002 56.4666 76.2649 56.4666 78.0668C56.4666 79.8688 57.9313 81.3335 59.7333 81.3335Z" fill="white"/><path d="M49.5334 74.1335C51.3354 74.1335 52.8001 72.6688 52.8001 70.8669C52.8001 69.0649 51.3354 67.6002 49.5334 67.6002C47.7315 67.6002 46.2667 69.0649 46.2667 70.8669C46.2667 72.6688 47.7315 74.1335 49.5334 74.1335Z" fill="white"/><path d="M47.0667 59.2002C48.8686 59.2002 50.3333 57.7355 50.3333 55.9335C50.3333 54.1316 48.8686 52.6669 47.0667 52.6669C45.2647 52.6669 43.8 54.1316 43.8 55.9335C43.8 57.7355 45.2647 59.2002 47.0667 59.2002Z" fill="white"/></svg>`,
  
  pancakeswap: `<svg viewBox="0 0 128 128" fill="none"><path d="M64 100.334C84.3667 100.334 100.833 83.8675 100.833 63.5008C100.833 43.1341 84.3667 26.6675 64 26.6675C43.6333 26.6675 27.1667 43.1341 27.1667 63.5008C27.1667 83.8675 43.6333 100.334 64 100.334Z" fill="#1FC7D4"/><path d="M47.5 42.3333C47.5 49.6983 53.0683 55.6667 60 55.6667C53.0683 55.6667 47.5 61.635 47.5 69C47.5 61.635 41.935 55.6667 35 55.6667C41.935 55.6667 47.5 49.6983 47.5 42.3333Z" fill="white"/><path d="M68.3334 57.6667C68.3334 65.0317 73.9017 71 80.8334 71C73.9017 71 68.3334 76.9683 68.3334 84.3333C68.3334 76.9683 62.765 71 55.8334 71C62.765 71 68.3334 65.0317 68.3334 57.6667Z" fill="white"/></svg>`,
  
  curve: `<svg viewBox="0 0 128 128" fill="none"><rect x="30" y="30" width="68" height="68" rx="34" fill="#A5A4CE"/><path fill-rule="evenodd" clip-rule="evenodd" d="M64 83.5C75.0457 83.5 84 74.5457 84 63.5C84 52.4543 75.0457 43.5 64 43.5C52.9543 43.5 44 52.4543 44 63.5C44 74.5457 52.9543 83.5 64 83.5ZM64 89.5C78.3594 89.5 90 77.8594 90 63.5C90 49.1406 78.3594 37.5 64 37.5C49.6406 37.5 38 49.1406 38 63.5C38 77.8594 49.6406 89.5 64 89.5Z" fill="white"/></svg>`,
  
  sushiswap: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#FA52A0"/><path d="M64 78C72.2843 78 79 71.2843 79 63C79 54.7157 72.2843 48 64 48C55.7157 48 49 54.7157 49 63C49 71.2843 55.7157 78 64 78Z" fill="white"/><path d="M61 57C62.1046 57 63 56.1046 63 55C63 53.8954 62.1046 53 61 53C59.8954 53 59 53.8954 59 55C59 56.1046 59.8954 57 61 57Z" fill="#FA52A0"/><path d="M67 57C68.1046 57 69 56.1046 69 55C69 53.8954 68.1046 53 67 53C65.8954 53 65 53.8954 65 55C65 56.1046 65.8954 57 67 57Z" fill="#FA52A0"/><path d="M64 69C60.6863 69 58 66.7614 58 64H70C70 66.7614 67.3137 69 64 69Z" fill="#FA52A0"/></svg>`,
  
  raydium: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#2D46B9"/><path d="M79.7 52.5L64 45L48.3 52.5L64 60L79.7 52.5Z" fill="white"/><path d="M48.3 52.5V75.5L64 83L79.7 75.5V52.5L64 60V83" stroke="white" stroke-width="3"/></svg>`,
  
  aave: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#B6509E"/><path d="M49.5 76H44L61 44.5L78 76H72.5L61 54.5L49.5 76Z" fill="white"/><path d="M53.5 67.5H68.5L72.5 76H47.5L53.5 67.5Z" fill="white"/></svg>`,
  
  opensea: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#2081E2"/><path d="M38 64C38 49.6406 49.6406 38 64 38C78.3594 38 90 49.6406 90 64C90 78.3594 78.3594 90 64 90C49.6406 90 38 78.3594 38 64Z" fill="#2081E2"/><path d="M66.7 71.3L60.4 80.6C60.2 80.9 59.8 81 59.5 80.8L45.2 71.6C45 71.5 44.9 71.3 44.9 71.1V51.3C44.9 51 45.1 50.7 45.5 50.7L59.6 54.5C59.8 54.6 60 54.8 60 55V63.3L66.4 70.6C66.8 70.8 66.9 71.1 66.7 71.3Z" fill="white"/><path d="M83.9 67.2V74.6C83.9 74.9 83.7 75.2 83.4 75.3L69.7 80.7C69.6 80.7 69.6 80.7 69.5 80.7C69.3 80.7 69 80.6 68.9 80.4L61.3 68.8C61.2 68.6 61.2 68.4 61.3 68.2C61.4 68 61.6 67.9 61.8 67.9H71.4L83.4 67C83.7 67 83.9 67.1 83.9 67.2Z" fill="white"/><path d="M82.9 50.7L70 56.6C69.8 56.7 69.6 56.9 69.6 57.1V66.7C69.6 67 69.9 67.2 70.2 67.1L83 63.1C83.3 63 83.5 62.8 83.5 62.5V51.2C83.5 51 83.4 50.8 83.2 50.7C83.1 50.6 83 50.6 82.9 50.7Z" fill="white"/></svg>`,
  
  metamask: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#F6851B"/><path d="M64 87.5L54 80.5L56.5 88L52 92H76L71.5 88L74 80.5L64 87.5Z" fill="#CDBDB2"/><path d="M83 55L85.5 43.5L81 33H47L42.5 43.5L45 55L43 59L45 60L43 62L45 63.5L43 66L45.5 68L48 75.5L59.5 72L68.5 72L80 75.5L83 68L85.5 66L83.5 63.5L85.5 62L83.5 60L85.5 59L83 55Z" fill="#E4761B"/><path d="M59.5 72L48 75.5L54 80.5L64 87.5L74 80.5L80 75.5L68.5 72H59.5Z" fill="#E4761B"/><path d="M85.5 43.5L64 51L66.5 38.5H81L85.5 43.5Z" fill="#763D16"/><path d="M47 33L61.5 38.5L64 51L42.5 43.5L47 33Z" fill="#763D16"/><path d="M47 33H81L77.5 43.5H50.5L47 33Z" fill="#F6851B"/><path d="M64 51L65.5 62H62.5L64 51Z" fill="#E2761B"/></svg>`,
  
  phantom: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#AB9FF2"/><path d="M87.3333 50.6667H40.6666C39.1939 50.6667 38 51.8605 38 53.3333V74.6667C38 76.1394 39.1939 77.3333 40.6666 77.3333H87.3333C88.8061 77.3333 90 76.1394 90 74.6667V53.3333C90 51.8605 88.8061 50.6667 87.3333 50.6667Z" fill="url(#paint0_phantom)"/><path d="M71.3334 64.0001C71.3334 68.4184 67.7517 72.0001 63.3334 72.0001C58.9151 72.0001 55.3334 68.4184 55.3334 64.0001C55.3334 59.5818 58.9151 56.0001 63.3334 56.0001C67.7517 56.0001 71.3334 59.5818 71.3334 64.0001Z" fill="white"/><defs><linearGradient id="paint0_phantom" x1="38" y1="64.0001" x2="90" y2="64.0001" gradientUnits="userSpaceOnUse"><stop stop-color="#534BB1"/><stop offset="1" stop-color="#551BF9"/></linearGradient></defs></svg>`,

  chainlink: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#375BD2"/><path d="M64 92L76.5 85V71L64 78L51.5 71V85L64 92Z" fill="white"/><path d="M64 36L51.5 43V57L64 50L76.5 57V43L64 36Z" fill="white"/><path d="M51.5 57L39 64L51.5 71L64 64L51.5 57Z" fill="white"/><path d="M76.5 57L64 64L76.5 71L89 64L76.5 57Z" fill="white"/></svg>`,
  
  axieinfinity: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#29B6AF"/><path d="M75.5 60C75.5 56.7 78.2 54 81.5 54C84.8 54 87.5 56.7 87.5 60C87.5 63.3 84.8 66 81.5 66C78.2 66 75.5 63.3 75.5 60Z" fill="white"/><path d="M79.5 60C79.5 58.9 80.4 58 81.5 58C82.6 58 83.5 58.9 83.5 60C83.5 61.1 82.6 62 81.5 62C80.4 62 79.5 61.1 79.5 60Z" fill="#29B6AF"/><path d="M66 82.5C66 79.2 68.7 76.5 72 76.5C75.3 76.5 78 79.2 78 82.5C78 85.8 75.3 88.5 72 88.5C68.7 88.5 66 85.8 66 82.5Z" fill="white"/><path d="M70 82.5C70 81.4 70.9 80.5 72 80.5C73.1 80.5 74 81.4 74 82.5C74 83.6 73.1 84.5 72 84.5C70.9 84.5 70 83.6 70 82.5Z" fill="#29B6AF"/><path d="M40.5 60C40.5 56.7 43.2 54 46.5 54C49.8 54 52.5 56.7 52.5 60C52.5 63.3 49.8 66 46.5 66C43.2 66 40.5 63.3 40.5 60Z" fill="white"/><path d="M44.5 60C44.5 58.9 45.4 58 46.5 58C47.6 58 48.5 58.9 48.5 60C48.5 61.1 47.6 62 46.5 62C45.4 62 44.5 61.1 44.5 60Z" fill="#29B6AF"/><path d="M50 82.5C50 79.2 52.7 76.5 56 76.5C59.3 76.5 62 79.2 62 82.5C62 85.8 59.3 88.5 56 88.5C52.7 88.5 50 85.8 50 82.5Z" fill="white"/><path d="M54 82.5C54 81.4 54.9 80.5 56 80.5C57.1 80.5 58 81.4 58 82.5C58 83.6 57.1 84.5 56 84.5C54.9 84.5 54 83.6 54 82.5Z" fill="#29B6AF"/><path d="M47 47C47 43.7 49.7 41 53 41H75C78.3 41 81 43.7 81 47V68C81 75.7 74.7 82 67 82H61C53.3 82 47 75.7 47 68V47Z" fill="white"/><path d="M50 47C50 45.3 51.3 44 53 44H75C76.7 44 78 45.3 78 47V68C78 74 73 79 67 79H61C55 79 50 74 50 68V47Z" fill="#29B6AF"/></svg>`, 

  sandbox: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#3065DE"/><path d="M64 36L88 48V72L64 84L40 72V48L64 36Z" fill="url(#paint0_sandbox)"/><path d="M64 62L76 56V44L64 50L52 44V56L64 62Z" fill="white"/><path d="M64 76L76 70V58L64 64L52 58V70L64 76Z" fill="white"/><defs><linearGradient id="paint0_sandbox" x1="41" y1="38" x2="85" y2="84" gradientUnits="userSpaceOnUse"><stop stop-color="#3065DE"/><stop offset="0.5" stop-color="#05BBC9"/><stop offset="1" stop-color="#00E28D"/></linearGradient></defs></svg>`,

  blur: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#FF5E00"/><path d="M64 43L74 64L64 85L54 64L64 43Z" fill="white"/></svg>`,

  default: `<svg viewBox="0 0 128 128" fill="none"><circle cx="64" cy="64" r="38" fill="#CBD5E1"/><path d="M64 89.5C78.0833 89.5 89.5 78.0833 89.5 64C89.5 49.9167 78.0833 38.5 64 38.5C49.9167 38.5 38.5 49.9167 38.5 64C38.5 78.0833 49.9167 89.5 64 89.5Z" stroke="#94A3B8" stroke-width="5"/><path d="M74.5 55.5C74.5 61.3333 69.8333 66 64 66C58.1667 66 53.5 61.3333 53.5 55.5C53.5 49.6667 58.1667 45 64 45C69.8333 45 74.5 49.6667 74.5 55.5Z" stroke="#94A3B8" stroke-width="5"/><path d="M44 87C44 78.7333 50.7333 72 59 72H69C77.2667 72 84 78.7333 84 87" stroke="#94A3B8" stroke-width="5"/></svg>`
};

// Web3 应用官方LOGO真实图片URL
const appLogoUrls: Record<string, string> = {
  uniswap: "https://cryptologos.cc/logos/uniswap-uni-logo.svg?v=029",
  pancakeswap: "https://cryptologos.cc/logos/pancakeswap-cake-logo.svg?v=029",
  curve: "https://cryptologos.cc/logos/curve-dao-token-crv-logo.svg?v=029",
  sushiswap: "https://cryptologos.cc/logos/sushiswap-sushi-logo.svg?v=029",
  raydium: "https://cryptologos.cc/logos/raydium-ray-logo.svg?v=029",
  aave: "https://cryptologos.cc/logos/aave-aave-logo.svg?v=029",
  compound: "https://cryptologos.cc/logos/compound-comp-logo.svg?v=029",
  makerdao: "https://cryptologos.cc/logos/maker-mkr-logo.svg?v=029",
  lido: "https://cryptologos.cc/logos/lido-dao-ldo-logo.svg?v=029",
  opensea: "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.svg",
  blur: "https://storage.opensea.io/files/1d0238b2671e69ff1460529d23b2c299.png",
  magiceden: "https://staratlas.com/images/partner-magiceden.svg",
  axieinfinity: "https://cryptologos.cc/logos/axie-infinity-axs-logo.svg?v=029",
  sandbox: "https://cryptologos.cc/logos/the-sandbox-sand-logo.svg?v=029",
  stepn: "https://cryptologos.cc/logos/stepn-gmt-logo.svg?v=029",
  gala: "https://cryptologos.cc/logos/gala-gala-logo.svg?v=029",
  metamask: "https://seeklogo.com/images/M/metamask-logo-09EDE53DBD-seeklogo.com.png",
  phantom: "https://cdn.jsdelivr.net/gh/phantom-labs/assets/logo-no-shadow.svg",
  wallet_connect: "https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png",
  chainlink: "https://cryptologos.cc/logos/chainlink-link-logo.svg?v=029",
  the_graph: "https://cryptologos.cc/logos/the-graph-grt-logo.svg?v=029",
  dydx: "https://cryptologos.cc/logos/dydx-dydx-logo.svg?v=029",
  gmx: "https://cryptologos.cc/logos/gmx-gmx-logo.svg?v=029",
  alchemix: "https://s2.coinmarketcap.com/static/img/coins/200x200/14364.png",
  euler: "https://s2.coinmarketcap.com/static/img/coins/200x200/19913.png",
  venus: "https://cryptologos.cc/logos/venus-xvs-logo.svg?v=029",
  foundation: "https://pbs.twimg.com/profile_images/1415274313636712449/zXDEYp-V_400x400.jpg",
  sudoswap: "https://sudoswap.xyz/favicon.png",
  element: "https://pbs.twimg.com/profile_images/1549739145416941569/Pz0GbMZ3_400x400.jpg",
  illuvium: "https://cryptologos.cc/logos/illuvium-ilv-logo.svg?v=029",
  splinterlands: "https://d36mxiodymuqjm.cloudfront.net/website/icons/512/splinterlands-logo.png",
  bigtime: "https://d2qfvg9oqjucl2.cloudfront.net/store/logo/big-time-logo.webp",
  traderjoe: "https://cryptologos.cc/logos/trader-joe-joe-logo.svg?v=029"
};

// 替代URL，用于无法访问的情况
const fallbackLogoUrls: Record<string, string> = {
  opensea: "https://storage.googleapis.com/opensea-static/Logomark/Logomark-Blue.png",
  blur: "https://pbs.twimg.com/profile_images/1593789199617536001/jt7WVuOh_400x400.jpg",
  magiceden: "https://pbs.twimg.com/profile_images/1568362506740543501/vMLwWXK-_400x400.jpg",
  metamask: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
  phantom: "https://play-lh.googleusercontent.com/mbc4b6MnM0N0hl-9H5y6N0eJDK1SKd0yhIRaYUmwIJpgk2F5CEUfYgS4yBdR7MkTXQ=w240-h480-rw",
  wallet_connect: "https://avatars.githubusercontent.com/u/37784886",
  foundation: "https://pbs.twimg.com/profile_images/1415274313636712449/zXDEYp-V_400x400.jpg",
  sudoswap: "https://pbs.twimg.com/profile_images/1526942918403039232/zZHXj4Ba_400x400.jpg",
  element: "https://pbs.twimg.com/profile_images/1616061893577924609/fW_Xbzgo_400x400.jpg", 
  bigtime: "https://bigtime.gg/images/social-card.png"
};

// Web3 应用数据
const web3Apps = {
  dex: [
    {
      id: "uniswap",
      name: "Uniswap",
      description: "去中心化交易协议",
      logo: "/web3/uniswap.png",
      url: "https://app.uniswap.org",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#FF007A",
      heat: 98,
      downloads: "1200万+"
    },
    {
      id: "pancakeswap",
      name: "PancakeSwap",
      description: "BSC上领先的DEX",
      logo: "/web3/pancakeswap.png",
      url: "https://pancakeswap.finance",
      chain: ["bsc", "ethereum", "polygon"],
      color: "#1FC7D4",
      heat: 92,
      downloads: "850万+"
    },
    {
      id: "curve",
      name: "Curve",
      description: "稳定币交易平台",
      logo: "/web3/curve.png",
      url: "https://curve.fi",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#A5A4CE",
      heat: 85,
      downloads: "420万+"
    },
    {
      id: "sushiswap",
      name: "SushiSwap",
      description: "多链去中心化交易所",
      logo: "/web3/sushi.png",
      url: "https://www.sushi.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
      color: "#FA52A0",
      heat: 82,
      downloads: "380万+"
    },
    {
      id: "raydium",
      name: "Raydium",
      description: "Solana自动做市商",
      logo: "/web3/raydium.png",
      url: "https://raydium.io",
      chain: ["solana"],
      color: "#2D46B9",
      heat: 79,
      downloads: "280万+"
    },
    {
      id: "traderjoe",
      name: "Trader Joe",
      description: "Avalanche上的DEX",
      logo: "/web3/traderjoe.png",
      url: "https://traderjoexyz.com",
      chain: ["avalanche", "ethereum", "arbitrum"],
      color: "#FF6B4A",
      heat: 74,
      downloads: "240万+"
    },
    {
      id: "dydx",
      name: "dYdX",
      description: "去中心化衍生品交易",
      logo: "/web3/dydx.png",
      url: "https://dydx.exchange",
      chain: ["ethereum"],
      color: "#6966FF",
      heat: 81,
      downloads: "320万+"
    },
    {
      id: "gmx",
      name: "GMX",
      description: "永续交易平台",
      logo: "/web3/gmx.png",
      url: "https://gmx.io",
      chain: ["arbitrum", "avalanche"],
      color: "#1E99A0",
      heat: 77,
      downloads: "260万+"
    }
  ],
  lending: [
    {
      id: "aave",
      name: "Aave",
      description: "去中心化借贷协议",
      logo: "/web3/aave.png",
      url: "https://app.aave.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#B6509E",
      heat: 90,
      downloads: "720万+"
    },
    {
      id: "compound",
      name: "Compound",
      description: "算法货币市场",
      logo: "/web3/compound.png",
      url: "https://app.compound.finance",
      chain: ["ethereum"],
      color: "#00D395",
      heat: 86,
      downloads: "450万+"
    },
    {
      id: "makerdao",
      name: "MakerDAO",
      description: "DAI稳定币发行平台",
      logo: "/web3/maker.png",
      url: "https://oasis.app",
      chain: ["ethereum"],
      color: "#1AAB9B",
      heat: 84,
      downloads: "410万+"
    },
    {
      id: "lido",
      name: "Lido",
      description: "流动性质押服务",
      logo: "/web3/lido.png",
      url: "https://lido.fi",
      chain: ["ethereum", "solana", "polygon"],
      color: "#00A3FF",
      heat: 89,
      downloads: "680万+"
    },
    {
      id: "alchemix",
      name: "Alchemix",
      description: "自偿还贷款",
      logo: "/web3/alchemix.png",
      url: "https://alchemix.fi",
      chain: ["ethereum"],
      color: "#2C6ACE",
      heat: 71,
      downloads: "180万+"
    },
    {
      id: "euler",
      name: "Euler",
      description: "可定制货币市场",
      logo: "/web3/euler.png",
      url: "https://euler.finance",
      chain: ["ethereum"],
      color: "#1A4DE3",
      heat: 69,
      downloads: "160万+"
    },
    {
      id: "venus",
      name: "Venus",
      description: "BSC货币市场",
      logo: "/web3/venus.png",
      url: "https://venus.io",
      chain: ["bsc"],
      color: "#FFC670",
      heat: 76,
      downloads: "250万+"
    }
  ],
  nft: [
    {
      id: "opensea",
      name: "OpenSea",
      description: "最大的NFT交易市场",
      logo: "/web3/opensea.png",
      url: "https://opensea.io",
      chain: ["ethereum", "polygon", "solana"],
      color: "#2081E2",
      heat: 94,
      downloads: "950万+"
    },
    {
      id: "blur",
      name: "Blur",
      description: "专业NFT交易平台",
      logo: "/web3/blur.png",
      url: "https://blur.io",
      chain: ["ethereum"],
      color: "#FF5E00",
      heat: 85,
      downloads: "420万+"
    },
    {
      id: "magiceden",
      name: "Magic Eden",
      description: "多链NFT市场",
      logo: "/web3/magiceden.png",
      url: "https://magiceden.io",
      chain: ["solana", "ethereum", "polygon"],
      color: "#E42575",
      heat: 83,
      downloads: "380万+"
    },
    {
      id: "foundation",
      name: "Foundation",
      description: "创意型NFT平台",
      logo: "/web3/foundation.png",
      url: "https://foundation.app",
      chain: ["ethereum"],
      color: "#000000",
      heat: 72,
      downloads: "180万+"
    },
    {
      id: "sudoswap",
      name: "Sudoswap",
      description: "NFT流动性协议",
      logo: "/web3/sudoswap.png",
      url: "https://sudoswap.xyz",
      chain: ["ethereum"],
      color: "#4A4A4A",
      heat: 68,
      downloads: "150万+"
    },
    {
      id: "element",
      name: "Element",
      description: "NFT抵押市场",
      logo: "/web3/element.png",
      url: "https://element.market",
      chain: ["ethereum", "bsc"],
      color: "#4775E7",
      heat: 70,
      downloads: "170万+"
    }
  ],
  gaming: [
    {
      id: "axieinfinity",
      name: "Axie Infinity",
      description: "NFT游戏平台",
      logo: "/web3/axie.png",
      url: "https://axieinfinity.com",
      chain: ["ronin"],
      color: "#29B6AF",
      heat: 87,
      downloads: "580万+"
    },
    {
      id: "sandbox",
      name: "The Sandbox",
      description: "元宇宙游戏平台",
      logo: "/web3/sandbox.png",
      url: "https://www.sandbox.game",
      chain: ["ethereum"],
      color: "#3065DE",
      heat: 82,
      downloads: "340万+"
    },
    {
      id: "stepn",
      name: "STEPN",
      description: "移动健身赚钱应用",
      logo: "/web3/stepn.png",
      url: "https://stepn.com",
      chain: ["solana", "bsc"],
      color: "#82E8BB",
      heat: 78,
      downloads: "280万+"
    },
    {
      id: "illuvium",
      name: "Illuvium",
      description: "开放世界RPG游戏",
      logo: "/web3/illuvium.png",
      url: "https://illuvium.io",
      chain: ["ethereum"],
      color: "#FF2D55",
      heat: 75,
      downloads: "230万+"
    },
    {
      id: "gala",
      name: "Gala Games",
      description: "区块链游戏平台",
      logo: "/web3/gala.png",
      url: "https://gala.games",
      chain: ["ethereum", "bsc"],
      color: "#FFD633",
      heat: 73,
      downloads: "220万+"
    },
    {
      id: "splinterlands",
      name: "Splinterlands",
      description: "NFT卡牌游戏",
      logo: "/web3/splinterlands.png",
      url: "https://splinterlands.com",
      chain: ["hive", "wax"],
      color: "#FA8728",
      heat: 71,
      downloads: "180万+"
    },
    {
      id: "bigtime",
      name: "Big Time",
      description: "多人动作RPG",
      logo: "/web3/bigtime.png",
      url: "https://bigtime.gg",
      chain: ["ethereum"],
      color: "#6037FF",
      heat: 76,
      downloads: "240万+"
    }
  ],
  infra: [
    {
      id: "metamask",
      name: "MetaMask",
      description: "以太坊钱包与浏览器",
      logo: "/web3/metamask.png",
      url: "https://metamask.io",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#F6851B",
      heat: 99,
      downloads: "3000万+"
    },
    {
      id: "phantom",
      name: "Phantom",
      description: "Solana钱包",
      logo: "/web3/phantom.png",
      url: "https://phantom.app",
      chain: ["solana", "ethereum"],
      color: "#AB9FF2",
      heat: 93,
      downloads: "800万+"
    },
    {
      id: "wallet_connect",
      name: "WalletConnect",
      description: "钱包连接协议",
      logo: "/web3/walletconnect.png",
      url: "https://walletconnect.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism", "solana"],
      color: "#3B99FC",
      heat: 91,
      downloads: "750万+"
    },
    {
      id: "chainlink",
      name: "Chainlink",
      description: "区块链预言机网络",
      logo: "/web3/chainlink.png",
      url: "https://chain.link",
      chain: ["ethereum", "polygon", "arbitrum", "optimism", "bsc"],
      color: "#375BD2",
      heat: 88,
      downloads: "600万+"
    },
    {
      id: "the_graph",
      name: "The Graph",
      description: "区块链索引协议",
      logo: "/web3/thegraph.png",
      url: "https://thegraph.com",
      chain: ["ethereum", "polygon", "arbitrum", "optimism"],
      color: "#6747ED",
      heat: 81,
      downloads: "320万+"
    }
  ]
}

// 前30个热门应用
const getTopApps = (count = 30) => {
  // 合并所有分类的应用并按热度排序
  const allApps = Object.values(web3Apps).flat();
  return allApps.sort((a, b) => b.heat - a.heat).slice(0, count);
};

// 分类对应的颜色和图标
const categoryStyles = {
  hot: { bgColor: "bg-gradient-to-r from-pink-500/20 to-rose-500/20", textColor: "text-rose-500", borderColor: "border-rose-500/30" },
  dex: { bgColor: "bg-gradient-to-r from-blue-500/20 to-indigo-500/20", textColor: "text-blue-500", borderColor: "border-blue-500/30" },
  lending: { bgColor: "bg-gradient-to-r from-purple-500/20 to-violet-500/20", textColor: "text-purple-500", borderColor: "border-purple-500/30" },
  nft: { bgColor: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", textColor: "text-amber-500", borderColor: "border-amber-500/30" },
  gaming: { bgColor: "bg-gradient-to-r from-green-500/20 to-emerald-500/20", textColor: "text-green-500", borderColor: "border-green-500/30" },
  infra: { bgColor: "bg-gradient-to-r from-cyan-500/20 to-teal-500/20", textColor: "text-cyan-500", borderColor: "border-cyan-500/30" }
};

interface ChainBadgeProps {
  chain: string
}

// 链标识组件
function ChainBadge({ chain }: ChainBadgeProps) {
  const chainColors: Record<string, string> = {
    ethereum: "#627EEA",
    polygon: "#8247E5",
    arbitrum: "#28A0F0",
    optimism: "#FF0420",
    bsc: "#F0B90B",
    solana: "#14F195",
    ronin: "#1A1E25",
    avalanche: "#E84142",
    hive: "#E31337",
    wax: "#F89022"
  }

  const chainName: Record<string, string> = {
    ethereum: "ETH",
    polygon: "MATIC",
    arbitrum: "ARB",
    optimism: "OP",
    bsc: "BSC",
    solana: "SOL",
    ronin: "RON",
    avalanche: "AVAX",
    hive: "HIVE",
    wax: "WAX"
  }

  return (
    <span 
      className="inline-flex items-center px-2 py-0.5 text-xs rounded-full"
      style={{ 
        backgroundColor: `${chainColors[chain]}20`, 
        color: chainColors[chain],
        border: `1px solid ${chainColors[chain]}30`
      }}
    >
      {chainName[chain]}
    </span>
  )
}

export default function DiscoverPage() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  const [category, setCategory] = useState("hot")
  const [searchQuery, setSearchQuery] = useState("")
  const topApps = getTopApps(30);
  const [scrolled, setScrolled] = useState(false)

  // 处理滚动效果
  typeof window !== 'undefined' && window.addEventListener('scroll', () => {
    setScrolled(window.scrollY > 20)
  })

  // 处理应用点击
  const handleAppClick = (url: string) => {
    window.open(url, "_blank")
  }

  // 筛选应用
  const getFilteredApps = () => {
    if (category === "hot") {
      return topApps.filter(app => 
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        app.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return web3Apps[category as keyof typeof web3Apps]?.filter(app => 
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      app.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
  }

  const filteredApps = getFilteredApps();
  const currentCategoryStyle = categoryStyles[category as keyof typeof categoryStyles];

  return (
    <div className={cn(
      "min-h-screen pb-16",
      isDark ? "bg-[#0b101a] text-white" : "bg-gray-50 text-gray-900"
    )}>
      <EthereumProtection />
      
      {/* 搜索框 - 固定在顶部 */}
      <div className={cn(
        "sticky top-0 z-10 py-4 px-3 transition-all duration-300",
        scrolled ? (isDark ? "bg-[#0b101a]/90 backdrop-blur-sm" : "bg-white/90 backdrop-blur-sm") : "bg-transparent"
      )}>
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="搜索Web3应用..."
              className={cn(
                "pl-12 pr-4 py-7 h-12 rounded-xl shadow-sm text-base",
                "transition-all duration-200 border-opacity-80",
                "focus:ring-2 focus:ring-primary/30 focus:border-primary/60",
                isDark 
                  ? "bg-gray-800/90 border-gray-700/80 text-white" 
                  : "bg-white border-gray-200 text-gray-900"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto pb-20 px-3 pt-4">
        {/* 标题栏 */}
        <div className="flex justify-between items-center mb-4">
          <h1 className={cn("text-lg font-bold", isDark ? "text-white" : "text-gray-800")}>发现Web3应用</h1>
          <div className={cn("text-xs", isDark ? "text-gray-400" : "text-gray-500")}>
            已收录 {filteredApps.length} 个应用
          </div>
        </div>
        
        {/* 分类选项卡 - 水平滚动 */}
        <div className="mt-4 mb-5">
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setCategory("hot")}
              className={cn(
                "flex items-center space-x-1 py-2 px-5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200",
                category === "hot" 
                  ? "bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-sm" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <TrendingUp className="w-4 h-4 mr-1.5" />
              <span>热门</span>
            </button>
            
            <button
              onClick={() => setCategory("dex")}
              className={cn(
                "flex items-center py-2 px-5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200",
                category === "dex" 
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-sm" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              交易所
            </button>
            
            <button
              onClick={() => setCategory("lending")}
              className={cn(
                "flex items-center py-2 px-5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200",
                category === "lending" 
                  ? "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-sm" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 4V20M5 12H19M19 8C19 4.13401 15.866 1 12 1C8.13401 1 5 4.13401 5 8" stroke="currentColor" strokeWidth="2"/>
              </svg>
              借贷
            </button>
            
            <button
              onClick={() => setCategory("nft")}
              className={cn(
                "flex items-center py-2 px-5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200",
                category === "nft" 
                  ? "bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-sm" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 8.5L12 2L21 8.5V19.5L12 22L3 19.5V8.5Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              NFT
            </button>
            
            <button
              onClick={() => setCategory("gaming")}
              className={cn(
                "flex items-center py-2 px-5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200",
                category === "gaming" 
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-sm" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12H14M12 10V14M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2"/>
              </svg>
              游戏
            </button>
            
            <button
              onClick={() => setCategory("infra")}
              className={cn(
                "flex items-center py-2 px-5 rounded-xl whitespace-nowrap text-sm font-medium transition-all duration-200",
                category === "infra" 
                  ? "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white shadow-sm" 
                  : isDark 
                    ? "bg-gray-800/80 text-gray-300 hover:bg-gray-700/80" 
                    : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
              )}
            >
              <svg className="w-4 h-4 mr-1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 15L12 3M12 15L8 11M12 15L16 11M5 21H19" stroke="currentColor" strokeWidth="2"/>
              </svg>
              基础设施
            </button>
          </div>
        </div>
        
        {/* 轻量级统计栏 */}
        <div className={cn(
          "mb-5 p-3 rounded-xl grid grid-cols-3 gap-2",
          isDark ? "bg-gray-800/60" : "bg-white/90 border border-gray-200/60"
        )}>
          <div className="flex flex-col items-center p-2">
            <span className={cn("text-2xl font-bold", isDark ? "text-sky-400" : "text-sky-500")}>
              {filteredApps.length}
            </span>
            <span className="text-xs text-gray-400 mt-1">已收录</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className={cn("text-2xl font-bold", isDark ? "text-emerald-400" : "text-emerald-500")}>
              {category === "hot" ? 98 : 
               category === "dex" ? 92 : 
               category === "lending" ? 90 : 
               category === "nft" ? 94 : 85}
            </span>
            <span className="text-xs text-gray-400 mt-1">热度</span>
          </div>
          <div className="flex flex-col items-center p-2">
            <span className={cn("text-2xl font-bold", isDark ? "text-amber-400" : "text-amber-500")}>
              {30 + filteredApps.length}
            </span>
            <span className="text-xs text-gray-400 mt-1">链接</span>
          </div>
        </div>

        {/* 应用列表 */}
        <div className="space-y-3.5">
          {filteredApps.map((app) => (
            <div 
              key={app.id}
              className={cn(
                "flex items-center p-4 rounded-xl cursor-pointer transition-all",
                "hover:shadow-md hover:transform hover:scale-[1.01] hover:-translate-y-0.5",
                isDark 
                  ? "bg-gray-800/70 shadow-gray-900/20 border border-gray-700/40 hover:bg-gray-800/90 hover:border-gray-700/70" 
                  : "bg-white shadow-sm shadow-gray-100 border border-gray-200/80 hover:border-gray-300/90"
              )}
              onClick={() => handleAppClick(app.url)}
            >
              <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden shadow-sm mr-3.5" style={{ backgroundColor: `${app.color}20` }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 relative">
                    <img 
                      src={appLogoUrls[app.id] || `https://ui-avatars.com/api/?name=${app.name}&background=${app.color.replace('#', '')}&color=fff`}
                      alt={`${app.name} logo`}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      onError={(e) => {
                        // 如果主要URL加载失败，尝试备用URL
                        if (fallbackLogoUrls[app.id] && !e.currentTarget.src.includes(fallbackLogoUrls[app.id])) {
                          e.currentTarget.src = fallbackLogoUrls[app.id];
                        } else {
                          // 如果备用URL也失败，使用文本头像
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${app.name}&background=${app.color.replace('#', '')}&color=fff`;
                        }
                      }}
                    />
                  </div>
                </div>
                
                {/* 热度标签 - 只显示在热门类别 */}
                {category === "hot" && app.heat >= 85 && (
                  <div className={cn(
                    "absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white",
                    "shadow-sm shadow-black/10 border border-white/20",
                    "bg-gradient-to-br from-rose-500 to-orange-500"
                  )}>
                    {app.heat}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base tracking-tight">{app.name}</h3>
                  <div className={cn(
                    "text-xs px-1.5 py-0.5 rounded-md flex items-center",
                    currentCategoryStyle.textColor,
                    currentCategoryStyle.bgColor
                  )}>
                    <Zap className="w-3 h-3 mr-0.5" />
                    <span>{app.heat}</span>
                  </div>
                </div>
                
                <p className={cn("text-xs truncate mt-0.5", isDark ? "text-gray-400" : "text-gray-500")}>
                  {app.description}
                </p>
                
                <div className="flex items-center justify-between mt-2">
                  <div className="flex flex-wrap gap-1">
                    {app.chain.slice(0, 3).map((c) => (
                      <ChainBadge key={c} chain={c} />
                    ))}
                    {app.chain.length > 3 && (
                      <span className="inline-flex items-center px-1.5 text-xs text-gray-400">
                        +{app.chain.length - 3}
                      </span>
                    )}
                  </div>
                  
                  <div className={cn("text-xs flex items-center", isDark ? "text-gray-400" : "text-gray-500")}>
                    <Download className="w-3 h-3 mr-1" />
                    {app.downloads}
                  </div>
                </div>
              </div>
              
              <div className={cn(
                "ml-3 w-7 h-7 flex-shrink-0 rounded-full flex items-center justify-center",
                isDark ? "bg-gray-700/80" : "bg-gray-100/80"
              )}>
                <ExternalLink className={cn("w-3 h-3", isDark ? "text-gray-400" : "text-gray-500")} />
              </div>
            </div>
          ))}
        </div>

        {/* 无搜索结果 */}
        {filteredApps.length === 0 && (
          <div className={cn(
            "p-10 text-center rounded-xl mt-4",
            isDark ? "bg-gray-800/60" : "bg-white border border-gray-200/60"
          )}>
            <div className="flex justify-center mb-3">
              <Search className={cn("w-10 h-10", isDark ? "text-gray-600" : "text-gray-300")} />
            </div>
            <p className={cn("text-md font-medium", isDark ? "text-gray-300" : "text-gray-700")}>
              没有找到相关应用
            </p>
            <p className="text-sm text-gray-400 mt-1">
              尝试其他关键词搜索或更改分类
            </p>
          </div>
        )}
        
        {/* 回到顶部按钮 */}
        {scrolled && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn(
              "fixed bottom-20 right-4 w-10 h-10 rounded-full shadow-md flex items-center justify-center transition-all",
              isDark ? "bg-gray-800 text-gray-300" : "bg-white text-gray-700"
            )}
            aria-label="回到顶部"
            title="回到顶部"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
        )}
      </div>
      
      {/* 底部导航栏 */}
      <BottomNav currentTab="discover" isDark={isDark} />
    </div>
  )
} 