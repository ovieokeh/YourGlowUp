import { useGetGoals } from "@/backend/queries/goals";
import { Goal } from "@/backend/shared";
import { supabase } from "@/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type AppContextType = {
  user: User | null;
  goals: Goal[];
  selectedGoalId: string;
  isLoadingGoals: boolean;
  setSelectedGoalId: (goalId: string) => void;
  logout: () => void;
};
const AppContext = createContext<AppContextType>({
  user: null,
  goals: [],
  selectedGoalId: "",
  isLoadingGoals: false,
  setSelectedGoalId: () => {},
  logout: () => {},
});
const SELECTED_GOAL_ID_KEY = "selectedGoalId";
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);

  const goalsQuery = useGetGoals(user?.id);
  const goalsData = useMemo(() => {
    return goalsQuery.data || [];
  }, [goalsQuery.data]);

  useEffect(() => {
    const sync = async () => {
      if (goalsData.length > 0) {
        const storedGoalId = await AsyncStorage.getItem(SELECTED_GOAL_ID_KEY);
        if (storedGoalId && goalsData.some((goal) => goal.id === storedGoalId)) {
          setSelectedGoalId(storedGoalId);
        } else {
          setSelectedGoalId(goalsData[0].id);
        }
      }
    };
    sync();
  }, [goalsData]);
  useEffect(() => {
    const saveSelectedGoalId = async () => {
      await AsyncStorage.setItem(SELECTED_GOAL_ID_KEY, selectedGoalId);
    };
    saveSelectedGoalId();
  }, [selectedGoalId]);

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    } else {
      setUser(null);
      setSelectedGoalId("");
      await AsyncStorage.removeItem("selectedGoalId");
    }
  };
  useEffect(() => {
    const fetchUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setUser(data.user);
      }
    };
    fetchUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) {
        setUser(session.user);
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setSelectedGoalId("");
        AsyncStorage.removeItem("selectedGoalId");
      }
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadSelectedGoalId = async () => {
      const storedGoalId = await AsyncStorage.getItem("selectedGoalId");
      if (storedGoalId) {
        setSelectedGoalId(storedGoalId);
      }
    };
    loadSelectedGoalId();
  }, []);

  useEffect(() => {
    if (selectedGoalId) {
      AsyncStorage.setItem("selectedGoalId", selectedGoalId);
    }
  }, [selectedGoalId]);

  return (
    <AppContext.Provider
      value={{
        user,
        goals: goalsData,
        isLoadingGoals: goalsQuery.isLoading,
        selectedGoalId,
        logout,
        setSelectedGoalId,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
export const useAppContext = () => useContext(AppContext);
export const useSelectedGoalId = () => {
  const context = useAppContext();
  if (!context) {
    throw new Error("useSelectedGoalId must be used within a AppProvider");
  }
  return context.selectedGoalId;
};
