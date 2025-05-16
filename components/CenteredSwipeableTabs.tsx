import { ThemedText } from "@/components/ThemedText"; // Assuming this exists
import { Spacings } from "@/constants/Theme"; // Assuming this exists
import { useThemeColor } from "@/hooks/useThemeColor"; // To use theme colors
import React, { useEffect, useRef, useState } from "react";
import { LayoutChangeEvent, ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from "react-native-reanimated";
import { IconSymbol, IconSymbolName } from "./ui/IconSymbol";

export interface TabConfig {
  key: string;
  title: string;
  icon?: IconSymbolName; // Optional icon key
}

interface TabItemProps {
  title: string;
  icon?: IconSymbolName;
  isActive: boolean;
  onPress: () => void;
  onLayout: (event: LayoutChangeEvent) => void;
  activeColor: string;
  inactiveColor: string;
}

const TabItem: React.FC<TabItemProps> = ({ title, icon, isActive, onPress, onLayout, activeColor, inactiveColor }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withTiming(isActive ? 1.1 : 0.95, { duration: 200 });
    opacity.value = withTiming(isActive ? 1 : 0.7, { duration: 200 });
  }, [isActive, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value,
    };
  });

  const textColor = isActive ? activeColor : inactiveColor;

  return (
    <TouchableOpacity onPress={onPress} style={tabItemStyles.tabButton}>
      <Animated.View onLayout={onLayout} style={[tabItemStyles.tabInner, animatedStyle]}>
        {icon && <IconSymbol name={icon} size={12} color={textColor} />}
        <ThemedText style={[tabItemStyles.tabText, { color: textColor }]}>{title}</ThemedText>
      </Animated.View>
    </TouchableOpacity>
  );
};

const tabItemStyles = StyleSheet.create({
  tabButton: {
    paddingHorizontal: Spacings.sm,
    justifyContent: "center",
    alignItems: "center",
  },
  tabInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
    paddingVertical: Spacings.sm,
    paddingHorizontal: Spacings.xs,
  },
  tabText: {
    fontSize: 16,
    textAlign: "center",
  },
});

interface CenteredSwipeableTabsProps {
  tabs: TabConfig[];
  activeIndex: number;
  tabBackgroundColor?: string;
  tabTextColor?: string;
  tabTextMutedColor?: string;
  onTabPress: (index: number) => void;
}

export const CenteredSwipeableTabs: React.FC<CenteredSwipeableTabsProps> = ({
  tabs,
  activeIndex,
  tabBackgroundColor = "transparent",
  tabTextColor,
  tabTextMutedColor,
  onTabPress,
}) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);

  const backgroundColor = useThemeColor({}, "background");
  const activeTabColor = useThemeColor({}, "text"); // Example: using primary color for active tab text
  const inactiveTabColor = useThemeColor({}, "muted"); // Example: using default text color for inactive tabs

  useEffect(() => {
    if (tabLayouts.length === tabs.length && tabLayouts[activeIndex] && scrollViewRef.current && scrollViewWidth > 0) {
      const activeTabLayout = tabLayouts[activeIndex];
      const targetScrollX = activeTabLayout.x + activeTabLayout.width / 2 - scrollViewWidth / 2;
      scrollViewRef.current.scrollTo({
        x: Math.max(0, targetScrollX), // Ensure scroll position isn't negative
        animated: true,
      });
    }
  }, [activeIndex, tabLayouts, tabs.length, scrollViewWidth]);

  const handleTabLayout = (index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      const newLayouts = [...prev];
      newLayouts[index] = { x, width };
      // Ensure array is full before trying to use it, prevents partial updates
      if (newLayouts.filter((l) => l !== undefined).length === tabs.length) {
        return newLayouts;
      }
      return prev; // Or a more sophisticated way to fill and set
    });
  };

  useEffect(() => {
    // Initialize layouts array
    setTabLayouts(Array(tabs.length).fill(undefined));
  }, [tabs.length]);

  return (
    <View style={[styles.container, { backgroundColor: tabBackgroundColor ?? backgroundColor }]}>
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContentContainer}
        onLayout={(event) => {
          setScrollViewWidth(event.nativeEvent.layout.width);
        }}
      >
        {tabs.map((tab, index) => (
          <TabItem
            key={tab.key}
            title={tab.title}
            icon={tab.icon}
            isActive={index === activeIndex}
            onPress={() => onTabPress(index)}
            onLayout={(event) => handleTabLayout(index, event)}
            activeColor={tabTextColor || activeTabColor}
            inactiveColor={tabTextMutedColor || inactiveTabColor}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 60, // Adjust as needed
  },
  scrollContentContainer: {
    alignItems: "center",
    paddingHorizontal: Spacings.md, // Padding for the scrollable content itself
  },
});
