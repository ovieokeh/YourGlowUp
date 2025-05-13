import { invariant } from "es-toolkit";
import { Link, router, Stack, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import "react-native-get-random-values";
import PagerView from "react-native-pager-view";

import { useGetActivityById, useUpdateActivity } from "@/backend/queries/activities";
import { ActivityCreateInput, ActivityScheduleEntry, GoalActivity, NotificationRecurrence } from "@/backend/shared";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";

import { useGetGoalById } from "@/backend/queries/goals";
import { ActivityEditBasicInfo } from "@/views/activities/edit-basic-info";
import { ActivityEditDependencies } from "@/views/activities/edit-dependencies";
import { ActivityEditSchedules } from "@/views/activities/edit-schedules";
import { ActivityEditSteps } from "@/views/activities/edit-steps";
import Toast from "react-native-toast-message";

import { TabConfig } from "@/components/CenteredSwipeableTabs"; // Adjust path as needed
import {
  CollapsingHeaderConfig,
  CollapsingHeaderWithTabs,
  HeaderContentData,
  TabDisplayConfig,
} from "@/components/CollapsingHeaderWithTabs";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAnimatedScrollHandler, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TABS = [
  { key: "basicInfo", title: "Basic Info" },
  { key: "steps", title: "Steps" },
  { key: "dependencies", title: "Dependencies" },
  { key: "schedule", title: "Schedule" },
] as TabConfig[];

export default function EditGoalActivityScreen() {
  const params = useLocalSearchParams<{ activityId: string; goalId: string }>();
  const id = params.activityId || "";
  const goalId = params.goalId || "";
  invariant(id, "activityId is required");
  invariant(goalId, "goalId is required");

  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });
  const insets = useSafeAreaInsets();

  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const muted = useThemeColor({}, "muted");

  const [activityForm, setActivityForm] = useState<ActivityCreateInput | undefined>(undefined);

  const activityQuery = useGetActivityById(id);
  const originalActivity = useMemo(() => activityQuery.data, [activityQuery.data]);

  const updateItemMutation = useUpdateActivity(goalId);
  const goalQuery = useGetGoalById(goalId);
  const activities = useMemo(() => goalQuery.data?.activities, [goalQuery.data]);

  useEffect(() => {
    if (originalActivity) {
      const schedulesInputFormat =
        originalActivity.schedules?.map((s) => ({
          timeOfDay: s.timeOfDay,
          dayOfWeek: s.dayOfWeek,
        })) ?? [];

      setActivityForm({
        ...originalActivity,
        schedules: schedulesInputFormat,
      });
    }
  }, [originalActivity]);

  const possibleDependencies = useMemo(() => {
    if (!activityForm || !originalActivity) return [];
    const indexOfCurrentActivity = activities?.findIndex((activity) => activity.slug === originalActivity.slug);
    if (indexOfCurrentActivity === undefined || indexOfCurrentActivity === -1) return [];
    const deps = activities?.slice(0, indexOfCurrentActivity);
    return deps?.filter((activity) => {
      const isNotCurrentActivity = activity.slug !== originalActivity.slug;
      const isNotAlreadyInSteps = !activityForm.steps.some((step) => step.slug === activity.slug);
      return isNotCurrentActivity && isNotAlreadyInSteps;
    });
  }, [activityForm, activities, originalActivity]);

  const onPageSelected = useCallback((position: number) => {
    setActiveIndex(position);
  }, []);

  if (activityQuery.isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="default">Loading Activity...</ThemedText>
      </ThemedView>
    );
  }

  if (!originalActivity || !activityForm) {
    return (
      <>
        <Stack.Screen options={{ title: "Activity Not Found" }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Activity not found.</ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedText type="link">Go to home screen</ThemedText>
          </Link>
        </ThemedView>
      </>
    );
  }

  const onChange = (key: keyof ActivityCreateInput, value: any) => {
    setActivityForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        [key]: value,
      };
    });
  };

  const handleSave = () => {
    if (!activityForm) return;

    if (activityForm.recurrence === NotificationRecurrence.WEEKLY) {
      const hasInvalidWeeklySchedule = activityForm.schedules?.some(
        (s) => s.dayOfWeek === undefined || s.dayOfWeek === null
      );
      if (hasInvalidWeeklySchedule) {
        Toast.show({
          type: "error",
          text1: "Weekly schedules must specify a day.",
          position: "bottom",
        });
        return;
      }
    }

    const payload: GoalActivity = {
      ...activityForm,
      id: originalActivity.id,
      schedules: activityForm.schedules as ActivityScheduleEntry[],
    } as GoalActivity;

    updateItemMutation
      .mutateAsync(payload)
      .then(() => {
        Toast.show({
          type: "success",
          text1: `${activityForm.name} updated`,
          position: "bottom",
        });
        router.back();
      })
      .catch((err) => {
        console.error("Update failed:", err);
        Toast.show({
          type: "error",
          text1: "Update failed",
          text2: "Please try again.",
          position: "bottom",
        });
      });
  };

  const handleTabPress = (index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  };

  const renderPageContent = (tab: TabConfig) => {
    if (!activityForm) return null;

    switch (tab.key) {
      case "basicInfo":
        return (
          <ActivityEditBasicInfo
            name={activityForm.name}
            description={activityForm.description}
            featuredImage={activityForm.featuredImage}
            onChange={onChange}
          />
        );
      case "steps":
        return <ActivityEditSteps steps={activityForm.steps} onChange={onChange} />;
      case "dependencies":
        return (
          <ActivityEditDependencies
            reliesOn={activityForm.reliesOn}
            possibleDependencies={possibleDependencies}
            activities={activities}
            onChange={onChange}
          />
        );
      case "schedule":
        return (
          <ActivityEditSchedules
            schedules={activityForm.schedules}
            recurrence={activityForm.recurrence}
            onChange={onChange}
          />
        );
      default:
        return null;
    }
  };

  const headerConfig: CollapsingHeaderConfig = {
    initialHeight: 280,
    collapsedHeight: 94, // Typical header height without status bar
    overlayColor: "rgba(0,0,0,0.45)",
    stickyHeaderBackgroundColor: backgroundColor,
    stickyHeaderTextColor: textColor,
    stickyHeaderTextMutedColor: muted,
  };

  const headerContentData: HeaderContentData = {
    title: activityForm?.name || "",
    description: activityForm?.description,
    imageUrl: activityForm?.featuredImage,
  };

  const tabDisplayConfig: TabDisplayConfig = {
    tabBackgroundColor: "transparent", // For hero section
    tabTextColor: "#fff",
    tabTextMutedColor: "rgba(255, 255, 255, 0.7)",
  };

  return (
    <ThemedView style={styles.flexContainer}>
      <Stack.Screen
        options={{
          title: `Edit ${activityForm.name || "Activity"}`,
          headerRight: () => <ThemedButton title="Save" onPress={handleSave} disabled={updateItemMutation.isPending} />,
        }}
      />

      <CollapsingHeaderWithTabs
        scrollY={scrollY}
        headerConfig={headerConfig}
        contentData={headerContentData}
        tabsConfig={TABS}
        activeTabIndex={activeIndex}
        onTabPress={handleTabPress}
        onBackPress={() => router.back()}
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
  );
}

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Spacings.md,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    marginTop: Spacings.md,
    paddingVertical: Spacings.sm,
  },
  pagerView: {
    flex: 1,
  },
  pageStyle: {
    flex: 1,
  },
  scrollContentForPage: {
    flex: 1,
    paddingTop: 0,
    padding: Spacings.md,
    paddingBottom: Spacings.xl,
    gap: Spacings.xl,
  },
});
