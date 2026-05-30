// InstallPrompt.jsx
import React, { useEffect, useState } from "react";

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();       // Prevent automatic prompt
      setDeferredPrompt(e);     // Save the event for later
      setShowButton(true);      // Show custom install button
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();           // Trigger browser install prompt
    const choiceResult = await deferredPrompt.userChoice;

    if (choiceResult.outcome === "accepted") {
      console.log("✅ User accepted the install prompt");
    } else {
      console.log("❌ User dismissed the install prompt");
    }

    setDeferredPrompt(null);
    setShowButton(false);
  };

  // Animated button styles
  const buttonStyle = {
    position: "fixed",
    bottom: "25px",
    right: "25px",
    background: "linear-gradient(90deg, #06b10f, #00e676)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 24px",
    fontWeight: "bold",
    fontSize: "16px",
    cursor: "pointer",
    zIndex: 10000,
    boxShadow: "0 8px 15px rgba(0,0,0,0.2)",
    transition: "all 0.3s ease",
  };

  const hoverStyle = {
    transform: "translateY(-3px)",
    boxShadow: "0 12px 20px rgba(0,0,0,0.3)",
  };

  const [hover, setHover] = useState(false);

  return (
    showButton && (
      <button
        onClick={handleInstallClick}
        style={{ ...buttonStyle, ...(hover ? hoverStyle : {}) }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        🚀 Install Rest-Point Software
      </button>
    )
  );
}
