/**
 * 加载状态组件 - 最简版
 */
export default function LoadingState() {
  const containerStyle = {
    padding: "16px",
    display: "flex",
    flexDirection: "column" as "column",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid #eee",
    borderRadius: "8px",
    background: "#fff"
  };
  
  const spinnerStyle = {
    height: "24px",
    width: "24px",
    border: "2px solid transparent",
    borderTopColor: "#3b82f6",
    borderRadius: "50%",
    animation: "spin 1s linear infinite"
  };
  
  const textStyle = {
    fontSize: "14px",
    color: "#666",
    marginTop: "8px"
  };
  
  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      <p style={textStyle}>加载中...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 