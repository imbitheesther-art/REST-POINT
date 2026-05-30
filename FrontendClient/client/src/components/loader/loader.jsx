// components/CoolLoader.js
import React from "react";

const ExternalLoader = ({
  size = "medium",
  color = "primary",
  text = "Please wait...",
  overlay = true,
  fullScreen = true,
  className = "",
}) => {
  const colorMap = {
    primary: "#FF5C01",
    secondary: "#126F80",
    success: "#34C759",
    warning: "#FF9500",
    danger: "#FF3B30",
    dark: "#1E293B",
    light: "#f8f9fa",
  };

  const sizeMap = {
    small: { width: "40px", fontSize: "0.75rem" },
    medium: { width: "60px", fontSize: "0.9rem" },
    large: { width: "80px", fontSize: "1rem" },
    xlarge: { width: "100px", fontSize: "1.15rem" },
  };

  const currentColor = colorMap[color] || colorMap.primary;
  const currentSize = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "20px",
      zIndex: 999999,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255,255,255,0.8)",
    }} className={className}>
      <div style={{
        width: currentSize.width,
        height: currentSize.width,
        borderRadius: "50%",
        border: `4px solid ${currentColor}30`,
        borderTopColor: currentColor,
        animation: "spinModern 0.9s linear infinite",
      }} />
      
      {text && <div style={{
        fontSize: currentSize.fontSize,
        color: "#2e2e2e",
        fontWeight: "500",
        textAlign: "center",
      }}>{text}</div>}
    </div>
  );
};

// Global animations
export const GlobalLoaderStyles = () => (
  <style>
    {`
      @keyframes spinModern {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}
  </style>
);

export default ExternalLoader;