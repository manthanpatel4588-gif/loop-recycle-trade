import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Leaf, Recycle, Factory } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/industry/sustainability")({
  component: Sustainability,
});

function Sustainability() {
  const { user } = useAuth();
  const { data: listings = [] } = useQuery({
    queryKey: ["sust-listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("waste_listings").select("quantity,category,status").eq("industry_user_id", user!.id);
      return data ?? [];
    },
  });

  const total = listings.reduce((s, l) => s + Number(l.quantity ?? 0), 0);
  const recycled = listings.filter((l) => l.status === "collected").reduce((s, l) => s + Number(l.quantity ?? 0), 0);
  const carbon = Math.round(recycled * 0.6);
  const score = total > 0 ? Math.round((recycled / total) * 100) : 0;

  const byCat = listings.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] ?? 0) + Number(l.quantity ?? 0);
    return acc;
  }, {});
  const maxCat = Math.max(1, ...Object.values(byCat));

  return (
    <AppShell role="industry" title="Sustainability">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {[
            { l: "Waste generated", v: `${total} kg`, i: Factory },
            { l: "Waste recycled", v: `${recycled} kg`, i: Recycle },
            { l: "CO₂ avoided", v: `${carbon} kg`, i: Leaf },
            { l: "Sustainability score", v: `${score}/100`, i: Leaf },
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

        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <h2 className="text-base font-semibold">Waste by category</h2>
          <div className="mt-6 space-y-3">
            {Object.keys(byCat).length === 0 && <div className="text-sm text-muted-foreground">Post waste listings to see breakdown.</div>}
            {Object.entries(byCat).map(([cat, qty]) => (
              <div key={cat}>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="capitalize">{cat}</span><span>{qty} kg</span>
                </div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-elevated">
                  <div className="h-full bg-brand-gradient" style={{ width: `${(qty / maxCat) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
