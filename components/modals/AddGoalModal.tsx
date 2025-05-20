import { useAddGoal, useGetGoalById, useRemoveGoal, useUpdateGoal } from "@/backend/queries/goals";
import { GoalCategory, GoalCompletionType, GoalCreateInput, ISO8601Date } from "@/backend/shared";
import { Spacings } from "@/constants/Theme";
import { useAppContext } from "@/hooks/app/context";
import { useCurrentScrollY } from "@/hooks/useCurrentScrollY";
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, View } from "react-native";
import PagerView from "react-native-pager-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

import { CenteredSwipeableTabs, TabConfig } from "../CenteredSwipeableTabs";
import { CollapsingHeader } from "../CollapsingHeader";
import { PhotoUpload } from "../PhotoUpload";
import { TabbedPagerView } from "../TabbedPagerView";
import { ThemedButton } from "../ThemedButton";
import { ThemedFabButton } from "../ThemedFabButton";
import { ThemedPicker } from "../ThemedPicker";
import { ThemedText } from "../ThemedText";
import { ThemedTextInput } from "../ThemedTextInput";
import { ThemedView } from "../ThemedView";

const TABS = [
  {
    key: "basicInfo",
    title: "Basic Info",
    icon: "info.circle",
  },
  {
    key: "customize",
    title: "Customize",
    icon: "paintbrush",
  },
] as TabConfig[];

