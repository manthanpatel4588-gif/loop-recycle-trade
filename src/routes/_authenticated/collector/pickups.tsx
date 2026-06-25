import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/collector/pickups")({
  component: MyPickups,
});

function MyPickups() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: pickups = [] } = useQuery({
    queryKey: ["my-pickups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("pickup_requests")
        .select("id,status,offered_price,scheduled_at,created_at,waste_listings(title,quantity,unit,city)")
        .eq("collector_user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const advance = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "in_transit" | "completed" }) => {
      const { error } = await supabase.from("pickup_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-pickups"] }); toast.success("Updated"); },
  });

  return (
    <AppShell role="collector" title="My Pickups">
      <div className="rounded-2xl border border-border bg-card shadow-card">
        {pickups.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No pickups yet.</div>}
        <div className="divide-y divide-border">
          {pickups.map((p) => {
            const l = (p as { waste_listings?: { title: string; quantity: number; unit: string; city: string } }).waste_listings;
            return (
              <div key={p.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <div className="font-medium">{l?.title ?? "Pickup"}</div>
                  <div className="text-xs text-muted-foreground">{l?.quantity} {l?.unit} · {l?.city}</div>
                </div>
                <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs capitalize">{p.status}</span>
                <div className="flex gap-2">
                  {p.status === "approved" && <Button size="sm" onClick={() => advance.mutate({ id: p.id, status: "in_transit" })} className="bg-brand-gradient text-brand-foreground hover:opacity-90">Start</Button>}
                  {p.status === "in_transit" && <Button size="sm" onClick={() => advance.mutate({ id: p.id, status: "completed" })} className="bg-brand-gradient text-brand-foreground hover:opacity-90">Complete</Button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
