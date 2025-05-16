import React, { memo, CSSProperties } from "react";
import { RankTopic } from "@/app/types/token";

interface TopicSelectorProps {
  topics: RankTopic[];
  activeTopic: string;
  onChange: (topic: string) => void;
  darkMode: boolean;
  isTransitioning?: boolean;
}

/**
 * 主题选择器组件 - 固定宽度版
 */
function TopicSelector({
  topics, 
  activeTopic, 
  onChange,
  darkMode,
  isTransitioning = false
}: TopicSelectorProps) {
  // 基础样式
  const containerStyle: CSSProperties = {
    width: "100%",
    overflowX: "auto",
    paddingBottom: "4px",
    marginBottom: "4px",
    display: "flex",
    justifyContent: "center" // 居中显示
  };
  
  const topicsRowStyle: CSSProperties = {
    display: "inline-flex", // 使用inline-flex而不是flex
    flexWrap: "nowrap", // 禁止换行
    gap: "4px",
    padding: "4px",
    borderRadius: "16px",
    background: darkMode ? "#222" : "#f5f5f5",
    border: `1px solid ${darkMode ? "#333" : "#ddd"}`,
    minWidth: "max-content" // 确保容器宽度至少等于内容宽度
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
        ? (darkMode ? "#3f51b5" : "#2563eb") 
        : "transparent",
      color: isActive 
        ? "#fff" 
        : (darkMode ? "#aaa" : "#666"),
      minWidth: "auto" // 确保按钮不会被压缩
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
    <div style={containerStyle}>
      <div style={topicsRowStyle}>
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