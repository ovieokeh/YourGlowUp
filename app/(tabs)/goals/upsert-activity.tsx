import { useAddActivity, useGetActivityById, useUpdateActivity } from "@/backend/queries/activities";
import { useGetGoalById } from "@/backend/queries/goals";
import { Activity, ActivityCreateInput, GoalCategory, NotificationRecurrence } from "@/backend/shared";
import { CenteredSwipeableTabs, TabConfig } from "@/components/CenteredSwipeableTabs";
import { CollapsingHeader } from "@/components/CollapsingHeader";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { Spacings } from "@/constants/Theme";
import { useCurrentScrollY } from "@/hooks/useCurrentScrollY";
import { useThemeColor } from "@/hooks/useThemeColor";
import { ActivityEditBasicInfo } from "@/views/activities/edit-basic-info";
import { ActivityEditDependencies } from "@/views/activities/edit-dependencies";
import { ActivityEditSchedules } from "@/views/activities/edit-schedules";
import { ActivityEditSteps } from "@/views/activities/edit-steps";
import { invariant } from "es-toolkit";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import Toast from "react-native-toast-message";

const TABS: TabConfig[] = [
  { key: "basicInfo", title: "Basic Info" },
  { key: "steps", title: "Steps" },
  { key: "dependencies", title: "Dependencies" },
  { key: "schedule", title: "Schedule" },
];

export default function UpsertActivityScreen() {
  const params = useLocalSearchParams<{ activityId: string; goalId: string }>();
  const id = params.activityId || "";
  const goalId = params.goalId || "";
  invariant(goalId, "goalId is required");

  const backgroundColor = useThemeColor({}, "background");

  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollY, scrollHandler } = useCurrentScrollY(activeIndex, TABS);

  const pagerRef = useRef<PagerView>(null);

  const activityQuery = useGetActivityById(id);
  const updateItemMutation = useUpdateActivity(goalId);
  const goalQuery = useGetGoalById(goalId);
  const addItemMutation = useAddActivity(goalId);

  const activities = useMemo(() => goalQuery.data?.activities || [], [goalQuery.data]);
  const originalActivity = activityQuery.data;

  const [activityForm, setActivityForm] = useState<ActivityCreateInput>({
    slug: "",
    name: "",
    description: "",
    category: GoalCategory.SELF_CARE,
    notificationsEnabled: false,
    featuredImage: "",
    reliesOn: [],
    steps: [],
    schedules: [],
    recurrence: NotificationRecurrence.DAILY,
  });

  useEffect(() => {
    if (originalActivity) {
      setActivityForm({
        ...originalActivity,
        schedules: originalActivity.schedules ?? [],
        steps: originalActivity.steps ?? [],
      });
    }
  }, [originalActivity]);

  const onChange = useCallback((key: keyof ActivityCreateInput, value: any) => {
    setActivityForm((prev) => prev && { ...prev, [key]: value });
  }, []);

  const handleSave = useCallback(() => {
    if (!activityForm) return;
    if (
      activityForm.recurrence === NotificationRecurrence.WEEKLY &&
      activityForm.schedules?.some((s) => !s.dayOfWeek)
    ) {
      Toast.show({ type: "error", text1: "Weekly schedules must specify a day.", position: "bottom" });
      return;
    }
    if (originalActivity?.id) {
      const payload: Activity = { ...activityForm, id: originalActivity.id } as Activity;
      updateItemMutation
        .mutateAsync(payload)
        .then(() => {
          Toast.show({ type: "success", text1: `${activityForm.name} updated`, position: "bottom" });
          router.back();
        })
        .catch(() => {
          Toast.show({ type: "error", text1: "Update failed", text2: "Please try again.", position: "bottom" });
        });
    } else {
      addItemMutation
        .mutateAsync(activityForm)
        .then(() => {
          Toast.show({ type: "success", text1: `${activityForm.name} created`, position: "bottom" });
          router.back();
        })
        .catch(() => {
          Toast.show({ type: "error", text1: "Creation failed", text2: "Please try again.", position: "bottom" });
        });
    }
  }, [activityForm, originalActivity, updateItemMutation, addItemMutation]);

  const handleTabPress = useCallback((index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  }, []);

  const possibleDependencies = React.useMemo(() => {
    if (!activityForm || !originalActivity) return activities;
    const idx = activities.findIndex((a) => a.slug === originalActivity.slug);
    return activities.slice(0, idx).filter((a) => !activityForm.steps.some((s) => s.slug === a.slug));
  }, [activityForm, activities, originalActivity]);

  const renderPageContent = useCallback(
    (tab: TabConfig) => {
      switch (tab.key) {
        case "basicInfo":
          return (
            <ActivityEditBasicInfo
              name={activityForm?.name}
              description={activityForm?.description}
              featuredImage={activityForm?.featuredImage}
              onChange={onChange}
            />
          );
        case "steps":
          return <ActivityEditSteps steps={activityForm?.steps} onChange={onChange} />;
        case "dependencies":
          return (
            <ActivityEditDependencies
              reliesOn={activityForm?.reliesOn}
              possibleDependencies={possibleDependencies}
              activities={activities}
              onChange={onChange}
            />
          );
        case "schedule":
          return (
            <ActivityEditSchedules
              schedules={activityForm?.schedules}
              recurrence={activityForm?.recurrence}
              onChange={onChange}
            />
          );
        default:
          return null;
      }
    },
    [activityForm, possibleDependencies, activities, onChange]
  );

  const headerContentData = React.useMemo(
    () => ({
      title: activityForm?.name || "New Activity",
      description: activityForm?.description || "Description goes here",
      backgroundImageUrl: activityForm?.featuredImage,
    }),
    [activityForm]
  );

  const swipeableTabsProps = useMemo(
    () => ({
      tabs: TABS,
      activeIndex: activeIndex,
      onTabPress: handleTabPress,
    }),
    [activeIndex, handleTabPress]
  );

  if (activityQuery.isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText type="default">Loading Activity...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ThemedView style={{ flex: 1, backgroundColor }}>
          <CollapsingHeader
            scrollY={scrollY}
            config={headerContentData}
            topLeftContent={
              <ThemedButton
                variant="ghost"
                icon="chevron.backward"
                onPress={() => {
                  router.back();
                }}
              />
            }
            content={<CenteredSwipeableTabs {...swipeableTabsProps} />}
            isStickyContent
          />
          <TabbedPagerView
            tabs={TABS}
            activeIndex={activeIndex}
            onPageSelected={setActiveIndex}
            scrollHandler={scrollHandler}
            renderPageContent={renderPageContent}
            pagerRef={pagerRef}
            pageContainerStyle={styles.pageStyle}
            scrollContentContainerStyle={styles.scrollContentForPage}
          />
        </ThemedView>
        <ThemedFabButton variant="primary" title="Update Activity" icon="checkmark" onPress={handleSave} bottom={96} />
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: Spacings.md, justifyContent: "center", alignItems: "center" },
  link: { marginTop: Spacings.md, paddingVertical: Spacings.sm },
  pageStyle: { flex: 1 },
  scrollContentForPage: { padding: Spacings.md, paddingBottom: Spacings.xl * 5 },
});
