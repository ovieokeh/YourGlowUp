import React from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, { SharedValue, useAnimatedProps } from "react-native-reanimated";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

const SCREEN_WIDTH = Dimensions.get("window").width;
const BAR_WIDTH = SCREEN_WIDTH - 64;
const BAR_HEIGHT = 12;

const AnimatedRect = Animated.createAnimatedComponent(Rect);

export const ProgressBar = ({ progress }: { progress: SharedValue<number> }) => {
  const animatedProps = useAnimatedProps(() => ({
    width: progress.value * BAR_WIDTH,
  }));

  return (
    <View style={styles.wrapper}>
      <Svg width={BAR_WIDTH} height={BAR_HEIGHT}>
        {/* Background Track */}
        <Rect x="0" y="0" width={BAR_WIDTH} height={BAR_HEIGHT} rx={6} ry={6} fill="#e5e7eb" />

        {/* Progress Fill with Gradient */}
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2={BAR_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
            <Stop offset="0%" stopColor="#34d399" />
            <Stop offset="100%" stopColor="#10b981" />
          </LinearGradient>
        </Defs>

        <AnimatedRect x="0" y="0" height={BAR_HEIGHT} rx={6} ry={6} animatedProps={animatedProps} fill="url(#grad)" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "center",
  },
});
