-- LearnLynk Tech Test - Task 2: RLS Policies on leads

alter table public.leads enable row level security;

-- Example helper: assume JWT has tenant_id, user_id, role.
-- You can use: current_setting('request.jwt.claims', true)::jsonb

-- TODO: write a policy so:
-- - counselors see leads where they are owner_id OR in one of their teams
-- - admins can see all leads of their tenant


-- Example skeleton for SELECT (replace with your own logic):

CREATE POLICY "leads_select_policy"
ON public.leads
FOR SELECT
USING (
    auth.jwt()->>'role' = 'admin'
    OR owner_id = auth.uid()
    OR owner_id IN (
        SELECT user_id
        FROM user_teams
        WHERE team_id IN (
            SELECT team_id
            FROM user_teams
            WHERE user_id = auth.uid()
        )
    )
);

-- TODO: add INSERT policy that:
-- - allows counselors/admins to insert leads for their tenant
-- - ensures tenant_id is correctly set/validated
CREATE POLICY "leads_insert_policy"
ON public.leads
FOR INSERT
WITH CHECK (
    auth.jwt()->>'role' = 'admin'
    OR owner_id = auth.uid()
);
