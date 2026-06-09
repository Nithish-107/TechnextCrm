import React, { createContext, useContext, useState, useEffect } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  useEffect(() => {
    document.body.style.background = isDark ? "#0f1117" : "#f8f9fc";
    document.body.style.color = isDark ? "#e5e7eb" : "#0f1117";
  }, [isDark]);

  const theme = {
    isDark,
    toggleTheme,
    // Colors
    bg: isDark ? "#0f1117" : "#f8f9fc",
    bgCard: isDark ? "#1a1d27" : "#ffffff",
    bgInput: isDark ? "#252836" : "#f8f9fc",
    bgSidebar: isDark ? "#080a0f" : "#0f1117",
    border: isDark ? "rgba(255,255,255,0.08)" : "#e5e7f0",
    borderLight: isDark ? "rgba(255,255,255,0.05)" : "#f1f3f9",
    text: isDark ? "#e5e7eb" : "#0f1117",
    textSub: isDark ? "#9ca3af" : "#6b7280",
    textMuted: isDark ? "#6b7280" : "#9ca3af",
    topbar: isDark ? "#1a1d27" : "#ffffff",
    hover: isDark ? "rgba(255,255,255,0.05)" : "#f8f9fc",
    primary: "#6366f1",
    primaryLight: isDark ? "rgba(99,102,241,0.2)" : "#eef2ff",
  };

  return (
    <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
export default ThemeContext;
