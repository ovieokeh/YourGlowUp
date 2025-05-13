import { ActivityCreateInput, ActivityDependency, GoalActivity } from "@/backend/shared";
import { ActivityReliesOnEditor } from "@/components/ActivityReliesOnEditor";

interface ActivityEditDependenciesProps {
  reliesOn?: ActivityDependency[];
  possibleDependencies?: GoalActivity[];
  activities?: GoalActivity[];
  onChange: (key: keyof ActivityCreateInput, value: any) => void;
}
export const ActivityEditDependencies: React.FC<ActivityEditDependenciesProps> = ({
  reliesOn,
  possibleDependencies,
  activities,
  onChange,
}) => {
  return (
    <ActivityReliesOnEditor
      dependencies={reliesOn || []}
      possibleDependencies={possibleDependencies}
      activities={activities || []}
      onChange={(deps) => onChange("reliesOn", deps)}
    />
  );
};
