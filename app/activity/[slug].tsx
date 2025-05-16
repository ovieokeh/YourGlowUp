import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { useSharedValue } from "react-native-reanimated";

import { useGetActivityBySlug } from "@/backend/queries/activities";
import { useAddLog } from "@/backend/queries/logs";
import { ActivityStep, LogCreateInput, LogType } from "@/backend/shared";
import { TabConfig } from "@/components/CenteredSwipeableTabs";
import { CollapsingHeader } from "@/components/CollapsingHeader";
import { ActivityCompletionModal } from "@/components/modals/ActivityCompletionModal";
import { StepCard } from "@/components/StepCard";
import { StepModal } from "@/components/StepModal";
import { TabbedPagerView } from "@/components/TabbedPagerView";
import { ThemedButton } from "@/components/ThemedButton";
import { ThemedFabButton } from "@/components/ThemedFabButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { IconSymbol } from "@/components/ui/IconSymbol";
import { BorderRadii, Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useSound } from "@/utils/sounds";
import { useSearchParams } from "expo-router/build/hooks";
import PagerView from "react-native-pager-view";

const TABS = [{ key: "activity", title: "Activity", icon: "play.circle" }] as TabConfig[];

export default function ActivitySession() {
  const { user } = useAppContext();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const searchParams = useSearchParams();
  const goalId = searchParams.get("goalId") || "";
  const router = useRouter();

  const activityQuery = useGetActivityBySlug(goalId, slug as string);
  const activity = useMemo(() => activityQuery.data, [activityQuery.data]);

  const pagerRef = useRef<PagerView>(null);
  const scrollY = useSharedValue(0);

  const scrollHandler = useCallback(
    (event: any) => {
      scrollY.value = event.nativeEvent.contentOffset.y;
    },
    [scrollY]
  );

  const saveLogMutation = useAddLog(user?.id);
  const { play } = useSound();

  const textColor = useThemeColor({}, "text");
  const background = useThemeColor({}, "background");
  const border = useThemeColor({}, "border");

  const [currentStep, setCurrentStep] = useState<ActivityStep | null>(null);
  const [showStepModal, setShowStepModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const steps = useMemo(() => {
    if (!activity) return [];
    return activity.steps;
  }, [activity]);

  const nextStep = useMemo(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep?.id);
    return steps[currentIndex + 1];
  }, [steps, currentStep?.id]);
  const previousStep = useMemo(() => {
    const currentIndex = steps.findIndex((s) => s.id === currentStep?.id);
    return steps[currentIndex - 1];
  }, [steps, currentStep?.id]);

  const handleNext = () => {
    if (nextStep) {
      setCurrentStep(nextStep);
    } else {
      setShowStepModal(false);
      if (activity?.completionPrompts?.length) {
        setShowCompletionModal(true);
      }
    }
  };
  const handlePrevious = () => {
    if (previousStep) {
      setCurrentStep(previousStep);
    }
  };

  const handleComplete = useCallback(async () => {
    if (!activity || !user?.id) return;

    await saveLogMutation.mutateAsync({
      type: LogType.ACTIVITY,
      userId: user.id,
      goalId,
      activityId: activity.id,
      activityType: activity.type,
    } as LogCreateInput);
    play("complete-exercise");

    router.replace(`/activity-complete?goalId=${goalId}`);
  }, [activity, play, router, saveLogMutation, goalId, user?.id]);

  const renderPageContent = useCallback(
    (tab: TabConfig) => {
      switch (tab.key) {
        case "activity":
          return (
            <View style={{ flex: 1, gap: Spacings.md }}>
              <View
                style={[
                  {
                    padding: Spacings.sm,
                    borderRadius: BorderRadii.sm,
                    marginVertical: Spacings.sm,
                    alignItems: "center",
                    backgroundColor: border,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: Spacings.xs,
                  }}
                >
                  <IconSymbol name="target" size={18} color={textColor} />
                  <ThemedText type="defaultSemiBold">Target Area: {activity?.category}</ThemedText>
                </View>
                <ThemedText>{activity?.description}</ThemedText>
              </View>

              {!!activity?.steps?.length && (
                <View style={{ gap: Spacings.md }}>
                  <ThemedButton
                    title="Mark as Complete"
                    variant="outline"
                    icon="checkmark.circle"
                    onPress={() => {
                      if (activity?.completionPrompts?.length) {
                        setShowCompletionModal(true);
                      } else {
                        handleComplete();
                      }
                    }}
                  />

                  <ThemedText type="subtitle">Steps:</ThemedText>

                  <View style={{ gap: Spacings.md }}>
                    {activity?.steps?.map((step, idx) => (
                      <StepCard
                        key={idx}
                        step={step}
                        handlePress={() => {
                          setCurrentStep(step);
                          setShowStepModal(true);
                        }}
                      />
                    ))}
                  </View>
                </View>
              )}
            </View>
          );
        default:
          return null;
      }
    },
    [activity, textColor, border, handleComplete]
  );

  if (activityQuery.isLoading) {
    return (
      <ThemedView
        style={[
          {
            flex: 1,
            paddingTop: Spacings.md,
            backgroundColor: background,
          },
        ]}
      >
        <Stack.Screen options={{ title: "Loading..." }} />
        <ThemedText>Loading...</ThemedText>
      </ThemedView>
    );
  }

  if (!activity) {
    return (
      <ThemedView
        style={[
          {
            flex: 1,
            paddingTop: Spacings.md,
            backgroundColor: background,
          },
        ]}
      >
        <Stack.Screen options={{ title: "Oops!" }} />
        <ThemedText type="title">Activity not found.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <>
      <CollapsingHeader
        scrollY={scrollY}
        config={{
          title: activity?.name ?? "",
          description: activity?.description,
          backgroundImageUrl: activity?.featuredImage,
        }}
        topLeftContent={
          <ThemedButton
            variant="ghost"
            icon="chevron.backward"
            onPress={() => {
              router.back();
            }}
          />
        }
      />
      <TabbedPagerView
        tabs={TABS}
        activeIndex={0}
        onPageSelected={() => {}}
        scrollHandler={scrollHandler}
        renderPageContent={renderPageContent}
        pagerRef={pagerRef}
        pageContainerStyle={{ flex: 1 }}
        scrollContentContainerStyle={{
          padding: Spacings.md,
          gap: Spacings.lg,
          flexGrow: 1,
        }}
      />

      <ThemedFabButton
        variant="ghost"
        onPress={() => {
          setCurrentStep(steps[0]);
          setShowStepModal(true);
        }}
        icon="play.circle.fill"
        iconSize={54}
        style={{
          right: 0,
        }}
        textStyle={{
          color: textColor,
        }}
      />

      <StepModal
        isVisible={showStepModal}
        step={currentStep}
        index={steps.findIndex((s) => s.id === currentStep?.id)}
        totalSteps={steps.length}
        handleNext={handleNext}
        handlePrevious={handlePrevious}
        setIsVisible={setShowStepModal}
        goalId={goalId}
        activityId={activity.id}
        activityType={activity.type}
      />

      <ActivityCompletionModal
        item={activity}
        isVisible={showCompletionModal}
        handleSkipQuestions={() => {
          setShowCompletionModal(false);
          handleComplete();
        }}
        handleSubmitAnswers={(answers) => {
          setShowCompletionModal(false);
          handleComplete();
        }}
      />
    </>
  );
}
