
-- Create project activities table for real activity tracking
CREATE TABLE public.project_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'feature',
  icon_name TEXT NOT NULL DEFAULT 'Zap',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.project_activities ENABLE ROW LEVEL SECURITY;

-- Users can view their own activities
CREATE POLICY "Users can view own activities"
  ON public.project_activities
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Users can insert their own activities
CREATE POLICY "Users can insert own activities"
  ON public.project_activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own activities
CREATE POLICY "Users can delete own activities"
  ON public.project_activities
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Also allow anonymous users to view all activities (for the memory graph public view)
CREATE POLICY "Anyone can view activities"
  ON public.project_activities
  FOR SELECT
  TO anon
  USING (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.project_activities;
