import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Appearance } from "react-native";

export type ThemePreference = "light" | "dark" | "system";

const getThemePreference = async (): Promise<ThemePreference> => {
  const storedTheme = await AsyncStorage.getItem("theme");
  return (storedTheme as ThemePreference) ?? "system";
};
const setThemePreference = async (theme: ThemePreference) => {
  await AsyncStorage.setItem("theme", theme);
};

type ThemeContextType = {
  theme: ThemePreference;
  colorScheme: "light" | "dark";
  setTheme: (value: ThemePreference) => void;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: "system",
  colorScheme: "light",
  setTheme: () => {},
});

export const ThemeProviderCustom = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemePreference>("system");
  const [colorScheme, setColorScheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    getThemePreference().then((pref) => {
      setThemeState(pref);
      setColorScheme(pref === "system" ? Appearance.getColorScheme() ?? "light" : pref);
    });

    const sub = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === "system") {
        setColorScheme(colorScheme ?? "light");
      }
    });

    return () => sub.remove();
  }, [theme]);

  const setTheme = (pref: ThemePreference) => {
    setThemePreference(pref);
    setThemeState(pref);
    setColorScheme(pref === "system" ? Appearance.getColorScheme() ?? "light" : pref);
  };

  return <ThemeContext.Provider value={{ theme, setTheme, colorScheme }}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = () => useContext(ThemeContext);
