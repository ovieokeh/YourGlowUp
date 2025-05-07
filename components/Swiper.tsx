import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, { runOnJS, useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";

interface SwiperProps {
  index: number;
  length: number;
  width: number;
  children: React.ReactNode;
  setIndex: (i: number) => void;
  onIndexChange?: (i: number) => void;
}
export function Swiper({ index, width, setIndex, length, children, onIndexChange }: SwiperProps) {
  const translateX = useSharedValue(-index * width);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  useEffect(() => {
    translateX.value = withTiming(-index * width, { duration: 300 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const swipeGesture = Gesture.Pan()
    .onUpdate((e) => {
      translateX.value = -(index * width) + e.translationX;
    })
    .onEnd((e) => {
      const threshold = 300;
      let newIndex = index;

      if (e.velocityX < -threshold && index < length - 1) {
        newIndex = index + 1;
      } else if (e.velocityX > threshold && index > 0) {
        newIndex = index - 1;
      } else {
        newIndex = Math.round(-translateX.value / width);
      }

      newIndex = Math.max(0, Math.min(length - 1, newIndex));

      translateX.value = withTiming(-newIndex * width, { duration: 300 });
      runOnJS(setIndex)(newIndex);
      if (onIndexChange) {
        runOnJS(onIndexChange)(newIndex);
      }
    });

  return (
    <GestureDetector gesture={swipeGesture}>
      <Animated.View
        style={[
          styles.slider,
          {
            width: width * length,
          },
          animatedStyle,
        ]}
      >
        {children}
      </Animated.View>
    </GestureDetector>
  );
}
const styles = StyleSheet.create({
  slider: { flexDirection: "row", flex: 1 },
});
