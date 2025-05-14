import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { CenteredSwipeableTabs, TabConfig } from "@/components/CenteredSwipeableTabs";
import { CollapsingHeader, CollapsingHeaderConfig, HeaderContentData } from "@/components/CollapsingHeader";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useCurrentScrollY } from "@/hooks/useCurrentScrollY";
import { useThemeColor } from "@/hooks/useThemeColor";
import { MyGoalsView } from "@/views/goals/my-goals";
import { View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { key: "my-goals", title: "My Goals", icon: "person.circle" },
  { key: "explore", title: "Explore", icon: "globe" },
] as TabConfig[];

export default function GoalsScreen() {
  const { goals } = useAppContext();
  const router = useRouter();
  const gray10 = useThemeColor({}, "gray10"); // For card background

  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const insets = useSafeAreaInsets();

  const { scrollY, scrollHandler } = useCurrentScrollY(activeIndex, TABS);

  const onTabPress = useCallback(
    (index: number) => {
      if (pagerRef.current) {
        pagerRef.current.setPage(index);
      }
    },
    [pagerRef]
  );

  const renderPageContent = useCallback(
    (tab: TabConfig) => {
      switch (tab.key) {
        case "my-goals":
          return (
            <View style={{ marginBottom: 56 }}>
              <MyGoalsView goals={goals} />
            </View>
          );
        case "explore":
          return null;
        default:
          return null;
      }
    },
    [goals]
  );

  const headerConfig: CollapsingHeaderConfig = {
    initialHeight: 240,
    collapsedHeight: 94,
    overlayColor: "rgba(0,0,0,0.45)",
    backgroundColor: gray10,
  };

  const headerContentData: HeaderContentData = {
    title: "Goals",
    description: "Explore and manage your goals",
    imageUrl: undefined,
  };

  const swipeableTabsProps = useMemo(
    () => ({
      tabs: TABS,
      activeIndex: activeIndex,
      onTabPress: onTabPress,
    }),
    [activeIndex, onTabPress]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <CollapsingHeader
        scrollY={scrollY}
        headerConfig={headerConfig}
        contentData={headerContentData}
        actionRightContent={
          <ThemedButton
            title="Add Goal"
            onPress={() => {
              router.push("/(tabs)/goals/add");
            }}
            variant="solid"
            icon="plus.circle"
            style={{ marginRight: Spacings.md }}
          />
        }
        topInset={insets.top}
        content={
          <CenteredSwipeableTabs
            {...swipeableTabsProps}
            tabBackgroundColor="transparent"
            tabTextColor="#fff"
            tabTextMutedColor="rgba(255,255,255,0.7)"
          />
        }
        stickyContent={
          <CenteredSwipeableTabs
            {...swipeableTabsProps}
            tabBackgroundColor={"transparent"}
            tabTextColor={headerConfig.stickyHeaderTextColor || "#fff"}
            tabTextMutedColor={headerConfig.stickyHeaderTextMutedColor || "rgba(255,255,255,0.7)"}
          />
        }
      />
      <TabbedPagerView
        tabs={TABS}
        activeIndex={activeIndex}
        onPageSelected={setActiveIndex}
        scrollHandler={scrollHandler}
        renderPageContent={renderPageContent}
        pagerRef={pagerRef}
        scrollContentContainerStyle={{ flexGrow: 1 }}
      />
    </ThemedView>
  );
}
