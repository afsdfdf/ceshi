"use client"

import { useTheme } from "next-themes"
import { BannerItem } from "./Banner"
import { cn } from "@/lib/utils"

/**
 * 生成渐变背景的临时横幅组件
 * 注意：这只是临时解决方案，最终应替换为实际图片
 */
export function generateDefaultBanners(): BannerItem[] {
  return [
    {
      imageUrl: "/hf/hf.png",
      link: "https://t.me/xai_2024chinese",
      title: "加入XAI官方社区",
      description: "与社区成员一起探讨XAI的最新动态"
    },
    {
      imageUrl: "/hf/fx.png",
      link: "/discover",
      title: "发现新机会",
      description: "最新上线的代币和潜力项目"
    },
    {
      imageUrl: "/hf/sh.png",
      link: "/forum",
      title: "参与社区讨论",
      description: "与其他投资者交流加密货币投资心得"
    }
  ];
}

/**
 * 为不同主题提供不同样式的横幅
 */
export function useThemedBanners(): BannerItem[] {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // 特定的第一个横幅（Telegram链接）
  const telegramBanner = {
    imageUrl: "/hf/hf.png",
    link: "https://t.me/xai_2024chinese",
    title: "加入XAI官方社区",
    description: "与社区成员一起探讨XAI的最新动态"
  };
  
  // 发现新机会横幅
  const discoverBanner = {
    imageUrl: "/hf/fx.png",
    link: "/discover",
    title: "发现新机会",
    description: "最新上线的代币和潜力项目"
  };
  
  // 社区讨论横幅
  const forumBanner = {
    imageUrl: "/hf/sh.png",
    link: "/forum",
    title: "参与社区讨论",
    description: "与其他投资者交流加密货币投资心得"
  };
  
  // 根据主题选择不同的横幅样式
  if (isDark) {
    const darkBanners = generateDefaultBanners();
    // 确保第一个是Telegram横幅
    darkBanners[0] = telegramBanner;
    return darkBanners;
  } else {
    // 浅色主题横幅
    return [
      telegramBanner,
      discoverBanner,
      forumBanner
    ];
  }
} 