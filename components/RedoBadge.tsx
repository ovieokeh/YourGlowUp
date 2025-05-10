import React, { useEffect, useRef, useState } from "react";
import Animated, { Easing, useAnimatedProps, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Path, Svg, Text as SVGText } from "react-native-svg";

export interface RedoBadgeProps {
  count: number;
  size?: number;
  color?: string;
  textColor?: string;
  fontSizeRatio?: number;
  textYOffset?: number;
}

const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);

export const RedoBadge: React.FC<RedoBadgeProps> = ({
  count,
  size = 32,
  color = "#38C172",
  textColor = "#ffffff",
  fontSizeRatio = 0.2,
  textYOffset = 2,
}) => {
  const calculatedFontSize = 24 * fontSizeRatio;

  const [displayCount, setDisplayCount] = useState("0");

  const scaleVal = useSharedValue(1);
  const rotation = useSharedValue(0);
  const mounted = useRef(false);

  useEffect(() => {
    let timeoutId: number;

    if (!mounted.current) {
      const targetCount = Math.min(Math.max(0, count), 9);
      let currentAnimatedVal = 0;
      const interval = 30;

      const step = () => {
        if (currentAnimatedVal <= targetCount) {
          setDisplayCount(currentAnimatedVal === 9 && count > 9 ? "9+" : String(currentAnimatedVal));
          currentAnimatedVal++;
          timeoutId = setTimeout(step, interval);
        } else {
          mounted.current = true;
        }
      };
      step();

      return () => clearTimeout(timeoutId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mounted.current) {
      return;
    }

    const newText = count > 9 ? "9+" : String(Math.max(0, count));
    setDisplayCount(newText);

    scaleVal.value = withSequence(withTiming(1.2, { duration: 100 }), withTiming(1, { duration: 150 }));

    rotation.value = withTiming(rotation.value + 360, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
  }, [count, rotation, scaleVal]);

  const svgAnimatedProps = useAnimatedProps(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  const pathRotationCenterX = 12;
  const pathRotationCenterY = 12 + textYOffset;

  const pathAnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${rotation.value} ${pathRotationCenterX} ${pathRotationCenterY})`,
  }));

  return (
    <AnimatedSvg width={size} height={size} viewBox="0 0 24 24" animatedProps={svgAnimatedProps}>
      {/* The arrow path. Its coordinates are within the 24x24 viewBox. */}
      <AnimatedPath
        animatedProps={pathAnimatedProps}
        d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
        fill={color}
      />
      {/* The text displaying the count. Its coordinates are within the 24x24 viewBox. */}
      <SVGText
        x="12"
        y={12 + textYOffset}
        textAnchor="middle"
        alignmentBaseline="middle"
        fontSize={calculatedFontSize}
        fontWeight="600"
        fill={textColor}
      >
        {displayCount}
      </SVGText>
    </AnimatedSvg>
  );
};
