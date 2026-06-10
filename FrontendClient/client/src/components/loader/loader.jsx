// components/CoolLoader.js - Minimal & Clean
import React from "react";

const ExternalLoader = ({
  size = "medium",
  color = "primary",
  text = "",
  overlay = true,
  fullScreen = true,
  className = "",
}) => {
  const colorMap = {
    primary: "#04c800",
    secondary: "#038b00",
    success: "#04c800",
    warning: "#f78c00",
    danger: "#e74c3c",
    dark: "#1a1a1a",
    light: "#f8f9fa",
  };

  const sizeMap = {
    small: { width: "24px", fontSize: "0.7rem" },
    medium: { width: "36px", fontSize: "0.8rem" },
    large: { width: "48px", fontSize: "0.9rem" },
    xlarge: { width: "64px", fontSize: "1rem" },
  };

  const currentColor = colorMap[color] || colorMap.primary;
  const currentSize = sizeMap[size] || sizeMap.medium;

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "16px",
      zIndex: 9999,
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: overlay ? "rgba(4,4,4,0.6)" : "transparent",
      backdropFilter: overlay ? "blur(4px)" : "none",
    }} className={className}>
      <div style={{
        width: currentSize.width,
        height: currentSize.width,
        borderRadius: "50%",
        border: `3px solid ${currentColor}20`,
        borderTopColor: currentColor,
        animation: "spinModern 0.8s linear infinite",
        boxShadow: overlay ? `0 0 20px ${currentColor}30` : "none",
      }} />
      
      {text && <div style={{
        fontSize: currentSize.fontSize,
        color: "#a0a0a0",
        fontWeight: "400",
        textAlign: "center",
        letterSpacing: "0.05em",
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