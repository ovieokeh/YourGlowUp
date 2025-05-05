import { Colors } from "@/constants/Theme";
import { useRouter } from "expo-router";
import { Pressable } from "react-native";
import { IconSymbol } from "./ui/IconSymbol";

export const BackButton = () => {
  const router = useRouter();

  const handleBack = () => {
    router.replace("..");
  };

  return (
    <Pressable onPress={handleBack} style={{ marginLeft: 16 }}>
      <IconSymbol name="chevron.left" size={28} color={Colors.light.accent} />
    </Pressable>
  );
};