interface AddGoalModalProps {
  id?: string;
  isVisible: boolean;
  onRequestClose: () => void;
  onUpsertSuccess: (newId: string) => void;
  onDeleteSuccess?: () => void;
}
export const AddGoalModal = ({
  id,
  isVisible,
  onRequestClose,
  onUpsertSuccess,
  onDeleteSuccess,
}: AddGoalModalProps) => {
  const { user } = useAppContext();

  const defaultForm = useMemo(
    () => ({
      name: "",
      description: "",
      slug: "",
      featuredImage: "",
      category: GoalCategory.SELF_CARE,
      tags: [],
      isPublic: false,
      completionType: GoalCompletionType.INDEFINITE,
      author: {
        id: user?.id ?? "",
        name: user?.user_metadata?.full_name,
        avatarUrl: user?.user_metadata?.avatar_url,
      },
    }),
    [user]
  );
  const userId = useMemo(() => user?.id ?? "", [user?.id]);

  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  const pagerRef = useRef<PagerView>(null);
  const { scrollY, scrollHandler } = useCurrentScrollY(activeIndex, TABS);

  const [goalForm, setGoalForm] = useState<GoalCreateInput>(defaultForm);
  const addGoalMutation = useAddGoal(user?.id);
  const updateGoalMutation = useUpdateGoal(userId);
  const deleteGoalMutation = useRemoveGoal(userId);
  const currentGoal = useGetGoalById(id);

  useEffect(() => {
    if (currentGoal.data) {
      setGoalForm({ ...currentGoal.data });
    }
  }, [currentGoal?.data]);

  const onChange = useCallback((key: keyof GoalCreateInput, value: any) => {
    setGoalForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetForm = useCallback(() => {
    setGoalForm(defaultForm);
    setActiveIndex(0);
    pagerRef.current?.setPage(0);
  }, [defaultForm]);

  const handleSave = useCallback(() => {
    if (!goalForm) return;
    const payload: GoalCreateInput = { ...goalForm, id: currentGoal.data?.id } as GoalCreateInput;
    if (!goalForm.name) {
      Alert.alert("Name is required", "Please enter a name for your goal.");
      return;
    }
    if (goalForm.completionType === GoalCompletionType.DATETIME && !goalForm.completionDate) {
      Alert.alert("Completion date is required", "Please select a completion date.");
      return;
    }
    if (goalForm.completionType === GoalCompletionType.DATETIME && goalForm.completionDate) {
      const date = new Date(goalForm.completionDate);
      if (date.getTime() < Date.now()) {
        Alert.alert("Invalid date", "Please select a future date.");
        return;
      }
    }
    if (goalForm.completionType === GoalCompletionType.INDEFINITE) {
      payload.completionDate = undefined;
    }
    if (goalForm.completionType === GoalCompletionType.ACTIVITY) {
      payload.completionDate = undefined;
    }

    payload.slug = goalForm.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (id) {
      updateGoalMutation
        .mutateAsync({
          goalId: id,
          goal: payload,
        })
        .then(() => {
          Toast.show({ type: "success", text1: `${goalForm.name} updated`, position: "bottom" });
          resetForm();
          onUpsertSuccess(id);
        })
        .catch(() => {
          Alert.alert("Update failed", "Please try again.");
        });
      return;
    }

    addGoalMutation
      .mutateAsync(payload)
      .then((newId) => {
        Toast.show({ type: "success", text1: `${goalForm.name} created`, position: "bottom" });
        resetForm();
        onUpsertSuccess(newId);
      })
      .catch(() => {
        Alert.alert("Creation failed", "Please try again.");
      });
  }, [id, goalForm, addGoalMutation, updateGoalMutation, currentGoal.data?.id, onUpsertSuccess, resetForm]);

  const renderTabContent = useCallback(
    (tab: TabConfig) => {
      switch (tab.key) {
        case "basicInfo":
          return <BasicInfoTab goalForm={goalForm} onChange={onChange} />;
        case "customize":
          return <CustomizeTab goalForm={goalForm} onChange={onChange} />;
        default:
          return null;
      }
    },
    [goalForm, onChange]
  );

  const handleTabPress = useCallback((index: number) => {
    setActiveIndex(index);
    pagerRef.current?.setPage(index);
  }, []);

  const collapsingHeaderConfig = useMemo(
    () => ({
      title: goalForm.name || "Name goes here",
      description: goalForm.description || "Description goes here",
      backgroundImageUrl: goalForm.featuredImage || "",
    }),
    [goalForm]
  );

  const swipeableTabsProps = {
    tabs: TABS,
    activeIndex: activeIndex,
    onTabPress: handleTabPress,
  };

  return (
    <Modal animationType="slide" presentationStyle="pageSheet" visible={isVisible} onRequestClose={onRequestClose}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" keyboardVerticalOffset={insets.top}>
        <ThemedView style={{ flex: 1 }}>
          <CollapsingHeader
            scrollY={scrollY}
            config={collapsingHeaderConfig}
            topRightContent={<ThemedButton variant="solid" title="Save" onPress={handleSave} />}
            topLeftContent={<ThemedButton variant="ghost" icon="xmark" onPress={onRequestClose} />}
            content={
              <CenteredSwipeableTabs
                {...swipeableTabsProps}
                tabBackgroundColor="transparent"
                tabTextColor="#fff"
                tabTextMutedColor="rgba(255,255,255,0.7)"
              />
            }
            isStickyContent
          />

          <TabbedPagerView
            tabs={TABS}
            activeIndex={activeIndex}
            onPageSelected={setActiveIndex}
            scrollHandler={scrollHandler}
            renderPageContent={renderTabContent}
            pagerRef={pagerRef}
            pageContainerStyle={{ flex: 1 }}
            scrollContentContainerStyle={{ paddingBottom: 100 }}
          />

          {id && (
            <ThemedFabButton
              variant="destructive"
              title="Delete"
              icon="trash"
              onPress={() => {
                Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete",
                    style: "destructive",
                    onPress: () => {
                      deleteGoalMutation
                        .mutateAsync(id)
                        .then(() => {
                          Toast.show({ type: "success", text1: `${goalForm.name} deleted`, position: "bottom" });
                          resetForm();
                          onDeleteSuccess?.();
                        })
                        .catch(() => {
                          Alert.alert("Deletion failed", "Please try again.");
                        });
                    },
                  },
                ]);
              }}
              bottom={96}
            />
          )}
        </ThemedView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

interface AddGoalTabProps {
  goalForm: GoalCreateInput;
  onChange: (key: keyof GoalCreateInput, value: any) => void;
}
const BasicInfoTab = ({ goalForm, onChange }: AddGoalTabProps) => {
  return (
    <View style={{ padding: Spacings.md, gap: Spacings.md }}>
      <View style={{ gap: Spacings.sm }}>
        <ThemedText type="defaultSemiBold">Cover Image</ThemedText>
        <PhotoUpload
          photoUri={goalForm.featuredImage ?? ""}
          onPickPhoto={(uri) => onChange("featuredImage", uri?.uri)}
        />
      </View>

      <ThemedTextInput label="Name" value={goalForm.name} onChangeText={(text) => onChange("name", text)} />

      <ThemedTextInput
        label="Description"
        value={goalForm.description}
        onChangeText={(text) => onChange("description", text)}
        numberOfLines={4}
        style={{ height: 100 }}
      />

      <ThemedPicker
        items={Object.values(GoalCategory).map((category) => ({
          label: category,
          value: category,
        }))}
        selectedValue={goalForm.category}
        onValueChange={(itemValue) => onChange("category", itemValue)}
      />

      <ThemedTextListInput label="Tags" value={goalForm.tags} onChange={(value) => onChange("tags", value)} />
    </View>
  );
};

const ThemedBooleanInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) => {
  return (
    <View style={{ gap: Spacings.sm }}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <ThemedButton
        variant={value ? "solid" : "ghost"}
        title={value ? "Yes" : "No"}
        onPress={() => onChange(!value)}
        style={{ alignSelf: "flex-start" }}
      />
    </View>
  );
};

