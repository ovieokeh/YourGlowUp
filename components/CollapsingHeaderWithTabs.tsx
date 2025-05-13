import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image as ExpoImage } from "expo-image"; // Assuming Expo Image for optimized images
import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { CenteredSwipeableTabs, TabConfig } from "./CenteredSwipeableTabs";
import { IconSymbol } from "./ui/IconSymbol";

const ANIMATION_DURATION = 300;

const AnimatedExpoImage = Animated.createAnimatedComponent(ExpoImage);

export interface CollapsingHeaderConfig {
  initialHeight: number;
  collapsedHeight: number;
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

export interface TabDisplayConfig {
  tabBackgroundColor?: string;
  tabTextColor?: string;
  tabTextMutedColor?: string;
  // ... other props for CenteredSwipeableTabs
}

interface CollapsingHeaderWithTabsProps {
  scrollY: SharedValue<number>;
  headerConfig: CollapsingHeaderConfig;
  contentData: HeaderContentData;
  tabsConfig: TabConfig[];
  activeTabIndex: number;
  onTabPress: (index: number) => void;
  onBackPress: () => void;
  topInset: number; // For safe area handling
  backButtonComponent?: React.ReactNode;
  tabDisplayConfig?: TabDisplayConfig;
  withTabs?: boolean; // Optional prop to control tab visibility
}

export const CollapsingHeaderWithTabs: React.FC<CollapsingHeaderWithTabsProps> = ({
  scrollY,
  headerConfig,
  contentData,
  tabsConfig,
  activeTabIndex,
  onTabPress,
  onBackPress,
  topInset,
  backButtonComponent,
  tabDisplayConfig = {},
  withTabs = false, // Default to true if not provided
}) => {
  const { initialHeight, collapsedHeight, overlayColor = "rgba(0,0,0,0.45)" } = headerConfig;
  const heroParallaxScrollRange = initialHeight - collapsedHeight;
  const gray10 = useThemeColor({}, "gray10");

  // --- Animations ---
  const stickyHeaderStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [heroParallaxScrollRange / 2, heroParallaxScrollRange],
      [0, 1],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [heroParallaxScrollRange / 2, heroParallaxScrollRange],
      [-10, 0],
      Extrapolation.CLAMP
    );
    return {
      opacity: opacity,
      transform: [{ translateY }],
      height: collapsedHeight, // Ensure sticky header has correct height
      paddingTop: topInset, // Apply top inset to sticky header
    };
  });

  const stickyHeaderBackgroundOpacity = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        scrollY.value,
        [heroParallaxScrollRange - 30, heroParallaxScrollRange],
        [0, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const heroStyle = useAnimatedStyle(() => {
    return {
      height: interpolate(
        scrollY.value,
        [0, heroParallaxScrollRange],
        [initialHeight, collapsedHeight],
        Extrapolation.CLAMP
      ),
    };
  });

  const heroImageParallaxStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [0, initialHeight], [0, initialHeight * 0.35], Extrapolation.CLAMP),
        },
        {
          scale: interpolate(scrollY.value, [0, initialHeight], [1, 1.8], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const titleFadeStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(scrollY.value, [0, heroParallaxScrollRange / 2.5], [1, 0], Extrapolation.CLAMP),
    };
  });

  const defaultBackButton = (
    <Pressable
      onPress={onBackPress}
      style={styles.backButtonPressable}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <IconSymbol name="chevron.left" size={22} color={headerConfig.stickyHeaderTextMutedColor || "#fff"} />
    </Pressable>
  );

  const finalBackButton = backButtonComponent || defaultBackButton;

  return (
    <>
      {/* Sticky Header (appears on scroll) */}
      <Animated.View style={[styles.stickyHeaderBase, stickyHeaderStyle]}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.stickyHeaderBackground,
            stickyHeaderBackgroundOpacity,
            { flexDirection: "row", alignItems: "center" },
            { backgroundColor: headerConfig.stickyHeaderBackgroundColor || "rgba(0,0,0,0.95)" },
          ]}
        />
        {/* Back button for sticky header */}
        <View style={styles.stickyHeaderControls}>
          {finalBackButton}
          <Animated.Text
            style={[
              styles.stickyHeaderText,
              {
                color: headerConfig.stickyHeaderTextColor || "#fff",
              },
            ]}
            numberOfLines={1}
          >
            {contentData.title}
          </Animated.Text>
        </View>
        {/* Tabs in Sticky Header */}
        {withTabs && (
          <CenteredSwipeableTabs
            tabs={tabsConfig}
            activeIndex={activeTabIndex}
            onTabPress={onTabPress}
            tabBackgroundColor={headerConfig.stickyHeaderBackgroundColor || "transparent"}
            tabTextColor={headerConfig.stickyHeaderTextColor || "#fff"}
            tabTextMutedColor={headerConfig.stickyHeaderTextMutedColor || "rgba(255, 255, 255, 0.7)"}
            // Pass other relevant props from tabDisplayConfig
          />
        )}
      </Animated.View>

      {/* Collapsible Hero Section */}
      <Animated.View style={[styles.heroContainer, heroStyle]}>
        {/* Hero Background Image with Parallax */}
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
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: gray10 }]} />
        )}
        {/* Dark Overlay on Image */}
        <View style={[StyleSheet.absoluteFill, { backgroundColor: overlayColor, zIndex: 0 }]} />

        {/* Hero Back Button (fades out) */}
        <Animated.View style={[styles.heroBackButtonContainer, { top: topInset }, titleFadeStyle]}>
          <Pressable
            onPress={onBackPress}
            style={styles.backButtonPressable}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="chevron.left" size={22} color={"#fff"} />
          </Pressable>
        </Animated.View>

        {/* Hero Content (Title, Description, Tabs - fades out) */}
        <Animated.View style={[styles.heroContentContainer, titleFadeStyle]}>
          <View style={styles.heroContentInner}>
            <Animated.Text style={styles.heroTitleText}>{contentData.title}</Animated.Text>
            {contentData.description && (
              <Animated.Text style={styles.heroDescriptionText}>{contentData.description}</Animated.Text>
            )}
          </View>
          {/* Tabs in Hero Section */}
          {withTabs && (
            <CenteredSwipeableTabs
              tabs={tabsConfig}
              activeIndex={activeTabIndex}
              onTabPress={onTabPress}
              tabBackgroundColor={tabDisplayConfig.tabBackgroundColor || "transparent"}
              tabTextColor={tabDisplayConfig.tabTextColor || "#fff"}
              tabTextMutedColor={tabDisplayConfig.tabTextMutedColor || "rgba(255, 255, 255, 0.7)"}
              // Pass other relevant props from tabDisplayConfig
            />
          )}
        </Animated.View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  stickyHeaderBase: {
    position: "absolute",
    left: 0,
    right: 0,
    zIndex: 100,
  },
  stickyHeaderBackground: {
    backgroundColor: "rgba(0,0,0,0.95)",
  },
  stickyHeaderControls: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacings.sm,
  },
  stickyHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: Spacings.sm,
    flexShrink: 1,
  },
  heroContainer: {
    overflow: "hidden",
    position: "relative",
    zIndex: 1,
  },
  heroBackButtonContainer: {
    position: "absolute",
    left: Spacings.xs,
    zIndex: 2,
  },
  backButtonPressable: {
    padding: Spacings.sm,
    marginRight: Spacings.xs,
  },
  heroImageWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  heroContentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: Spacings.xs,
    zIndex: 1,
  },
  heroContentInner: {
    paddingHorizontal: Spacings.md,
  },
  heroTitleText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: Spacings.xs,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroDescriptionText: {
    fontSize: 15,
    color: "rgba(235, 235, 245, 0.9)",
    marginTop: Spacings.xs,
    marginBottom: Spacings.md,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tabsWrapperInHero: {},
});
