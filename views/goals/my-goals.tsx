import { Goal } from "@/backend/shared";
import { GoalCard } from "@/components/GoalCard";
import { Spacings } from "@/constants/Theme";
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
        <View style={{ flex: 1, gap: Spacings.xl }}>
          {/* Render your goals here */}
          {goals.map((goal) => (
            <GoalCard key={goal.id} item={goal} actions={["view"]} />
          ))}
        </View>
      )}
    </View>
  );
};
