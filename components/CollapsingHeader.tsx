import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image as ExpoImage } from "expo-image";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ANIMATION_DURATION = 300;

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

export interface CollapsingHeaderConfig {
  initialHeight: number;
  collapsedHeight: number;
  backgroundColor?: string;
  overlayColor?: string;
  stickyHeaderBackgroundColor?: string;
  stickyHeaderTextColor?: string;
  stickyHeaderTextMutedColor?: string;
}

export interface HeaderContentData {
  title: string;
  description?: string;
  imageUrl?: string;
}

export interface CollapsingHeaderProps {
  scrollY: SharedValue<number>;
  contentData: HeaderContentData;
  topInset: number;
  headerConfig?: CollapsingHeaderConfig;
  content?: React.ReactNode;
  stickyContent?: React.ReactNode;
  actionLeftContent?: React.ReactNode;
  actionRightContent?: React.ReactNode;
}

export const CollapsingHeader: React.FC<CollapsingHeaderProps> = ({
  scrollY,
  headerConfig = {
    initialHeight: 240,
    collapsedHeight: 94,
    overlayColor: "rgba(0,0,0,0.45)",
    backgroundColor: "transparent",
  },
  contentData,
  topInset,
  content,
  stickyContent,
  actionLeftContent,
  actionRightContent,
}) => {
  const { initialHeight, collapsedHeight, overlayColor = "rgba(0,0,0,0.45)" } = headerConfig;
  const range = initialHeight - collapsedHeight;
  const gray10 = useThemeColor({}, "gray10");
  const insets = useSafeAreaInsets();

  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [range / 2, range], [0, 1], Extrapolation.CLAMP);
    const translateY = interpolate(scrollY.value, [range / 2, range], [-10, 0], Extrapolation.CLAMP);
    return {
      opacity,
      transform: [{ translateY }],
      height: collapsedHeight + topInset,
    };
  });

  const stickyHeaderBackgroundOpacity = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [range - 30, range], [0, 1], Extrapolation.CLAMP),
  }));

  const heroStyle = useAnimatedStyle(() => ({
    height: interpolate(scrollY.value, [0, range], [initialHeight, collapsedHeight], Extrapolation.CLAMP),
  }));

  const heroImageParallaxStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(scrollY.value, [0, range], [0, range * 0.05], Extrapolation.CLAMP),
      },
      {
        scale: interpolate(scrollY.value, [0, range], [1, 1.3], Extrapolation.CLAMP),
      },
    ],
  }));

  const titleFadeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, range / 2.5], [1, 0], Extrapolation.CLAMP),
  }));

  return (
    <>
      <Animated.View
        style={[
          styles.stickyHeaderBase,
          stickyHeaderStyle,
          {
            paddingTop: insets.top,
          },
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.stickyHeaderBackground,
            stickyHeaderBackgroundOpacity,
            {
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: headerConfig.stickyHeaderBackgroundColor || "rgba(0,0,0,0.95)",
            },
          ]}
        />
        <View style={styles.stickyHeaderControls}>
          {actionLeftContent && <View style={{ marginRight: "auto" }}>{actionLeftContent}</View>}
          <Animated.Text
            style={[styles.stickyHeaderText, { color: headerConfig.stickyHeaderTextColor || "#fff" }]}
            numberOfLines={1}
          >
            {contentData.title}
          </Animated.Text>
          {actionRightContent && <View style={{ marginLeft: "auto" }}>{actionRightContent}</View>}
        </View>

        {stickyContent && <View style={[stickyHeaderBackgroundOpacity]}>{stickyContent}</View>}
      </Animated.View>

      <Animated.View style={[styles.heroContainer, heroStyle]}>
        {contentData.imageUrl ? (
          <Animated.View style={styles.heroImageWrapper}>
            <AnimatedExpoImage
              source={{ uri: contentData.imageUrl }}
              style={[StyleSheet.absoluteFill, heroImageParallaxStyle]}
              contentFit="cover"
              transition={ANIMATION_DURATION}
            />
          </Animated.View>
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: headerConfig.backgroundColor ?? gray10 }]} />
        )}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, zIndex: 0 }]} />
        {actionLeftContent && (
          <Animated.View style={[{ position: "absolute", left: 0, zIndex: 2, top: topInset }, titleFadeStyle]}>
            <View style={{ marginRight: "auto" }}>{actionLeftContent}</View>
          </Animated.View>
        )}

        <Animated.View style={[styles.heroContentContainer, titleFadeStyle]}>
          <View style={styles.heroContentInner}>
            <Animated.Text style={styles.heroTitleText}>{contentData.title}</Animated.Text>
            {contentData.description && (
              <Animated.Text style={styles.heroDescriptionText}>{contentData.description}</Animated.Text>
            )}
          </View>
          {content}
        </Animated.View>

        {actionRightContent && (
          <Animated.View style={[{ position: "absolute", right: 0, zIndex: 2, top: topInset }, titleFadeStyle]}>
            <View style={{ marginLeft: "auto" }}>{actionRightContent}</View>
          </Animated.View>
        )}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  stickyHeaderBase: { position: "absolute", left: 0, right: 0, zIndex: 100 },
  stickyHeaderBackground: { backgroundColor: "rgba(0,0,0,0.95)" },
  stickyHeaderControls: { flexDirection: "row", alignItems: "center", paddingHorizontal: Spacings.sm },
  stickyHeaderText: { fontSize: 18, fontWeight: "600", marginLeft: Spacings.sm, flexShrink: 1 },
  heroContainer: { overflow: "hidden", position: "relative", zIndex: 1 },
  heroBackButtonContainer: { position: "absolute", left: Spacings.xs, zIndex: 2 },
  backButtonPressable: { padding: Spacings.sm, marginRight: Spacings.xs },
  heroImageWrapper: { ...StyleSheet.absoluteFillObject, overflow: "hidden" },
  heroContentContainer: { position: "absolute", bottom: 0, left: 0, right: 0, paddingBottom: Spacings.xs, zIndex: 1 },
  heroContentInner: { paddingHorizontal: Spacings.md },
  heroTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: Spacings.xs,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroDescriptionText: {
    fontSize: 15,
    color: "rgba(235,235,245,0.9)",
    marginTop: Spacings.xs,
    marginBottom: Spacings.md,
    textShadowColor: "rgba(0,0,0,0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
