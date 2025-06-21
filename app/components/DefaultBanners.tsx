"use client"

import { useTheme } from "next-themes"
import { BannerItem } from "./Banner"
import { cn } from "@/lib/utils"

/**
 * 生成演示横幅组件
 * 使用网络图片或纯CSS绘制
 */
export function generateDefaultBanners(): BannerItem[] {
  return [
    {
      imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop&crop=center",
      link: "#demo1",
      title: "加密货币交易",
      description: "安全可靠的数字资产交易平台"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop&crop=center",
      link: "#demo2",
      title: "区块链技术",
      description: "探索去中心化金融的未来"
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop&crop=center",
      link: "#demo3",
      title: "数字钱包",
      description: "便捷的加密货币管理工具"
    }
  ];
}

/**
 * 为不同主题提供不同样式的横幅
 */
export function useThemedBanners(): BannerItem[] {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === "dark"
  
  // 根据主题选择不同的横幅
  if (isDark) {
    return [
      {
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop&crop=center&sat=-50",
        link: "#demo1",
        title: "暗色主题交易",
        description: "适合夜间使用的交易界面"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop&crop=center&sat=-50",
        link: "#demo2",
        title: "区块链探索",
        description: "深色模式下的技术展示"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop&crop=center&sat=-50",
        link: "#demo3",
        title: "数字资产管理",
        description: "专业的钱包管理界面"
      }
    ];
  } else {
    return [
      {
        imageUrl: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop&crop=center&brightness=110",
        link: "#demo1",
        title: "明亮主题交易",
        description: "清晰易读的交易界面"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=400&h=200&fit=crop&crop=center&brightness=110",
        link: "#demo2",
        title: "技术创新",
        description: "明亮模式下的技术展示"
      },
      {
        imageUrl: "https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=400&h=200&fit=crop&crop=center&brightness=110",
        link: "#demo3",
        title: "便捷管理",
        description: "用户友好的管理界面"
      }
    ];
  }
} 