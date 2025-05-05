import { Appearance } from "react-native";

const colorScheme = Appearance.getColorScheme();

export const isLightMode = colorScheme === "light";
export const isDarkMode = colorScheme === "dark";
