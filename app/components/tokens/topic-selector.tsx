import React, { memo, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { RankTopic } from "@/app/types/token";
import { useTheme } from "next-themes";

interface TopicSelectorProps {
  topics: RankTopic[];
  activeTopic: string;
  onChange: (topic: string) => void;
  darkMode: boolean;
  isTransitioning?: boolean;
}

/**
 * 主题选择器组件
 */
function TopicSelector({
  topics, 
  activeTopic, 
  onChange,
  darkMode,
  isTransitioning = false
}: TopicSelectorProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark" || darkMode;
  const scrollRef = useRef<HTMLDivElement>(null);

  // 滚动到活动主题
  useEffect(() => {
    if (scrollRef.current && !isTransitioning) {
      const activeButton = scrollRef.current.querySelector(`[data-topic-id="${activeTopic}"]`);
      if (activeButton) {
        const container = scrollRef.current;
        const scrollLeft = activeButton.getBoundingClientRect().left - 
                           container.getBoundingClientRect().left - 
                           (container.clientWidth / 2) + 
                           (activeButton as HTMLElement).offsetWidth / 2;
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        });
      }
    }
  }, [activeTopic, isTransitioning]);
  
  // 渲染每个主题标签
  const renderTopicButton = (topic: RankTopic) => {
    const isActive = topic.id === activeTopic;
    
    return (
      <button
        key={topic.id}
        data-topic-id={topic.id}
        onClick={() => onChange(topic.id)}
        className={cn(
          "px-2.5 py-1 text-xs rounded-full transition-all duration-300 whitespace-nowrap font-medium relative",
          "border flex items-center gap-1",
          "transform-gpu hover:scale-105",
          isActive
            ? isDark
              ? "bg-primary text-primary-foreground border-primary/70 shadow-md shadow-primary/20"
              : "bg-primary text-primary-foreground border-primary/80 shadow-md shadow-primary/10"
            : isDark
              ? "bg-muted/40 hover:bg-muted/60 text-muted-foreground hover:text-foreground border-muted/30"
              : "bg-muted/30 hover:bg-muted/50 text-muted-foreground hover:text-foreground border-muted/20",
          "after:absolute after:inset-0 after:rounded-full after:opacity-0 after:transition-opacity",
          isActive && "after:opacity-100"
        )}
        disabled={isTransitioning}
      >
        {isActive && (
          <span className="absolute h-1 w-1 rounded-full -left-0.5 -top-0.5 bg-primary-foreground animate-pulse"></span>
        )}
        {topic.name_zh}
        {topic.id === "hot" && (
          <span className={cn(
            "relative px-1 py-0.5 rounded-sm text-[8px] leading-none inline-flex items-center justify-center ml-0.5",
            "animate-pulse-subtle",
            isActive
              ? "bg-primary-foreground/30 text-primary-foreground"
              : isDark
                ? "bg-foreground/10 text-foreground/80"
                : "bg-foreground/5 text-foreground/70"
          )}>
            HOT
          </span>
        )}
      </button>
    );
  };

  return (
    <div 
      ref={scrollRef}
              className={cn(
        "w-full overflow-x-auto pb-1 mb-1 scrollbar-none -mx-1 px-1 scroll-smooth snap-x",
        "relative"
      )}
    >
      <div className={cn(
        "inline-flex gap-1 p-1 rounded-full",
        "bg-gradient-to-r shadow-inner", 
        "transition-all duration-300",
        isDark 
          ? "from-muted/60 to-muted/40 shadow-black/5 backdrop-blur-md" 
          : "from-muted/50 to-muted/30 shadow-black/5 backdrop-blur-md",
        "border border-muted/30"
      )}>
        {topics.map((topic, index) => (
          <div key={topic.id} className="snap-start">
            {renderTopicButton(topic)}
          </div>
        ))}
      </div>
      
      {/* 滚动渐变阴影 */}
      <div className={cn(
        "pointer-events-none absolute top-0 bottom-0 left-0 w-8",
        "bg-gradient-to-r from-card to-transparent",
        "opacity-60 z-10"
      )}></div>
      <div className={cn(
        "pointer-events-none absolute top-0 bottom-0 right-0 w-8",
        "bg-gradient-to-l from-card to-transparent",
        "opacity-60 z-10"
      )}></div>
    </div>
  );
} 

export default memo(TopicSelector); 