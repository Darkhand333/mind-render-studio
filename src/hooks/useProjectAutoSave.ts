import { useEffect, useRef, useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type ProjectData = {
  elements: any[];
  pages: any[];
  canvasSettings?: any;
};

type ProjectSummary = {
  id: string;
  name: string;
  project_type: string;
  updated_at: string;
  created_at: string;
};

const LAST_PROJECT_KEY = "protocraft:last-project-id";

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
  const initializedRef = useRef(false);
  const loadedRef = useRef(false);

  dataRef.current = data;
  nameRef.current = projectName;

  const persistProjectId = (pid: string | null) => {
    try {
      if (pid) window.localStorage.setItem(LAST_PROJECT_KEY, pid);
      else window.localStorage.removeItem(LAST_PROJECT_KEY);
    } catch {
      // no-op
    }
  };

  // Create or load project
  useEffect(() => {
    if (!user || initializedRef.current) return;
    initializedRef.current = true;

    const initProject = async () => {
      const url = new URL(window.location.href);
      const pidFromUrl = url.searchParams.get("project");
      const pidFromStorage = window.localStorage.getItem(LAST_PROJECT_KEY);
      const pid = pidFromUrl || pidFromStorage;

      if (pid) {
        const { data: proj } = await supabase
          .from("projects")
          .select("*")
          .eq("id", pid)
          .eq("user_id", user.id)
          .single();

        if (proj) {
          setProjectId(proj.id);
          persistProjectId(proj.id);

          if (!pidFromUrl) {
            url.searchParams.set("project", proj.id);
            window.history.replaceState({}, "", url.toString());
          }

          if (onLoadProject) {
            onLoadProject({
              elements: (proj.elements as any[]) || [],
              pages: (proj.pages as any[]) || [{ id: 1, name: "Page 1", active: true }],
              canvasSettings: proj.canvas_settings || {},
              name: proj.name || "Untitled",
            });
          }

          loadedRef.current = true;
          return;
        }

        // stale project id
        if (pid === pidFromStorage) persistProjectId(null);
      }

      const { data: newProj } = await supabase
        .from("projects")
        .insert({
          user_id: user.id,
          name: nameRef.current || "Untitled",
          project_type: "design",
          elements: dataRef.current.elements as any,
          pages: dataRef.current.pages as any,
          canvas_settings: dataRef.current.canvasSettings as any,
        })
        .select()
        .single();

      if (newProj) {
        setProjectId(newProj.id);
        loadedRef.current = true;
        persistProjectId(newProj.id);

        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("project", newProj.id);
        window.history.replaceState({}, "", newUrl.toString());
      }
    };

    void initProject();
  }, [user, onLoadProject]);

  const elementsJson = JSON.stringify(data.elements);
  const pagesJson = JSON.stringify(data.pages);
  const canvasSettingsJson = JSON.stringify(data.canvasSettings ?? {});

  // Mark dirty when data changes (only after initial load)
  useEffect(() => {
    if (!projectId || !loadedRef.current) return;
    dirtyRef.current = true;
  }, [elementsJson, pagesJson, canvasSettingsJson, projectId]);

  const flushSave = useCallback(async () => {
    if (!projectId || !user || !loadedRef.current || !dirtyRef.current) return;

    dirtyRef.current = false;
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
  }, [projectId, user]);

  // Auto-save every 5 seconds if dirty and loaded
  useEffect(() => {
    if (!projectId || !user) return;

    const interval = setInterval(async () => {
      if (!dirtyRef.current || !loadedRef.current) return;
      setSaving(true);
      try {
        await flushSave();
      } catch (err) {
        console.error("Auto-save failed:", err);
      } finally {
        setSaving(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [projectId, user, flushSave]);

  // Save immediately when tab hides / route changes
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === "hidden") void flushSave();
    };
    const onPageHide = () => {
      void flushSave();
    };

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      void flushSave();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [flushSave]);

  const saveNow = useCallback(async () => {
    if (!projectId || !user || !loadedRef.current) return;
    setSaving(true);
    dirtyRef.current = true;

    try {
      await flushSave();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [projectId, user, flushSave]);

  const rename = useCallback(async (newName: string) => {
    if (!projectId || !user) return;
    nameRef.current = newName;
    await supabase
      .from("projects")
      .update({ name: newName })
      .eq("id", projectId)
      .eq("user_id", user.id);
  }, [projectId, user]);

  const createProject = useCallback(async (name: string, nextData: ProjectData, projectType = "design") => {
    if (!user) return null;

    try {
      await flushSave();
    } catch {
      // keep creating the new project even if the previous flush fails
    }

    dataRef.current = nextData;
    nameRef.current = name || "Untitled";

    const { data: newProj } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        name: nameRef.current,
        project_type: projectType,
        elements: nextData.elements as any,
        pages: nextData.pages as any,
        canvas_settings: nextData.canvasSettings as any,
      })
      .select()
      .single();

    if (!newProj) return null;

    setProjectId(newProj.id);
    persistProjectId(newProj.id);
    loadedRef.current = true;
    dirtyRef.current = false;
    setLastSaved(new Date());

    const url = new URL(window.location.href);
    url.searchParams.set("project", newProj.id);
    window.history.replaceState({}, "", url.toString());

    return newProj.id;
  }, [flushSave, user]);

  const loadProject = useCallback(async (pid: string): Promise<(ProjectData & { name: string }) | null> => {
    if (!user) return null;

    try {
      await flushSave();
    } catch {
      // load requested project anyway
    }

    const { data: proj } = await supabase
      .from("projects")
      .select("*")
      .eq("id", pid)
      .eq("user_id", user.id)
      .single();

    if (proj) {
      setProjectId(proj.id);
      persistProjectId(proj.id);
      dirtyRef.current = false;
      loadedRef.current = true;
      nameRef.current = proj.name || "Untitled";
      const url = new URL(window.location.href);
      url.searchParams.set("project", proj.id);
      window.history.replaceState({}, "", url.toString());
      const payload = {
        elements: (proj.elements as any[]) || [],
        pages: (proj.pages as any[]) || [{ id: 1, name: "Page 1", active: true }],
        canvasSettings: proj.canvas_settings || {},
        name: proj.name || "Untitled",
      };
      onLoadProject?.(payload);
      return payload;
    }

    return null;
  }, [flushSave, onLoadProject, user]);

  const listProjects = useCallback(async (limit = 20): Promise<ProjectSummary[]> => {
    if (!user) return [];

    const { data } = await supabase
      .from("projects")
      .select("id, name, project_type, updated_at, created_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(limit);

    return data || [];
  }, [user]);

  return { projectId, saving, lastSaved, saveNow, rename, loadProject, createProject, listProjects };
};
