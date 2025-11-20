# LearnLynk – Technical Test

Thank you for your interest in LearnLynk.

This exercise is designed to be **2–3 hours** of focused work.  
Please don’t over-engineer – we want to see **how you think**, not a perfect product.

---

## 🔧 Stack Assumptions

- Database: **Supabase Postgres**
- Backend Logic: **Supabase Edge Functions (TypeScript)**
- Frontend: **Next.js + TypeScript**
- You can use your **own free Supabase project** OR a test project we provide.

---

## 📦 What You Need To Do

There are 4 core tasks:

1. **Database Schema** – `backend/schema.sql`
2. **RLS Policies** – `backend/rls_policies.sql`
3. **Edge Function** – `backend/edge-functions/create-task/index.ts`
4. **Frontend Page** – `frontend/pages/dashboard/today.tsx`

There is also a short written question about Stripe in this README.

You are free to:
- Use any editor/IDE of your choice.
- Use Supabase docs, SQL docs, etc.
- Use Google for syntax lookups (we’re not testing memorization).

---

## ✅ Task 1 – Database Schema (schema.sql)

Open: `backend/schema.sql`

Implement schema for 3 tables:

- `leads`
- `applications`
- `tasks`

**Requirements:**

- All tables must include:

  ```sql
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
  ```

- `applications.lead_id` references `leads.id`
- `tasks.application_id` references `applications.id`
- Add constraints:
  - `tasks.due_at >= tasks.created_at`
  - `tasks.type` in ('call', 'email', 'review')
- Add indexes for common queries:
  - Leads by `tenant_id`, `owner_id`, `stage`, `created_at`
  - Applications by `tenant_id`, `lead_id`
  - Tasks due today by `tenant_id`, `due_at`, `status`

Add any additional useful indexes/constraints you feel make sense.

---

## ✅ Task 2 – Row-Level Security (rls_policies.sql)

Open: `backend/rls_policies.sql`

We want:

- **Counselors** can only see leads:
  - Where they are the `owner_id`, OR
  - Where the lead is assigned to one of their teams.
- **Admins** can see all leads for their tenant.

Assume:

- `leads.owner_id` is a `uuid` pointing to `users.id`
- There are:

  ```sql
  users(id, tenant_id, role)
  teams(id, tenant_id, name)
  user_teams(user_id, team_id)
  ```

- JWT contains:
  - `auth.jwt() ->> 'user_id'`
  - `auth.jwt() ->> 'role'`
  - `auth.jwt() ->> 'tenant_id'`

**Do:**

- Enable RLS on `leads`
- Add RLS policy for **SELECT**
- Add RLS policy for **INSERT** (so counselors can insert their own leads)

Write actual SQL policies as you would in a real Supabase project.

---

## ✅ Task 3 – Edge Function (create-task)

Open: `backend/edge-functions/create-task/index.ts`

Implement a Supabase Edge Function that:

- Accepts `POST` JSON body:

  ```json
  {
    "application_id": "uuid",
    "task_type": "call",
    "due_at": "2025-01-01T12:00:00Z"
  }
  ```

- Validates:
  - `task_type` ∈ ("call", "email", "review")
  - `due_at` is a valid future datetime
- Inserts into `tasks` with:
  - `application_id`
  - `type`
  - `due_at`
  - plus any required defaults
- Uses **service role key** to insert
- Returns:

  ```json
  {
    "success": true,
    "task_id": "<uuid>"
  }
  ```

- On validation error, return `400` with an error message.
- On internal error, return `500`.

You can assume `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` come from environment variables.

---

## ✅ Task 4 – Frontend Page (`/dashboard/today`)

Open: `frontend/pages/dashboard/today.tsx`

We want a simple Next.js page that:

- Connects to Supabase using the client in `frontend/lib/supabaseClient.ts`
- Fetches all tasks:
  - For **today** (by `due_at`)
  - With `status` NOT equal to `"completed"`
- Displays a table with:
  - Task type
  - Application ID
  - Due time
  - Status
- Add a **"Mark Complete"** button per row:
  - On click → update `status = 'completed'` in Supabase
  - Re-fetch or optimistically update the UI
- Handle loading and error states nicely.

You may use:
- React hooks
- `useEffect` + `useState`, or
- React Query / SWR (your choice)

---

## ✅ Task 5 – Short Answer: Stripe Integration

In this same `README.md` under a heading called `## Stripe Answer`, write **8–12 lines** explaining how you would implement **Stripe Checkout for an application fee**.

Please include:

- When you create a `payment_requests` row
- When you call Stripe to create a Checkout session
- What you store from Stripe’s response
- How you handle Stripe webhooks
- How you update payment + application when payment succeeds

We’re not looking for perfect Stripe code, just a clear and realistic process.

---

## 📤 Submission

1. Push all your changes to a **public GitHub repo**.
2. Add your **Stripe Answer** at the bottom of this README.
3. Share the GitHub link with us.

---

## ⏱ Timebox

Please aim to spend **no more than 2–3 hours** on this.  
If you run out of time, leave comments/TODOs — that’s useful signal too.

Good luck and have fun :)
