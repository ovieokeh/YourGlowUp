import { useThemeColor } from "@/hooks/useThemeColor";
import { getLogsByTask, saveTaskLog, TaskLog } from "@/queries/logs/logs";
import { RoutineTaskItem } from "@/queries/routines/routines";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";

import { BorderRadii, Spacings } from "@/constants/Theme";
import Toast from "react-native-toast-message";
import { ThemedButton } from "./ThemedButton";
import { ThemedText } from "./ThemedText";
import { IconSymbol } from "./ui/IconSymbol";

interface TaskCardProps {
  item: RoutineTaskItem;
  handlePress: () => void;
}

export const TaskCard = ({ item, handlePress }: TaskCardProps) => {
  const cardBg = useThemeColor({}, "background");
  const cardBorder = useThemeColor({}, "border");
  const textColor = useThemeColor({}, "text");
  const successColor = useThemeColor({}, "success");
  const [logs, setLogs] = useState<TaskLog[]>([]);

  useFocusEffect(
    useCallback(() => {
      getLogsByTask(item.name, (res) => {
        setLogs(res);
      });
    }, [item.name])
  );

  const handleTaskCompletion = async () => {
    await saveTaskLog(item.name);
    const newLogs = await getLogsByTask(item.name);
    setLogs(newLogs);
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
    <View style={[styles.card, { backgroundColor: cardBg, borderColor: hasTodayLogs ? successColor : cardBorder }]}>
      <View
        style={{
          padding: Spacings.sm,
        }}
      >
        <View style={styles.row}>
          <ThemedText style={styles.exerciseArea}>{item.area}</ThemedText>
          {item.notificationTime ? (
            <View style={styles.row}>
              <IconSymbol name={"alarm"} size={16} color={textColor} />
              <ThemedText style={styles.description}>{item.notificationTime}</ThemedText>
            </View>
          ) : null}
          <ThemedText>-</ThemedText>
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
    </View>
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
