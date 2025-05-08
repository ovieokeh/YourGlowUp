import React, { useEffect, useRef, useState } from "react";
import Animated, { Easing, useAnimatedProps, useSharedValue, withSequence, withTiming } from "react-native-reanimated";
import { Path, Svg, Text as SVGText } from "react-native-svg";

// Define the props for the RedoBadge component
export interface RedoBadgeProps {
  count: number;
  size?: number;
  color?: string;
  textColor?: string;
  fontSizeRatio?: number; // Ratio relative to the 24-unit grid height for font size
  textYOffset?: number; // Offset in 24-unit grid units
}

// Create animated versions of SVG components that will have animated props
const AnimatedSvg = Animated.createAnimatedComponent(Svg);
const AnimatedPath = Animated.createAnimatedComponent(Path);
// SVGText does not have animated props in this version, so no AnimatedSVGText needed.

export const RedoBadge: React.FC<RedoBadgeProps> = ({
  count,
  size = 32,
  color = "#38C172",
  textColor = "#ffffff",
  fontSizeRatio = 0.2,
  textYOffset = 2, // Default Y offset for the text from the grid's vertical center (12)
}) => {
  // Calculate font size based on the 24-unit grid height and the ratio
  // This font size is in the units of the 24x24 viewBox
  const calculatedFontSize = 24 * fontSizeRatio;

  const [displayCount, setDisplayCount] = useState("0");

  // Shared values for animations
  const scaleVal = useSharedValue(1); // For the bounce animation of the entire badge
  const rotation = useSharedValue(0); // For the rotation animation of the arrow path
  const mounted = useRef(false); // To track if initial mount animation is complete

  // Effect for initial count-up animation on first mount
  useEffect(() => {
    let timeoutId: number; // Use NodeJS.Timeout for setTimeout return type

    if (!mounted.current) {
      const targetCount = Math.min(Math.max(0, count), 9); // Cap target at 0-9
      let currentAnimatedVal = 0;
      const interval = 30; // Milliseconds between count steps

      const step = () => {
        if (currentAnimatedVal <= targetCount) {
          // Display "9+" if actual count is > 9 and animation reaches 9
          setDisplayCount(currentAnimatedVal === 9 && count > 9 ? "9+" : String(currentAnimatedVal));
          currentAnimatedVal++;
          timeoutId = setTimeout(step, interval);
        } else {
          mounted.current = true; // Mark initial animation as complete
        }
      };
      step(); // Start the count-up

      return () => clearTimeout(timeoutId); // Cleanup timeout on unmount
    }
  }, []); // Empty dependency array: runs only once on mount, captures initial `count`

  // Effect for animations when the `count` prop changes (after initial mount)
  useEffect(() => {
    if (!mounted.current) {
      // Don't run update animations if the initial mount animation isn't finished
      return;
    }

    // Update text display immediately based on the new count
    const newText = count > 9 ? "9+" : String(Math.max(0, count));
    setDisplayCount(newText);

    // Trigger bounce animation: scale up then back to normal
    scaleVal.value = withSequence(
      withTiming(1.2, { duration: 100 }), // Scale to 120%
      withTiming(1, { duration: 150 }) // Scale back to 100%
    );

    // Trigger rotation animation: spin 360 degrees
    rotation.value = withTiming(rotation.value + 360, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
  }, [count]); // Rerun effect if `count` changes (rotation & scaleVal are stable shared refs)

  // Animated props for the main Svg component (for the bounce effect)
  // This scales the entire SVG component around its center.
  const svgAnimatedProps = useAnimatedProps(() => ({
    transform: [{ scale: scaleVal.value }],
  }));

  // Define rotation center for the path (arrow)
  // These are in the 24x24 viewBox coordinates.
  const pathRotationCenterX = 12; // Horizontal center of the 24x24 grid
  const pathRotationCenterY = 12 + textYOffset; // Vertical center of the text

  // Animated props for the Path component (for the rotation effect)
  const pathAnimatedProps = useAnimatedProps(() => ({
    transform: `rotate(${rotation.value} ${pathRotationCenterX} ${pathRotationCenterY})`,
  }));

  return (
    <AnimatedSvg
      width={size} // The final pixel width of the badge
      height={size} // The final pixel height of the badge
      viewBox="0 0 24 24" // Fixed 24x24 coordinate system for internal elements
      animatedProps={svgAnimatedProps} // Apply bounce scale animation here
    >
      {/* The arrow path. Its coordinates are within the 24x24 viewBox. */}
      <AnimatedPath
        animatedProps={pathAnimatedProps} // Apply rotation animation here
        d="M12 5V2L8 6l4 4V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"
        fill={color}
      />
      {/* The text displaying the count. Its coordinates are within the 24x24 viewBox. */}
      <SVGText
        x="12" // Centered horizontally in the 24x24 grid
        y={12 + textYOffset} // Positioned vertically with offset in the 24x24 grid
        textAnchor="middle" // Horizontally align text to its center
        alignmentBaseline="middle" // Vertically align text to its center
        fontSize={calculatedFontSize} // Font size in 24x24 grid units
        fontWeight="600"
        fill={textColor}
      >
        {displayCount}
      </SVGText>
    </AnimatedSvg>
  );
};
