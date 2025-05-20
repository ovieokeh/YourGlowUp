import { useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";

import { CenteredSwipeableTabs, TabConfig } from "@/components/CenteredSwipeableTabs";
import { CollapsingHeader } from "@/components/CollapsingHeader";
import { AddGoalModal } from "@/components/modals/AddGoalModal";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useCurrentScrollY } from "@/hooks/useCurrentScrollY";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GoalsExploreView } from "@/views/goals/explore";
import { MyGoalsView } from "@/views/goals/my-goals";
import { useSearchParams } from "expo-router/build/hooks";
import { View } from "react-native";
import PagerView from "react-native-pager-view";

const TABS = [
  { key: "my-goals", title: "My Goals", icon: "person.circle" },
  { key: "explore", title: "Explore", icon: "globe" },
] as TabConfig[];

export default function GoalsScreen() {
  const { goals, user } = useAppContext();
  const router = useRouter();
  const params = useSearchParams();
  const activeTab = (params.get("activeTab") as string) || "my-goals";

  const textColor = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");

  const [isAddModalVisible, setAddModalVisible] = useState(false);

  const [activeIndex, setActiveIndex] = useState(TABS.findIndex((tab) => tab.key === activeTab));
  const pagerRef = useRef<PagerView>(null);

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
          return (
            <View style={{ padding: Spacings.md, marginBottom: 56 }}>
              <GoalsExploreView />
            </View>
          );
        default:
          return null;
      }
    },
    [goals]
  );

  const onSubmit = useCallback(
    (goalId: string) => {
      setAddModalVisible(false);
      router.push(`/(tabs)/goals/${goalId}`);
    },
    [router]
  );
  const onRequestClose = useCallback(() => {
    setAddModalVisible(false);
  }, []);

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
        config={{
          title: "Set and track your goals",
          initialHeroHeight: 120,
        }}
        contentHeight={-10}
        topRightContent={
          <ThemedButton
            onPress={() => {
              setAddModalVisible(true);
            }}
            variant="ghost"
            icon="plus"
          />
        }
        content={
          <CenteredSwipeableTabs
            {...swipeableTabsProps}
            tabBackgroundColor="transparent"
            tabTextColor={textColor}
            tabTextMutedColor={muted}
          />
        }
        isStickyContent
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
      {user && (
        <AddGoalModal isVisible={isAddModalVisible} onRequestClose={onRequestClose} onUpsertSuccess={onSubmit} />
      )}
    </ThemedView>
  );
}
