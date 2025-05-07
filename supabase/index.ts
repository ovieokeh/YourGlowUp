import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lvaengmvyffyrughoqmc.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2YWVuZ212eWZmeXJ1Z2hvcW1jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNzgyNDksImV4cCI6MjA2MDk1NDI0OX0.i3RZ_lbuGvsNLOW20fMCiHpvNDUuq4-ImEgEqGVdRho";

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
