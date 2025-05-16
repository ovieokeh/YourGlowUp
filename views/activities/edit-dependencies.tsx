import { Activity, ActivityCreateInput, ActivityDependency } from "@/backend/shared";
import { ActivityReliesOnEditor } from "@/components/ActivityReliesOnEditor";

interface ActivityEditDependenciesProps {
  reliesOn?: ActivityDependency[];
  possibleDependencies?: Activity[];
  activities?: Activity[];
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
