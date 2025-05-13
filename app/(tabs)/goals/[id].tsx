import { StyleSheet } from "react-native";

import { useGetGoalById, useUpdateGoalActivities } from "@/backend/queries/goals";
import { GoalActivity } from "@/backend/shared";
import { ActivityStepsModal } from "@/components/ActivityStepsModal";
import { TabConfig } from "@/components/CenteredSwipeableTabs";
import {
  CollapsingHeaderConfig,
  CollapsingHeaderWithTabs,
  HeaderContentData,
  TabDisplayConfig,
} from "@/components/CollapsingHeaderWithTabs";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { GoalActivitiesView } from "@/views/goal/activities";
import GoalCommunityView from "@/views/goal/community";
import { GoalStatsScreen } from "@/views/goal/stats";
import * as Haptics from "expo-haptics"; // For haptic feedback
import { router } from "expo-router";
import { useLocalSearchParams } from "expo-router/build/hooks";
import { useCallback, useMemo, useRef, useState } from "react";
import PagerView from "react-native-pager-view";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { key: "activities", title: "Activities", icon: "checkmark.circle" },
  { key: "community", title: "Community", icon: "person.3.sequence" },
  { key: "stats", title: "Stats", icon: "chart.bar" },
] as TabConfig[];

export default function GoalsSingleScreen() {
  const { user } = useAppContext();
  const currentUserId = useMemo(() => user?.id, [user?.id]);
  const { id = "1" } = useLocalSearchParams<{ id: string }>();
  const [showSelector, setShowSelector] = useState(false);

  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const muted = useThemeColor({}, "muted"); // Used for image placeholder
  const backgroundColor = useThemeColor({}, "background"); // For main screen background
  const textColor = useThemeColor({}, "text"); // For text color

  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const initialHeight = 300;
  const collapsedHeight = 40; // Height of the final sticky header bar
  const heroParallaxScrollRange = initialHeight - collapsedHeight;

  // FAB Animation
  const fabAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [0, 50, 150],
      [1, 1.05, 1], // Subtle bounce on initial scroll
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      scrollY.value,
      [heroParallaxScrollRange, heroParallaxScrollRange + 100],
      [0, 10], // Moves down slightly as content scrolls well past hero
      Extrapolation.CLAMP
    );
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  const updateGoalActivities = useUpdateGoalActivities(currentUserId);
  const goalQuery = useGetGoalById(id);
  const goal = useMemo(() => goalQuery.data, [goalQuery.data]);
  const activities = useMemo(() => goalQuery.data?.activities, [goalQuery.data]);
  const activitySlugs = useMemo(() => goal?.activities?.map((activity) => activity.slug) || [], [goal]);

  const onBackPress = useCallback(() => {
    router.back();
  }, []);

  const onPageSelected = useCallback((position: number) => {
    setActiveIndex(position);
  }, []);

  const renderPageContent = useCallback(
    (tab: TabConfig) => {
      if (!goal) return null;
      switch (tab.key) {
        case "activities":
          return <GoalActivitiesView activities={activities} goalId={goal.id} />;
        case "community":
          return <GoalCommunityView />;
        case "stats":
          return <GoalStatsScreen selectedGoalId={goal.id} />;
        default:
          return null;
      }
    },
    [activities, goal]
  );

  if (goalQuery.isLoading) {
    return (
      <ThemedView style={[styles.messageContainer, { backgroundColor: backgroundColor }]}>
        <ThemedText type="title">Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!goal) {
    return (
      <ThemedView style={[styles.messageContainer, { backgroundColor: backgroundColor }]}>
        <ThemedText type="title">Goal not found</ThemedText>
      </ThemedView>
    );
  }

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); // Haptic feedback
  };

  const headerConfig: CollapsingHeaderConfig = {
    initialHeight: 300,
    collapsedHeight: 94, // Typical header height without status bar
    overlayColor: "rgba(0,0,0,0.45)",
    stickyHeaderBackgroundColor: backgroundColor,
    stickyHeaderTextColor: textColor,
    stickyHeaderTextMutedColor: muted,
  };

  const headerContentData: HeaderContentData = {
    title: goal.name,
    description: goal.description,
    imageUrl: goal.featuredImage,
  };

  const tabDisplayConfig: TabDisplayConfig = {
    tabBackgroundColor: "transparent", // For hero section
    tabTextColor: "#fff",
    tabTextMutedColor: "rgba(255, 255, 255, 0.7)",
  };

  return (
    <>
      <ThemedView style={{ flex: 1, backgroundColor: backgroundColor }}>
        <CollapsingHeaderWithTabs
          scrollY={scrollY}
          headerConfig={headerConfig}
          contentData={headerContentData}
          tabsConfig={TABS}
          activeTabIndex={activeIndex}
          onTabPress={handleTabPress}
          onBackPress={onBackPress}
          topInset={insets.top}
          tabDisplayConfig={tabDisplayConfig}
          withTabs
        />

        <TabbedPagerView
          tabs={TABS}
          activeIndex={activeIndex}
          onPageSelected={onPageSelected}
          scrollHandler={scrollHandler}
          renderPageContent={renderPageContent}
          pagerRef={pagerRef}
          pageContainerStyle={styles.pageStyle}
          scrollContentContainerStyle={styles.scrollContentForPage}
        />
      </ThemedView>

      {/* Floating Action Button */}
      <Animated.View style={[styles.fabContainer, fabAnimatedStyle]}>
        <ThemedFabButton
          variant="primary"
          title="Update Activities"
          onPress={() => {
            setShowSelector(true);
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          }}
          icon="pencil"
          iconPlacement="right"
        />
      </Animated.View>

      {/* Modal */}
      <ActivityStepsModal
        visible={showSelector}
        selectedSlugs={activitySlugs}
        onClose={() => setShowSelector(false)}
        onSave={(newActivities: GoalActivity[]) => {
          updateGoalActivities
            .mutateAsync({ goalId: goal.id, activities: newActivities })
            .then(() => {
              setShowSelector(false);
            })
            .catch((error) => {
              console.error("Error updating goal activities", error);
            });
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  messageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacings.lg,
  },
  stickyHeaderBase: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 40, // collapsedHeight
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: Spacings.sm,
    zIndex: 100,
  },
  stickyHeaderBackground: {
    backgroundColor: "rgba(0,0,0,0.65)", // Dark, semi-transparent background
  },
  stickyHeaderText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: Spacings.sm, // Space after back button
    flexShrink: 1, // Allow text to shrink if too long
  },
  heroContainer: {
    overflow: "hidden",
    position: "relative", // Needed for absolute children like image and content
    zIndex: 1, // Above PagerView initially, but below stickyHeader
  },
  heroBackButtonContainer: {
    position: "absolute",
    left: Spacings.xs,
    zIndex: 2, // Above image overlay
  },
  backButtonPressable: {
    padding: Spacings.sm, // Increased tap area
    marginRight: Spacings.xs, // Align with sticky header text margin
  },
  heroImageWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden", // Clip the parallaxing image
  },
  heroContentContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacings.md,
    paddingBottom: Spacings.xs,
    zIndex: 1, // Above image overlay, below heroBackButton
  },
  heroTitleText: {
    fontSize: 24, // Slightly larger for impact
    fontWeight: "bold", // Bolder
    color: "#fff",
    marginBottom: Spacings.xs,
    textShadowColor: "rgba(0, 0, 0, 0.3)", // Subtle shadow for better readability
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  heroDescriptionText: {
    fontSize: 15, // Slightly larger
    color: "rgba(235, 235, 245, 0.9)", // Lighter, slightly transparent white
    marginTop: Spacings.xs,
    marginBottom: Spacings.md, // More space before tabs
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  tabsWrapperInHero: {
    paddingTop: Spacings.sm, // Was xl, adjusted for tighter look if needed
  },
  pagerView: {
    flex: 1, // Takes remaining space after hero
  },
  pageStyle: {
    flex: 1,
    // backgroundColor: backgroundColor, // ensure pages have consistent background
  },
  scrollContentForPage: {
    padding: Spacings.md,
    paddingBottom: Spacings.xl * 7, // Increased to ensure content well above FAB
    gap: Spacings.lg, // Spacing between items in the scroll view
    flexGrow: 1, // Ensures content can fill if short, while still allowing scroll for long content
  },
  fabContainer: {
    position: "absolute",
    right: 0,
    bottom: Spacings.xxl, // Common FAB position (e.g. 96px)
    zIndex: 200,
  },
});
