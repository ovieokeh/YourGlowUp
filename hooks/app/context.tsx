import { supabase } from "@/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@supabase/supabase-js";
import React, { createContext, useContext, useEffect, useState } from "react";

type AppContextType = {
  user: User | null;
  logout: () => void;
  selectedGoalId: string;
  setSelectedGoalId: (goalId: string) => void;
};
const AppContext = createContext<AppContextType>({
  user: null,
  logout: () => {},
  selectedGoalId: "",
  setSelectedGoalId: () => {},
});
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>("");
  const [user, setUser] = useState<User | null>(null);
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
        logout,
        selectedGoalId,
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
