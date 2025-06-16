"use client"

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'
import { CheckCircle, XCircle, AlertCircle, Smartphone, Monitor, Tablet } from 'lucide-react'

interface TestResult {
  name: string
  status: 'pass' | 'fail' | 'warning'
  message: string
  details?: string
}

export default function MobileNavTest() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [deviceInfo, setDeviceInfo] = useState<any>({})

  useEffect(() => {
    runTests()
  }, [])

  const runTests = () => {
    const results: TestResult[] = []
    
    // 检测设备信息
    const info = {
      userAgent: navigator.userAgent,
      screenWidth: screen.width,
      screenHeight: screen.height,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio,
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isAndroid: /Android/.test(navigator.userAgent),
      touchSupport: 'ontouchstart' in window
    }
    setDeviceInfo(info)

    // 测试1: 检查是否为移动设备
    if (info.isMobile || info.viewportWidth <= 768) {
      results.push({
        name: '移动设备检测',
        status: 'pass',
        message: '检测到移动设备或小屏幕',
        details: `屏幕宽度: ${info.viewportWidth}px`
      })
    } else {
      results.push({
        name: '移动设备检测',
        status: 'warning',
        message: '当前为桌面设备',
        details: '底部导航在桌面端默认隐藏'
      })
    }

    // 测试2: 检查底部导航元素是否存在
    const navElement = document.querySelector('.mobile-bottom-nav')
    if (navElement) {
      results.push({
        name: '导航元素存在性',
        status: 'pass',
        message: '底部导航元素已找到'
      })

      // 测试3: 检查导航元素的样式
      const styles = window.getComputedStyle(navElement)
      const isVisible = styles.display !== 'none' && styles.visibility !== 'hidden' && styles.opacity !== '0'
      
      if (isVisible) {
        results.push({
          name: '导航可见性',
          status: 'pass',
          message: '底部导航可见',
          details: `display: ${styles.display}, position: ${styles.position}, z-index: ${styles.zIndex}`
        })
      } else {
        results.push({
          name: '导航可见性',
          status: 'fail',
          message: '底部导航不可见',
          details: `display: ${styles.display}, visibility: ${styles.visibility}, opacity: ${styles.opacity}`
        })
      }

      // 测试4: 检查z-index
      const zIndex = parseInt(styles.zIndex) || 0
      if (zIndex >= 50) {
        results.push({
          name: 'Z-Index层级',
          status: 'pass',
          message: `Z-Index正常 (${zIndex})`
        })
      } else {
        results.push({
          name: 'Z-Index层级',
          status: 'warning',
          message: `Z-Index可能过低 (${zIndex})`,
          details: '可能被其他元素遮挡'
        })
      }

      // 测试5: 检查导航项数量
      const navItems = navElement.querySelectorAll('.mobile-nav-item')
      if (navItems.length === 5) {
        results.push({
          name: '导航项数量',
          status: 'pass',
          message: `找到${navItems.length}个导航项`
        })
      } else {
        results.push({
          name: '导航项数量',
          status: 'warning',
          message: `导航项数量异常: ${navItems.length}`
        })
      }

    } else {
      results.push({
        name: '导航元素存在性',
        status: 'fail',
        message: '未找到底部导航元素',
        details: '请检查BottomNav组件是否正确渲染'
      })
    }

    // 测试6: 检查CSS媒体查询
    const mediaQuery = window.matchMedia('(max-width: 768px)')
    if (mediaQuery.matches) {
      results.push({
        name: 'CSS媒体查询',
        status: 'pass',
        message: '媒体查询匹配移动端'
      })
    } else {
      results.push({
        name: 'CSS媒体查询',
        status: 'warning',
        message: '媒体查询不匹配移动端',
        details: '当前屏幕宽度超过768px'
      })
    }

    // 测试7: 检查触摸支持
    if (info.touchSupport) {
      results.push({
        name: '触摸支持',
        status: 'pass',
        message: '设备支持触摸操作'
      })
    } else {
      results.push({
        name: '触摸支持',
        status: 'warning',
        message: '设备不支持触摸操作',
        details: '可能为桌面设备'
      })
    }

    setTestResults(results)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'fail':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getDeviceIcon = () => {
    if (deviceInfo.isMobile) {
      return <Smartphone className="w-6 h-6" />
    } else if (deviceInfo.viewportWidth <= 1024) {
      return <Tablet className="w-6 h-6" />
    } else {
      return <Monitor className="w-6 h-6" />
    }
  }

  return (
    <div className={cn(
      "fixed top-4 right-4 w-80 max-h-96 overflow-y-auto",
      "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700",
      "rounded-lg shadow-lg p-4 z-[10000]",
      "text-sm"
    )}>
      <div className="flex items-center gap-2 mb-4">
        {getDeviceIcon()}
        <h3 className="font-semibold">移动端导航诊断</h3>
      </div>

      {/* 设备信息 */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded">
        <h4 className="font-medium mb-2">设备信息</h4>
        <div className="space-y-1 text-xs">
          <div>屏幕: {deviceInfo.screenWidth}×{deviceInfo.screenHeight}</div>
          <div>视口: {deviceInfo.viewportWidth}×{deviceInfo.viewportHeight}</div>
          <div>设备像素比: {deviceInfo.devicePixelRatio}</div>
          <div>移动设备: {deviceInfo.isMobile ? '是' : '否'}</div>
          <div>触摸支持: {deviceInfo.touchSupport ? '是' : '否'}</div>
        </div>
      </div>

      {/* 测试结果 */}
      <div className="space-y-3">
        <h4 className="font-medium">测试结果</h4>
        {testResults.map((result, index) => (
          <div key={index} className="flex items-start gap-2">
            {getStatusIcon(result.status)}
            <div className="flex-1">
              <div className="font-medium">{result.name}</div>
              <div className={cn(
                "text-xs",
                result.status === 'pass' && "text-green-600 dark:text-green-400",
                result.status === 'fail' && "text-red-600 dark:text-red-400",
                result.status === 'warning' && "text-yellow-600 dark:text-yellow-400"
              )}>
                {result.message}
              </div>
              {result.details && (
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {result.details}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 重新测试按钮 */}
      <button
        onClick={runTests}
        className="w-full mt-4 px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        重新测试
      </button>

      {/* 修复建议 */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
        <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">修复建议</h4>
        <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
          <div>• 确保在移动设备上访问</div>
          <div>• 检查浏览器开发者工具的移动模式</div>
          <div>• 清除浏览器缓存并刷新页面</div>
          <div>• 检查是否有其他元素遮挡导航栏</div>
        </div>
      </div>
    </div>
  )
} 