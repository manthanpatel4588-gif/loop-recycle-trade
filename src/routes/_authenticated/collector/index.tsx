import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Truck, Star, CheckCircle2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/collector/")({
  component: CollectorHome,
});

function CollectorHome() {
  const { user } = useAuth();
  const { data: pickups = [] } = useQuery({
    queryKey: ["collector-pickups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("pickup_requests").select("id,status,offered_price").eq("collector_user_id", user!.id);
      return data ?? [];
    },
  });

  const active = pickups.filter((p) => ["approved", "scheduled", "in_transit"].includes(p.status)).length;
  const completed = pickups.filter((p) => p.status === "completed").length;
  const earnings = pickups.filter((p) => p.status === "completed").reduce((s, p) => s + Number(p.offered_price ?? 0), 0);

  return (
    <AppShell role="collector" title="Collector Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { l: "Active jobs", v: active, i: Truck },
          { l: "Completed pickups", v: completed, i: CheckCircle2 },
          { l: "Earnings (paid)", v: `$${earnings.toFixed(2)}`, i: Star },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.l}</span>
              <s.i className="h-4 w-4 text-brand" />
            </div>
            <div className="mt-3 text-3xl font-semibold tracking-tight">{s.v}</div>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
