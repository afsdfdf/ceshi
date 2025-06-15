import React, { memo, CSSProperties, useRef, useEffect } from "react";
import { RankTopic } from "@/app/types/token";

interface TopicSelectorProps {
  topics: RankTopic[];
  activeTopic: string;
  onChange: (topic: string) => void;
  darkMode: boolean;
  isTransitioning?: boolean;
}

/**
 * 主题选择器组件 - 修复滚动问题
 */
function TopicSelector({
  topics, 
  activeTopic, 
  onChange,
  darkMode,
  isTransitioning = false
}: TopicSelectorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const topicsRowRef = useRef<HTMLDivElement>(null);
  
  // 确保在组件挂载和激活标签变化时，滚动位置正确
  useEffect(() => {
    if (!containerRef.current || !topicsRowRef.current) return;
    
    // 找到活动主题按钮
    const activeButton = topicsRowRef.current.querySelector(`[data-topic-id="${activeTopic}"]`) as HTMLElement;
    if (!activeButton) return;
    
    // 计算滚动位置，确保活动按钮在视图中
    const containerWidth = containerRef.current.offsetWidth;
    const activeButtonLeft = activeButton.offsetLeft;
    const activeButtonWidth = activeButton.offsetWidth;
    
    // 如果是第一个标签，直接滚动到起始位置
    if (activeButtonLeft < 50) {
      containerRef.current.scrollLeft = 0;
    } else {
      // 否则将标签居中
      const scrollPosition = activeButtonLeft - (containerWidth / 2) + (activeButtonWidth / 2);
      containerRef.current.scrollLeft = Math.max(0, scrollPosition);
    }
  }, [activeTopic]);
  
  // 保证组件初始化时滚动到最左侧，确保第一个标签可见
  useEffect(() => {
    if (containerRef.current) {
      // 确保滚动位置为0，显示最左侧内容
      containerRef.current.scrollLeft = 0;
    }
  }, []);
  
  // 在组件挂载时添加自定义样式
  useEffect(() => {
    // 检查是否已经存在style元素
    const existingStyle = document.getElementById('topic-selector-style');
    if (!existingStyle) {
      // 创建style元素
      const style = document.createElement('style');
      style.id = 'topic-selector-style';
      style.innerHTML = `
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      // 组件卸载时如果没有其他使用此样式的组件，可以移除style元素
      // 此处为了安全，我们不移除style
    };
  }, []);
  
  // 基础样式
  const containerStyle: CSSProperties = {
    width: "100%",
    overflowX: "auto",
    paddingBottom: "4px",
    marginBottom: "4px",
    WebkitOverflowScrolling: "touch", // 改善移动设备上的滚动体验
    paddingLeft: "0", // 确保没有左侧内边距
    position: "relative" // 添加相对定位
  };
  
  const topicsRowStyle: CSSProperties = {
    display: "inline-flex", // 使用inline-flex使内容可滚动
    flexWrap: "nowrap", // 禁止换行
    gap: "4px",
    padding: "4px 8px", // 统一设置内边距
    borderRadius: "16px",
    background: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
    border: `1px solid ${darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
    minWidth: "max-content", // 确保容器宽度至少等于内容宽度
    boxSizing: "border-box", // 确保padding不会增加整体宽度
    backdropFilter: "blur(10px)"
  };
  
  // 渲染主题按钮
  const renderTopicButton = (topic: RankTopic) => {
    const isActive = topic.id === activeTopic;
    
    const buttonStyle: CSSProperties = {
      padding: "4px 10px",
      fontSize: "12px",
      borderRadius: "16px",
      whiteSpace: "nowrap", // 确保文本不换行
      fontWeight: "500",
      cursor: "pointer",
      border: "none",
      background: isActive 
        ? (darkMode ? "rgba(63, 81, 181, 0.8)" : "rgba(37, 99, 235, 0.8)") 
        : "transparent",
      color: isActive 
        ? "#fff" 
        : (darkMode ? "#aaa" : "#666"),
      minWidth: "auto", // 确保按钮不会被压缩
      backdropFilter: isActive ? "blur(10px)" : "none",
      transition: "all 0.2s ease"
    };
    
    const hotBadgeStyle: CSSProperties = {
      fontSize: "8px",
      padding: "1px 4px",
      marginLeft: "2px",
      borderRadius: "2px",
      background: isActive 
        ? "rgba(255, 255, 255, 0.3)" 
        : (darkMode ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"),
      color: isActive 
        ? "#fff" 
        : (darkMode ? "#ccc" : "#666")
    };
    
    return (
      <button
        key={topic.id}
        data-topic-id={topic.id}
        onClick={() => onChange(topic.id)}
        style={buttonStyle}
        disabled={isTransitioning}
      >
        {topic.name_zh}
        {topic.id === "hot" && (
          <span style={hotBadgeStyle}>
            HOT
          </span>
        )}
      </button>
    );
  };

  return (
    <div 
      ref={containerRef}
      className="hide-scrollbar"
      style={containerStyle}
    >
      <div ref={topicsRowRef} style={topicsRowStyle}>
        {topics.map((topic) => (
          <div key={topic.id} style={{display: "inline-block"}}>
            {renderTopicButton(topic)}
          </div>
        ))}
      </div>
    </div>
  );
} 

export default memo(TopicSelector); 