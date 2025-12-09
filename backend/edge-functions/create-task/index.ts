// create-task Edge Function

import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    const body = await req.json();
    const { application_id, task_type, due_at } = body;

    // Validate task type
    const validTypes = ["call", "email", "review"];
    if (!validTypes.includes(task_type)) {
      return new Response(JSON.stringify({ error: "Invalid task type" }), {
        status: 400,
      });
    }

    // Validate due date
    if (!due_at || new Date(due_at) <= new Date()) {
      return new Response(JSON.stringify({ error: "due_at must be in the future" }), {
        status: 400,
      });
    }

    // Insert task
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        related_id: application_id,
        type: task_type,
        due_at,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Broadcast realtime event
    await supabase.channel("task.created").send({
      type: "broadcast",
      event: "task.created",
      payload: { task_id: data.id },
    });

    return new Response(
      JSON.stringify({ success: true, task_id: data.id }),
      { status: 200 }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
    });
  }
});
