import { supabase } from "@/supabase";

export const getCurrentUserEmail = async () => {
  const currentUser = await supabase.auth.getUser();
  const userEmail = currentUser.data.user?.email || "unknown";

  return userEmail;
};