const ThemedTextListInput = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
}) => {
  const [text, setText] = useState("");

  const handleAddTag = () => {
    if (text.trim()) {
      onChange([...value, text]);
      setText("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag));
  };

  return (
    <View style={{ gap: Spacings.sm }}>
      <ThemedText type="defaultSemiBold">{label}</ThemedText>
      <View style={{ flexDirection: "row", gap: Spacings.sm, flexWrap: "wrap" }}>
        {value.map((tag) => (
          <ThemedButton key={tag} variant="ghost" title={tag} onPress={() => handleRemoveTag(tag)} />
        ))}
      </View>
      <ThemedTextInput
        value={text}
        onChangeText={setText}
        onSubmitEditing={handleAddTag}
        placeholder="Add a tag"
        style={{ flex: 1 }}
      />
    </View>
  );
};

const CustomizeTab = ({ goalForm, onChange }: AddGoalTabProps) => {
  return (
    <View style={{ padding: Spacings.md, gap: Spacings.md }}>
      <ThemedBooleanInput
        label="Should others be able to see this goal?"
        value={goalForm.isPublic}
        onChange={(value) => onChange("isPublic", value)}
      />

      <View style={{ gap: Spacings.sm }}>
        <ThemedText type="defaultSemiBold">When should this goal end?</ThemedText>
        <ThemedPicker
          items={Object.values(GoalCompletionType).map((type) => ({
            label:
              type === GoalCompletionType.INDEFINITE
                ? "Runs indefinitely"
                : type === GoalCompletionType.DATETIME
                ? "Ends on a date"
                : "Ends when all activities are completed",
            value: type,
          }))}
          selectedValue={goalForm.completionType}
          onValueChange={(itemValue) => onChange("completionType", itemValue)}
        />
        {goalForm.completionType === GoalCompletionType.DATETIME && (
          <DateTimePicker
            value={goalForm.completionDate ? new Date(goalForm.completionDate) : new Date()}
            mode="date"
            display="default"
            onChange={(event: DateTimePickerEvent, date?: Date) => {
              if (date) {
                onChange("completionDate", date.toISOString() as ISO8601Date);
              }
            }}
          />
        )}
      </View>
    </View>
  );
};
