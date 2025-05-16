import { useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CenteredSwipeableTabs, TabConfig } from "@/components/CenteredSwipeableTabs";
import { CollapsingHeader } from "@/components/CollapsingHeader";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { ThemedView } from "@/components/ThemedView";
import { useAppContext } from "@/hooks/app/context";
import { useCurrentScrollY } from "@/hooks/useCurrentScrollY";
import { ProgressLogsView } from "@/views/progress/logs";
import { ProgressPhotoView } from "@/views/progress/photos";
import { ProgressStatsView } from "@/views/progress/stats";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { key: "stats", title: "Stats", icon: "chart.xyaxis.line" },
  { key: "photos", title: "Photos", icon: "calendar" },
  { key: "logs", title: "Logs", icon: "book" },
] as TabConfig[];

export default function ProgressScreen() {
  const { user, goals, selectedGoalId } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);

  const params = useLocalSearchParams();
  const [selectedGoal, setSelectedGoal] = useState<string | undefined>(selectedGoalId);

  const goalOptions = useMemo(
    () =>
      goals?.map((goal) => ({
        label: goal.name,
        value: goal.id,
      })) ?? [],
    [goals]
  );

  useEffect(() => {
    if (goalOptions.length > 0 && !selectedGoal) {
      setSelectedGoal(goalOptions[0].value);
    }
  }, [goalOptions, selectedGoal]);

  const insets = useSafeAreaInsets();
  const initialTabIndex = params.activeTab === "Photos" ? 2 : 0;
  const [activeIndex, setActiveIndex] = useState(initialTabIndex);
  const { scrollY, scrollHandler } = useCurrentScrollY(activeIndex, TABS);
  const pagerRef = useRef<PagerView>(null);

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
        case "stats":
          return <ProgressStatsView selectedGoalId={selectedGoal} />;
        case "logs":
          return <ProgressLogsView userId={currentUserId} selectedGoalId={selectedGoal} />;
        case "photos":
          return <ProgressPhotoView />;
        default:
          return null;
      }
    },
    [currentUserId, selectedGoal]
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <CollapsingHeader
        scrollY={scrollY}
        config={{
          title: "Analytics",
          description: "Track your progress and stay motivated",
          initialHeroHeight: 140,
        }}
        content={
          <CenteredSwipeableTabs
            tabs={TABS}
            activeIndex={activeIndex}
            onTabPress={onTabPress}
            tabBackgroundColor="transparent"
            tabTextColor="#fff"
            tabTextMutedColor="rgba(255,255,255,0.7)"
          />
        }
      />
      <TabbedPagerView
        tabs={TABS}
        activeIndex={activeIndex}
        onPageSelected={setActiveIndex}
        scrollHandler={scrollHandler}
        pagerRef={pagerRef}
        renderPageContent={renderPageContent}
        scrollContentContainerStyle={{ flexGrow: 1 }}
      />
    </ThemedView>
  );
}
