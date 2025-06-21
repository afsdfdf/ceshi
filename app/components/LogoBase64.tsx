import React from "react";

// This component provides a BNB logo that will work consistently across the app
export default function LogoBase64({ 
  width = 32, 
  height = 32, 
  className = "" 
}: { 
  width?: number; 
  height?: number; 
  className?: string;
}) {
  return (
    <div 
      className={className}
      style={{
        width: width,
        height: height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: "linear-gradient(135deg, #F3BA2F 0%, #F7931E 100%)",
        color: "white",
        fontSize: `${Math.max(width * 0.4, 12)}px`,
        fontWeight: "bold",
        boxShadow: "0 2px 8px rgba(243, 186, 47, 0.3)"
      }}
    >
      BNB
    </div>
  );
} 