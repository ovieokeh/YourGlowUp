import { Colors } from "@/constants/Theme";
import { Href, useRouter } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { Pressable } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

export const BackButton = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lastPage = searchParams.get("lastPage") || null;

  const handleBack = () => {
    if (!lastPage && router.canGoBack()) {
      router.back();
    } else {
      if (lastPage) {
        router.dismissTo(lastPage as Href);
      } else {
        router.replace("..");
      }
    }
  };

  return (
    <Pressable onPress={handleBack} style={{ marginLeft: 16 }}>
      <IconSymbol name="chevron.left" size={28} color={Colors.light.accent} />
    </Pressable>
  );
};
