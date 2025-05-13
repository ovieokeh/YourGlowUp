import { Spacings } from "@/constants/Theme";
import React, { useMemo } from "react";
import { Platform, Pressable, StyleProp, StyleSheet, TextStyle, View, ViewStyle } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "./ThemedView";
import { IconSymbol } from "./ui/IconSymbol";

export interface CollapsibleHeroProps {
  title: string;
  description?: string;
  background: React.ReactNode;
  children: React.ReactNode;
  heroChildren?: React.ReactNode;
  initialHeight?: number;
  collapsedHeight?: number;
  overlayColor?: string;
  style?: StyleProp<ViewStyle>;
  titleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  stickyHeader?: boolean;
  onBackPress?: () => void;
}

export const CollapsibleHero: React.FC<CollapsibleHeroProps> = ({
  title,
  description,
  background,
  children,
  heroChildren,
  initialHeight = 300,
  collapsedHeight = 40,
  overlayColor = "rgba(0,0,0,0.45)",
  style,
  titleStyle,
  descriptionStyle,
  stickyHeader = true,
  onBackPress,
}) => {
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, initialHeight - collapsedHeight],
        [initialHeight, collapsedHeight],
        Extrapolation.CLAMP
      ),
    };
  });

  const titleFadeStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, initialHeight / 2], [1, 0], Extrapolation.CLAMP),
    };
  });

  const stickyHeaderStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [initialHeight / 2, initialHeight], [0, 1], Extrapolation.CLAMP),
      transform: [
        {
          translateY: interpolate(scrollY.value, [initialHeight / 2, initialHeight], [-10, 0], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const backButton = useMemo(
    () =>
      onBackPress ? (
        <Pressable onPress={onBackPress} style={{ padding: 8, marginRight: Spacings.sm }}>
          <IconSymbol
            name="chevron.left"
            style={{
              paddingLeft: 0,
            }}
            color={"#fff"}
          />
        </Pressable>
      ) : null,
    [onBackPress]
  );

  return (
    <View style={{ position: "relative", flex: 1, paddingBottom: 94 }}>
      {/* Sticky mini-header */}
      {stickyHeader && (
        <Animated.View
          style={[
            {
              position: "absolute",
              top: insets.top - 26,
              left: 0,
              right: 0,
              height: collapsedHeight,
              justifyContent: "center",
              paddingHorizontal: 16,
              zIndex: 100,
            },
            stickyHeaderStyle,
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", paddingLeft: onBackPress ? Spacings.xxl : 0 }}>
            <Animated.Text style={[{ fontSize: 18, fontWeight: "600", color: "#fff" }, titleStyle]}>
              {title}
            </Animated.Text>
          </View>
        </Animated.View>
      )}

      {/* Hero */}
      <Animated.View style={[{ overflow: "hidden", position: "relative" }, heroStyle]}>
        <Animated.View
          style={[
            {
              position: "absolute",
              top: insets.top - 6,
              left: 16,
              zIndex: 100,
            },
            // titleFadeStyle,
          ]}
        >
          {backButton}
        </Animated.View>
        {background}

        <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor }]} />
        <Animated.View
          style={[
            {
              position: "absolute",
              bottom: Spacings.lg,
              left: Spacings.md,
              right: Spacings.md,
            },
            titleFadeStyle,
          ]}
        >
          <Animated.Text style={[{ fontSize: 22, fontWeight: "700", color: "#fff" }, titleStyle]}>
            {title}
          </Animated.Text>
          {description && (
            <Animated.Text style={[{ color: "#eee", marginTop: 4 }, descriptionStyle]}>{description}</Animated.Text>
          )}
          {heroChildren}
        </Animated.View>
      </Animated.View>

      {/* Scrollable content */}
      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        contentContainerStyle={{
          // paddingBottom: 94,
          flexGrow: 1,
        }}
        bounces={false}
        style={[{ flex: 1, marginBottom: -insets.bottom }]}
        overScrollMode={Platform.OS === "android" ? "never" : undefined}
      >
        <ThemedView style={{ flex: 1, paddingHorizontal: Spacings.md, paddingBottom: 74, ...(style as object) }}>
          {children}
        </ThemedView>
      </Animated.ScrollView>
    </View>
  );
};
