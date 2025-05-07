import { useThemeColor } from "@/hooks/useThemeColor";
import { RoutineTaskItem } from "@/queries/routines/routines";
import { useMemo } from "react";
import { Pressable, StyleSheet, View } from "react-native";

import { BorderRadii, Spacings } from "@/constants/Theme";
import { useGetLogsByTask, useSaveTaskLog } from "@/queries/logs";
import Toast from "react-native-toast-message";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

interface TaskCardProps {
  item: RoutineTaskItem;
  allowCompletion?: boolean;
  handlePress: () => void;
}

export const TaskCard = ({ item, allowCompletion, handlePress }: TaskCardProps) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");

  const logsByTaskQuery = useGetLogsByTask(item.name);
  const logs = useMemo(() => logsByTaskQuery.data || [], [logsByTaskQuery.data]);

  const saveTaskLogMutation = useSaveTaskLog();

  const handleTaskCompletion = async () => {
    await saveTaskLogMutation.mutateAsync(item.name);
    Toast.show({
      type: "success",
      text1: "Task completed",
      text2: `You have completed ${item.name} today`,
      position: "bottom",
    });
  };

  const todayLogs = useMemo(() => {
    const today = new Date().toISOString().split("T")[0];
    return logs.filter((log) => log.completedAt.startsWith(today));
  }, [logs]);

  const hasTodayLogs = todayLogs.length > 0;

  return (
    <Pressable
      style={[styles.card, { backgroundColor: cardBg, borderColor: hasTodayLogs ? successColor : cardBorder }]}
      onPress={handlePress}
    >
      <View
        style={{
          padding: Spacings.sm,
        }}
      >
        <ThemedText style={styles.exerciseArea}>{item.area}</ThemedText>
        <View style={styles.row}>
          {item.notificationTimes?.length ? (
            <View style={styles.row}>
              <IconSymbol name={"alarm"} size={16} color={textColor} />
              {item.notificationTimes.slice(0, 3).map((time, index) => (
                <View style={styles.row} key={time + index}>
                  {index % 2 === 0 ? null : <ThemedText>-</ThemedText>}
                  <ThemedText style={styles.description}>{time}</ThemedText>
                </View>
              ))}
              {item.notificationTimes.length > 3 ? (
                <ThemedText style={styles.description}>+{item.notificationTimes.length - 3} more</ThemedText>
              ) : null}
            </View>
          ) : null}
        </View>
        <ThemedText style={styles.exerciseName}>{item.name}</ThemedText>

        {hasTodayLogs && (
          <View style={styles.row}>
            <ThemedText style={[styles.description, { opacity: 0.5 }]}>
              Completed {todayLogs.length} {todayLogs.length > 1 ? "times" : "time"} today already
            </ThemedText>
          </View>
        )}
      </View>

      {allowCompletion && (
        <ThemedButton
          onPress={handleTaskCompletion}
          variant="ghost"
          icon={hasTodayLogs ? "arrow.circlepath" : "checkmark.circle"}
          iconPlacement="right"
          style={{
            marginLeft: "auto",
          }}
          textStyle={{
            color: successColor,
          }}
        />
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    gap: Spacings.sm,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: BorderRadii.md,
    overflow: "hidden",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    width: "100%",
    alignSelf: "center",
    paddingHorizontal: Spacings.sm,
    paddingLeft: Spacings.md,
  },
  image: {
    width: 80,
    height: "auto",
    objectFit: "contain",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacings.xs,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: "600",
  },
  exerciseArea: {
    fontSize: 13,
  },
  description: {
    fontSize: 13,
  },
});
