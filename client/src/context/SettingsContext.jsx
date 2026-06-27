import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api/axios";
import { useTranslation } from "react-i18next";

const SettingsContext = createContext();

export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children, isAuthenticated }) => {
  const { i18n } = useTranslation();
  
  const [settings, setSettings] = useState({
    theme: "system",
    language: "en",
    accessibility: {
      textSize: "medium",
      fontFamily: "default",
      highContrast: false,
      reduceMotion: false,
      lineSpacing: 1,
      letterSpacing: 0,
      sidebarDensity: "comfortable",
      roundedCorners: true,
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Load settings on mount or when authenticated changes
  useEffect(() => {
    if (!isAuthenticated) {
      setIsLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        const res = await api.get("/settings");
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [isAuthenticated]);

  // Apply Theme
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    
    if (settings.theme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      root.classList.add(systemTheme);
    } else {
      root.classList.add(settings.theme);
    }
  }, [settings.theme]);

  // Apply Language
  useEffect(() => {
    if (settings.language && i18n.language !== settings.language) {
      i18n.changeLanguage(settings.language);
    }
  }, [settings.language, i18n]);

  // Apply Accessibility Options (CSS Variables & Classes)
  useEffect(() => {
    const root = window.document.documentElement;
    const { 
      textSize, fontFamily, highContrast, reduceMotion, 
      lineSpacing, letterSpacing, roundedCorners 
    } = settings.accessibility;

    // Text Size
    let fontSizeRem = "1rem";
    if (textSize === "small") fontSizeRem = "0.875rem";
    if (textSize === "large") fontSizeRem = "1.125rem";
    if (textSize === "xlarge") fontSizeRem = "1.25rem";
    root.style.setProperty("--font-size-base", fontSizeRem);

    // Font Family
    let fontStr = "'Inter', sans-serif";
    if (fontFamily === "open-sans") fontStr = "'Open Sans', sans-serif";
    if (fontFamily === "roboto") fontStr = "'Roboto', sans-serif";
    root.style.setProperty("--font-sans-dynamic", fontStr);

    // Line and Letter Spacing
    root.style.setProperty("--line-height-base", lineSpacing);
    root.style.setProperty("--letter-spacing-base", `${letterSpacing}px`);

    // Toggle Classes for global overrides
    if (highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");

    if (reduceMotion) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");

    if (!roundedCorners) root.classList.add("no-rounded-corners");
    else root.classList.remove("no-rounded-corners");

  }, [settings.accessibility]);

  const updateSettings = async (newSettingsObj) => {
    try {
      // Optimistic update locally
      setSettings(prev => ({
        ...prev,
        ...newSettingsObj,
        accessibility: {
          ...prev.accessibility,
          ...(newSettingsObj.accessibility || {})
        }
      }));

      // Persist
      await api.put("/settings", newSettingsObj);
    } catch (error) {
      console.error("Failed to update settings", error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isLoading }}>
      {children}
    </SettingsContext.Provider>
  );
};
