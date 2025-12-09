"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

export default function TodayTasks() {
  const supabase = createClientComponentClient();
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["todayTasks"],
    queryFn: async () => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);

      const end = new Date();
      end.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .gte("due_at", start.toISOString())
        .lte("due_at", end.toISOString())
        .order("due_at", { ascending: true });

      if (error) throw error;
      return data;
    }
  });

  const mutation = useMutation({
    mutationFn: async (taskId: string) => {
      const { error } = await supabase
        .from("tasks")
        .update({ status: "completed" })
        .eq("id", taskId);

      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries(["todayTasks"])
  });

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading tasks.</p>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tasks Due Today</h1>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th>Title</th>
            <th>Application</th>
            <th>Due At</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((t: any) => (
            <tr key={t.id} className="border">
              <td>{t.title}</td>
              <td>{t.related_id}</td>
              <td>{new Date(t.due_at).toLocaleString()}</td>
              <td>{t.status}</td>
              <td>
                <button
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate(t.id)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Mark Complete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
