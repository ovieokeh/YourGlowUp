import { Spacings } from "@/constants/Theme";
import { useThemeColor } from "@/hooks/useThemeColor";
import { Image } from "expo-image";
import { StyleSheet, TextStyle, View } from "react-native";
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "./ThemedText";

interface CollapsingHeaderProps {
  config: {
    title: string;
    description?: string;
    backgroundImageUrl?: string;
  };
  styleConfig?: {
    textColor?: TextStyle["color"];
    backgroundColor?: TextStyle["backgroundColor"];
  };
  scrollY: SharedValue<number>;
  topLeftContent?: React.ReactNode;
  topRightContent?: React.ReactNode;
  content?: React.ReactNode;
  contentHeight?: number;
  isStickyContent?: boolean;
}

const ANIMATION_DURATION = 300;

export const CollapsingHeader = (props: CollapsingHeaderProps) => {
  const AnimatedExpoImage = Animated.createAnimatedComponent(Image);
  const textColorTheme = useThemeColor({}, "text");
  const backgroundColorTheme = useThemeColor({}, "background");
  const borderColor = useThemeColor({}, "border");
  const {
    scrollY,
    config: { title, description, backgroundImageUrl },
    topLeftContent,
    topRightContent,
    content,
    contentHeight = 30,
    isStickyContent = true,
    styleConfig: { textColor = textColorTheme, backgroundColor = backgroundColorTheme } = {},
  } = props;

  const insets = useSafeAreaInsets();
  const topInset = insets.top;

  const initialHeroHeight = 260;
  const collapsedHeroHeight = isStickyContent ? contentHeight + topInset : -topInset - contentHeight;

  const heroHeight = useAnimatedStyle(() => {
    const scrollResponsiveHeight = interpolate(
      scrollY.value,
      [0, initialHeroHeight],
      [initialHeroHeight, collapsedHeroHeight],
      Extrapolation.CLAMP
    );

    return {
      height: scrollResponsiveHeight,
    };
  });

  const initialTopOpacity = 0.7;
  const collapsedTopOpacity = 1;
  const topOpacity = useAnimatedStyle(() => {
    const scrollResponsiveOpacity = interpolate(
      scrollY.value,
      [0, initialHeroHeight / 2.5],
      [initialTopOpacity, collapsedTopOpacity],
      Extrapolation.CLAMP
    );
    return {
      opacity: scrollResponsiveOpacity,
    };
  });
  const initialBottomOpacity = 0.7;
  const collapsedBottomOpacity = 0;
  const bottomOpacity = useAnimatedStyle(() => {
    const scrollResponsiveOpacity = interpolate(
      scrollY.value,
      [0, initialHeroHeight * 0.5],
      [initialBottomOpacity, collapsedBottomOpacity],
      Extrapolation.CLAMP
    );
    return {
      opacity: scrollResponsiveOpacity,
    };
  });

  return (
    <>
      <Animated.View
        style={[
          {
            position: "absolute",
            width: "100%",
            zIndex: 2,
            // top: topInset,
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "center",
            paddingVertical: Spacings.sm,
            paddingTop: topInset,
          },
        ]}
      >
        {/* Overlay for readability */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              backgroundColor,
              opacity: 0.5,
            },
            topOpacity,
          ]}
        />
        {topLeftContent && (
          <View
            style={{
              position: "absolute",
              left: Spacings.md,
              bottom: Spacings.xs,
            }}
          >
            {topLeftContent}
          </View>
        )}
        <ThemedText type="subtitle" style={[{ color: textColor }]}>
          {title}
        </ThemedText>
        {topRightContent && (
          <View
            style={{
              position: "absolute",
              right: Spacings.md,
              bottom: Spacings.xs,
            }}
          >
            {topRightContent}
          </View>
        )}
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "relative",
            width: "100%",
            zIndex: 1,
          },
          heroHeight,
        ]}
      >
        {backgroundImageUrl ? (
          <Animated.View style={[StyleSheet.absoluteFill]}>
            <AnimatedExpoImage
              source={{ uri: backgroundImageUrl }}
              style={[StyleSheet.absoluteFill]}
              contentFit="cover"
              transition={ANIMATION_DURATION}
            />
          </Animated.View>
        ) : (
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor }]} />
        )}
        {description && (
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                borderBottomWidth: 1,
                borderBottomColor: borderColor,
                padding: Spacings.md,
              },
              bottomOpacity,
            ]}
          >
            {/* Overlay for readability */}
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  backgroundColor,
                  opacity: 0.7,
                },
              ]}
            />
            <ThemedText type="defaultSemiBold" style={[{ color: textColor }, bottomOpacity]}>
              {description}
            </ThemedText>
          </Animated.View>
        )}
      </Animated.View>

      {content && content}
    </>
  );
};
