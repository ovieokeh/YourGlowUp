import { useAppTheme } from "@/hooks/theme/context";

export function useColorScheme() {
  return useAppTheme().colorScheme;
}
