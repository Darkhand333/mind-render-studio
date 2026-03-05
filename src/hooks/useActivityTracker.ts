import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

type ActivityCategory = "feature" | "ai" | "style" | "tooling" | "backend";

export const useActivityTracker = () => {
  const logActivity = useCallback(async (action: string, category: ActivityCategory = "feature", iconName: string = "Zap") => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from("project_activities").insert({
        user_id: user.id,
        action,
        category,
        icon_name: iconName,
      });
    } catch (err) {
      console.error("Failed to log activity:", err);
    }
  }, []);

  return { logActivity };
};
