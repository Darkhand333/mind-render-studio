import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ProjectData = {
  elements: any[];
  pages: any[];
  canvasSettings?: any;
};

export const useProjectAutoSave = (
  projectName: string,
  data: ProjectData,
  onLoadProject?: (data: ProjectData & { name: string }) => void
) => {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const dirtyRef = useRef(false);
  const dataRef = useRef(data);
  const nameRef = useRef(projectName);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initializedRef = useRef(false);
  const loadedRef = useRef(false);

  dataRef.current = data;
  nameRef.current = projectName;

  // Create or load project
  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    const initProject = async () => {
      // Check URL for project ID
      const urlParams = new URLSearchParams(window.location.search);
      const pid = urlParams.get("project");

      if (pid) {
        const { data: proj } = await supabase
          .from("projects")
          .select("*")
          .eq("id", pid)
          .eq("user_id", user.id)
          .single();

        if (proj) {
          setProjectId(proj.id);
          // Load saved data back into canvas
          if (onLoadProject) {
            onLoadProject({
              elements: (proj.elements as any[]) || [],
              pages: (proj.pages as any[]) || [{ id: 1, name: "Page 1", active: true }],
              canvasSettings: proj.canvas_settings || {},
              name: proj.name || "Untitled",
            });
          }
          return;
        }
      }

      // Create new project
      const { data: newProj } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: nameRef.current || "Untitled",
          project_type: "design",
          elements: dataRef.current.elements as any,
          pages: dataRef.current.pages as any,
        })
        .select()
        .single();

      if (newProj) {
        setProjectId(newProj.id);
        const url = new URL(window.location.href);
        url.searchParams.set("project", newProj.id);
        window.history.replaceState({}, "", url.toString());
      }
    };

    initProject();
  }, [user]);

  // Mark dirty when data changes
  useEffect(() => {
    if (!projectId) return;
    dirtyRef.current = true;
  }, [data.elements.length, data.pages.length, projectId]);

  // Auto-save every 5 seconds if dirty
  useEffect(() => {
    if (!projectId || !user) return;

    const interval = setInterval(async () => {
      if (!dirtyRef.current) return;
      dirtyRef.current = false;
      setSaving(true);

      try {
        await supabase
          .from("projects")
          .update({
            elements: dataRef.current.elements as any,
            pages: dataRef.current.pages as any,
            canvas_settings: dataRef.current.canvasSettings as any,
            name: nameRef.current,
          })
          .eq("id", projectId)
          .eq("user_id", user.id);

        setLastSaved(new Date());
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, user]);

  const saveNow = useCallback(async () => {
    if (!projectId || !user) return;
    setSaving(true);
    dirtyRef.current = false;

    try {
      await supabase
        .from("projects")
        .update({
          elements: dataRef.current.elements as any,
          pages: dataRef.current.pages as any,
          canvas_settings: dataRef.current.canvasSettings as any,
          name: nameRef.current,
        })
        .eq("id", projectId)
        .eq("user_id", user.id);

      setLastSaved(new Date());
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [projectId, user]);

  const rename = useCallback(async (newName: string) => {
    if (!projectId || !user) return;
    nameRef.current = newName;
    await supabase
      .from("projects")
      .update({ name: newName })
      .eq("id", projectId)
      .eq("user_id", user.id);
  }, [projectId, user]);

  const loadProject = useCallback(async (pid: string): Promise<ProjectData | null> => {
    if (!user) return null;
    const { data: proj } = await supabase
      .from("projects")
      .select("*")
      .eq("id", pid)
      .eq("user_id", user.id)
      .single();

    if (proj) {
      setProjectId(proj.id);
      const url = new URL(window.location.href);
      url.searchParams.set("project", proj.id);
      window.history.replaceState({}, "", url.toString());
      return {
        elements: (proj.elements as any[]) || [],
        pages: (proj.pages as any[]) || [{ id: 1, name: "Page 1", active: true }],
        canvasSettings: proj.canvas_settings || {},
      };
    }
    return null;
  }, [user]);

  return { projectId, saving, lastSaved, saveNow, rename, loadProject };
};
