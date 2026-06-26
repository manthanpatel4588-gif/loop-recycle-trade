import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/users")({
  component: Users,
});

function Users() {
  const { data: users = [] } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => (await supabase.from("profiles").select("id,full_name,email,active_role,onboarded,created_at").order("created_at", { ascending: false }).limit(100)).data ?? [],
  });

  return (
    <AppShell role="admin" title="Users">
      <div className="rounded-2xl border border-border bg-card shadow-card">
        <div className="divide-y divide-border">
          {users.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No users.</div>}
          {users.map((u) => (
            <div key={u.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3 text-sm">
              <div>
                <div className="font-medium">{u.full_name ?? "—"}</div>
                <div className="text-xs text-muted-foreground">{u.email}</div>
              </div>
              <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs capitalize">{u.active_role ?? "no role"}</span>
              <div className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
