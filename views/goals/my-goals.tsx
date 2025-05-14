import { Goal } from "@/backend/shared";
import { GoalCard } from "@/components/GoalCard";
import { Spacings } from "@/constants/Theme";
import { router } from "expo-router";
import { FC } from "react";
import { View } from "react-native";
import { EmptyGoalsView } from "../shared/EmptyGoalsView";

interface MyGoalsViewProps {
  goals: Goal[];
}
export const MyGoalsView: FC<MyGoalsViewProps> = ({ goals }) => {
  return (
    <View style={{ flex: 1, paddingVertical: Spacings.md, paddingHorizontal: Spacings.sm }}>
      {goals.length === 0 ? (
        <EmptyGoalsView />
      ) : (
        <View style={{ flex: 1, gap: Spacings.md }}>
          {/* Render your goals here */}
          {goals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              actionButtonTitle="View"
              handlePress={() => {
                router.push({
                  pathname: "/(tabs)/goals/[id]",
                  params: { id: goal.id },
                });
              }}
            />
          ))}
        </View>
      )}
    </View>
  );
};
