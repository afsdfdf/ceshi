"use client"

import React, { useState } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FallbackImageProps {
  src: string
  alt: string
  width: number
  height: number
  className?: string
  fallbackSrc?: string
  usePlaceholder?: boolean
}

export function FallbackImage({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc = "/placeholder-token.png",
  usePlaceholder = true
}: FallbackImageProps) {
  const [error, setError] = useState(false)

  // 处理图片加载错误
  const handleError = () => {
    console.log(`Image failed to load: ${src}`)
    setError(true)
  }

  // 如果图片加载失败且有设置使用占位符图片
  if (error && usePlaceholder) {
    return (
      <Image
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        className={className}
        unoptimized={true}
      />
    )
  }

  // 正常加载图片
  return (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
    />
  )
} 