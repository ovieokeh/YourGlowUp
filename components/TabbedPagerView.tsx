import React from "react";
import { NativeScrollEvent, NativeSyntheticEvent, StyleSheet } from "react-native";
import PagerView, { PagerViewOnPageSelectedEvent } from "react-native-pager-view";
import Animated from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedView } from "./ThemedView";

type TabConfig = { key: string; title: string };

interface TabbedPagerViewProps {
  tabs: TabConfig[];
  activeIndex: number;
  onPageSelected: (position: number) => void;
  scrollHandler: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
  renderPageContent: (tab: TabConfig, index: number) => React.ReactNode;
  pagerRef?: React.RefObject<PagerView | null>;
  pageContainerStyle?: any;
  scrollContentContainerStyle?: any;
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
  const insets = useSafeAreaInsets();
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
    >
      {tabs.map((tab, index) => (
        <ThemedView
          key={tab.key}
          style={[
            styles.pageStyle,
            {
              paddingBottom: insets.bottom,
            },
            pageContainerStyle,
          ]}
        >
          <Animated.ScrollView
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            bounces={false}
            directionalLockEnabled
            overScrollMode="never"
            contentContainerStyle={scrollContentContainerStyle}
          >
            {renderPageContent(tab, index)}
          </Animated.ScrollView>
        </ThemedView>
      ))}
    </PagerView>
  );
};

const styles = StyleSheet.create({
  pagerView: { flex: 1 },
  pageStyle: { flex: 1 },
});
