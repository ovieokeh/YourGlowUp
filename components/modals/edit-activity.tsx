import { useGetActivityById, useUpdateActivity } from "@/backend/queries/activities";
import { useGetGoalById } from "@/backend/queries/goals";
import { ActivityCreateInput, GoalActivity, NotificationRecurrence } from "@/backend/shared";
import { CenteredSwipeableTabs, TabConfig } from "@/components/CenteredSwipeableTabs";
import { CollapsingHeader, CollapsingHeaderConfig, HeaderContentData } from "@/components/CollapsingHeader";
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
import { Link, router, Tabs } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Modal, StyleSheet } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const TABS: TabConfig[] = [
  { key: "basicInfo", title: "Basic Info" },
  { key: "steps", title: "Steps" },
  { key: "dependencies", title: "Dependencies" },
  { key: "schedule", title: "Schedule" },
];

interface EditActivityModalProps {
  id: string;
  goalId: string;
}
export const EditActivityModal: React.FC<EditActivityModalProps> = ({ id, goalId }) => {
  const insets = useSafeAreaInsets();
  const backgroundColor = useThemeColor({}, "background");
  const muted = useThemeColor({}, "muted");

  const [activeIndex, setActiveIndex] = useState(0);
  const { scrollY, scrollHandler } = useCurrentScrollY(activeIndex, TABS);

  const pagerRef = useRef<PagerView>(null);

  const activityQuery = useGetActivityById(id);
  const updateItemMutation = useUpdateActivity(goalId);
  const goalQuery = useGetGoalById(goalId);

  const activities = useMemo(() => goalQuery.data?.activities || [], [goalQuery.data]);
  const originalActivity = activityQuery.data;

  const [activityForm, setActivityForm] = useState<ActivityCreateInput>();

  useEffect(() => {
    if (originalActivity) {
      setActivityForm({ ...originalActivity, schedules: originalActivity.schedules ?? [] });
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
    const payload: GoalActivity = { ...activityForm, id: originalActivity!.id } as GoalActivity;
    updateItemMutation
      .mutateAsync(payload)
      .then(() => {
        Toast.show({ type: "success", text1: `${activityForm.name} updated`, position: "bottom" });
        router.back();
      })
      .catch(() => {
        Toast.show({ type: "error", text1: "Update failed", text2: "Please try again.", position: "bottom" });
      });
  }, [activityForm, originalActivity, updateItemMutation]);

  const handleTabPress = useCallback((index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  }, []);

  const possibleDependencies = React.useMemo(() => {
    if (!activityForm || !originalActivity) return [];
    const idx = activities.findIndex((a) => a.slug === originalActivity.slug);
    return activities.slice(0, idx).filter((a) => !activityForm.steps.some((s) => s.slug === a.slug));
  }, [activityForm, activities, originalActivity]);

  const renderPageContent = useCallback(
    (tab: TabConfig) => {
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
    },
    [activityForm, possibleDependencies, activities, onChange]
  );

  const headerConfig: CollapsingHeaderConfig = React.useMemo(
    () => ({
      initialHeight: 280,
      collapsedHeight: 94,
      overlayColor: "rgba(0,0,0,0.45)",
      stickyHeaderTextMutedColor: muted,
    }),
    [muted]
  );

  const headerContentData: HeaderContentData = React.useMemo(
    () => ({
      title: activityForm?.name || "",
      description: activityForm?.description,
      imageUrl: activityForm?.featuredImage,
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

  if (!originalActivity || !activityForm) {
    return (
      <>
        <Tabs.Screen options={{ title: "Activity Not Found" }} />
        <ThemedView style={styles.container}>
          <ThemedText type="title">Activity not found.</ThemedText>
          <Link href="/" style={styles.link}>
            <ThemedText type="link">Go to home screen</ThemedText>
          </Link>
        </ThemedView>
      </>
    );
  }

  return (
    <Modal animationType="slide" presentationStyle="pageSheet">
      <ThemedView style={{ flex: 1, backgroundColor }}>
        <CollapsingHeader
          scrollY={scrollY}
          headerConfig={headerConfig}
          contentData={headerContentData}
          actionLeftContent={
            <ThemedButton
              variant="ghost"
              icon="chevron.backward"
              onPress={() => {
                router.back();
              }}
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
              tabBackgroundColor={headerConfig.stickyHeaderBackgroundColor || "transparent"}
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
          pageContainerStyle={styles.pageStyle}
          scrollContentContainerStyle={styles.scrollContentForPage}
        />
      </ThemedView>
      <ThemedFabButton variant="primary" title="Update Activity" icon="checkmark" onPress={handleSave} bottom={96} />
    </Modal>
  );
};

const styles = StyleSheet.create({
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { flex: 1, padding: Spacings.md, justifyContent: "center", alignItems: "center" },
  link: { marginTop: Spacings.md, paddingVertical: Spacings.sm },
  pageStyle: { flex: 1 },
  scrollContentForPage: { padding: Spacings.md, paddingBottom: Spacings.xl * 5 },
});
