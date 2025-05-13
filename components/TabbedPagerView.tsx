// TabbedPagerView.tsx
import React from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import PagerView, { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import Animated from "react-native-reanimated";

// --- Placeholder types (replace with your actual implementations) ---
type TabConfig = { key: string; title: string };
// --- End Placeholder ---

interface TabbedPagerViewProps {
  tabs: TabConfig[];
  activeIndex: number;
  onPageSelected: (position: number) => void;
  /**
   * The scroll handler from `useAnimatedScrollHandler` in the parent screen.
   * This will be attached to each tab's internal Animated.ScrollView.
   */
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void; // More specific type
  renderPageContent: (tab: TabConfig, index: number) => React.ReactNode;
  pagerRef?: React.RefObject<PagerView | null>;
  pageContainerStyle?: StyleProp<ViewStyle>; // Style for the <View> wrapping each page in PagerView
  scrollContentContainerStyle?: StyleProp<ViewStyle>; // Style for the contentContainer of Animated.ScrollView
}

export const TabbedPagerView: React.FC<TabbedPagerViewProps> = ({
  tabs,
  activeIndex,
  onPageSelected,
  scrollHandler,
  renderPageContent,
  pagerRef,
  pageContainerStyle,
  scrollContentContainerStyle,
}) => {
  const handlePageSelected = (e: PagerViewOnPageSelectedEvent) => {
    onPageSelected(e.nativeEvent.position);
  };

  return (
    <PagerView
      ref={pagerRef}
      style={styles.pagerView}
      initialPage={activeIndex}
      onPageSelected={handlePageSelected}
      orientation="horizontal"
      // offscreenPageLimit={tabs.length > 1 ? tabs.length -1 : 1} // Keep all pages mounted for smoother scrollY sharing
    >
      {tabs.map((tab, index) => (
        <View key={tab.key} style={[styles.pageStyle, pageContainerStyle]}>
          <Animated.ScrollView
            onScroll={scrollHandler} // Critical: Attach the shared scroll handler
            scrollEventThrottle={16} // Standard for smooth scroll tracking
            contentContainerStyle={scrollContentContainerStyle}
            bounces={false} // As per original
            overScrollMode={Platform.OS === "android" ? "never" : undefined} // As per original
            showsVerticalScrollIndicator={false} // As per original
          >
            {renderPageContent(tab, index)}
          </Animated.ScrollView>
        </View>
      ))}
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pagerView: {
    flex: 1, // Takes remaining space
  },
  pageStyle: {
    flex: 1, // Each page should fill the PagerView
    // backgroundColor: can be set by parent or via pageContainerStyle
  },
  // scrollContentContainerStyle is passed as a prop
});
