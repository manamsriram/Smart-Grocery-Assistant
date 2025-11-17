import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Appearance, ColorSchemeName } from "react-native";

type ThemeMode = "light" | "dark" | "system";

interface ThemeContextType {
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [isDark, setIsDark] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);
  const appearanceListenerRef = useRef<any>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const saved = await AsyncStorage.getItem("app_theme_mode");
        const mode = (saved as ThemeMode) || "light";
        setThemeMode(mode);

        if (mode === "system") {
          const system = Appearance.getColorScheme();
          setIsDark(system === "dark");
        } else {
          setIsDark(mode === "dark");
        }
      } catch (err) {
        console.error("Error loading theme mode:", err);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  // Manage Appearance listener when mode === 'system'
  useEffect(() => {
    // clean up existing
    if (appearanceListenerRef.current) {
      try {
        appearanceListenerRef.current.remove();
      } catch {}
      appearanceListenerRef.current = null;
    }

    if (themeMode === "system") {
      const handler = ({ colorScheme }: { colorScheme: ColorSchemeName }) => {
        setIsDark(colorScheme === "dark");
      };
      appearanceListenerRef.current = Appearance.addChangeListener(handler);
      // set initial
      setIsDark(Appearance.getColorScheme() === "dark");
    }

    return () => {
      if (appearanceListenerRef.current) {
        try {
          appearanceListenerRef.current.remove();
        } catch {}
        appearanceListenerRef.current = null;
      }
    };
  }, [themeMode]);

  const setTheme = async (mode: ThemeMode) => {
    try {
      setThemeMode(mode);
      await AsyncStorage.setItem("app_theme_mode", mode);
      if (mode === "system") {
        setIsDark(Appearance.getColorScheme() === "dark");
      } else {
        setIsDark(mode === "dark");
      }
    } catch (err) {
      console.error("Error saving theme mode:", err);
    }
  };

  if (isLoading) return null;

  return (
    <ThemeContext.Provider
      value={{ themeMode, setTheme, isDark }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
