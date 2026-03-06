
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL DEFAULT 'Untitled',
  project_type text NOT NULL DEFAULT 'design',
  elements jsonb NOT NULL DEFAULT '[]'::jsonb,
  pages jsonb NOT NULL DEFAULT '[{"id":1,"name":"Page 1","active":true}]'::jsonb,
  canvas_settings jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own projects" ON public.projects FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.projects FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.projects FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.projects FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
