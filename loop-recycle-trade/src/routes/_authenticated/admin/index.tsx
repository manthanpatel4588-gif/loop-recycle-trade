import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users, Factory, Truck, Recycle, Store, DollarSign } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/admin/")({
  component: AdminHome,
});

function AdminHome() {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [profiles, industries, collectors, recyclers, retailers, orders, listings] = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("industries").select("id", { count: "exact", head: true }),
        supabase.from("collectors").select("id", { count: "exact", head: true }),
        supabase.from("recyclers").select("id", { count: "exact", head: true }),
        supabase.from("retailers").select("id", { count: "exact", head: true }),
        supabase.from("orders").select("total_amount"),
        supabase.from("waste_listings").select("quantity"),
      ]);
      const revenue = (orders.data ?? []).reduce((s, o) => s + Number(o.total_amount ?? 0), 0);
      const waste = (listings.data ?? []).reduce((s, l) => s + Number(l.quantity ?? 0), 0);
      return {
        users: profiles.count ?? 0,
        industries: industries.count ?? 0,
        collectors: collectors.count ?? 0,
        recyclers: recyclers.count ?? 0,
        retailers: retailers.count ?? 0,
        revenue, waste,
      };
    },
  });

  return (
    <AppShell role="admin" title="Admin Overview">
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {[
          { l: "Total users", v: stats?.users ?? 0, i: Users },
          { l: "Industries", v: stats?.industries ?? 0, i: Factory },
          { l: "Collectors", v: stats?.collectors ?? 0, i: Truck },
          { l: "Recyclers", v: stats?.recyclers ?? 0, i: Recycle },
          { l: "Retailers", v: stats?.retailers ?? 0, i: Store },
          { l: "Waste posted (kg)", v: stats?.waste ?? 0, i: Recycle },
          { l: "Revenue", v: `$${(stats?.revenue ?? 0).toFixed(0)}`, i: DollarSign },
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
