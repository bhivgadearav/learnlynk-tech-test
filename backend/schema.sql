-- ===========================================
CREATE TABLE public.leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  owner_id uuid NOT NULL,
  stage text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL,
  related_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  title text,
  type text NOT NULL,
  due_at timestamptz NOT NULL,
  status text DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  
  CONSTRAINT valid_task_type CHECK (type IN ('call', 'email', 'review')),
  CONSTRAINT due_after_created CHECK (due_at >= created_at)
);

CREATE INDEX idx_leads_owner_id ON public.leads(owner_id);
CREATE INDEX idx_leads_stage ON public.leads(stage);
CREATE INDEX idx_leads_created_at ON public.leads(created_at);

CREATE INDEX idx_applications_lead_id ON public.applications(lead_id);

CREATE INDEX idx_tasks_due_at ON public.tasks(due_at);
