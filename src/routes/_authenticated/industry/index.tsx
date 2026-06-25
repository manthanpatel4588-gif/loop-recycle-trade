import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Factory, Truck, Recycle, Leaf, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/industry/")({
  component: IndustryHome,
});

function StatCard({ label, value, icon: Icon, hint }: { label: string; value: string | number; icon: typeof Factory; hint?: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-brand" />
      </div>
      <div className="mt-3 text-3xl font-semibold tracking-tight">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

function IndustryHome() {
  const { user } = useAuth();
  const { data: listings = [] } = useQuery({
    queryKey: ["industry-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("waste_listings")
        .select("id,title,category,quantity,unit,status,created_at")
        .eq("industry_user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      return data ?? [];
    },
  });
  const { data: pickups = [] } = useQuery({
    queryKey: ["industry-pickups", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("pickup_requests").select("id,status")
        .eq("industry_user_id", user!.id);
      return data ?? [];
    },
  });

  const totalQty = listings.reduce((s, l) => s + Number(l.quantity ?? 0), 0);
  const pending = pickups.filter((p) => p.status === "requested").length;

  return (
    <AppShell role="industry" title="Industry Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Active listings" value={listings.filter((l) => l.status === "active").length} icon={Factory} />
          <StatCard label="Total waste posted" value={`${totalQty} kg`} icon={Recycle} />
          <StatCard label="Pending pickup requests" value={pending} icon={Truck} />
          <StatCard label="CO₂ avoided (est.)" value={`${Math.round(totalQty * 0.6)} kg`} icon={Leaf} />
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div>
              <h2 className="text-base font-semibold">Recent waste listings</h2>
              <p className="text-xs text-muted-foreground">Latest 10 posts</p>
            </div>
            <Button asChild size="sm" className="bg-brand-gradient text-brand-foreground hover:opacity-90">
              <Link to="/industry/listings"><Plus className="mr-1 h-4 w-4" />New listing</Link>
            </Button>
          </div>
          <div className="divide-y divide-border">
            {listings.length === 0 && (
              <div className="px-5 py-10 text-center text-sm text-muted-foreground">
                No listings yet. Create your first waste listing to get matched with collectors.
              </div>
            )}
            {listings.map((l) => (
              <div key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
                <div>
                  <div className="font-medium">{l.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{l.category} · {l.quantity} {l.unit}</div>
                </div>
                <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs capitalize">{l.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
