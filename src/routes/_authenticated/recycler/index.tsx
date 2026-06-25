import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Boxes, Store, DollarSign } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/recycler/")({
  component: RecyclerHome,
});

function RecyclerHome() {
  const { user } = useAuth();
  const { data: inv = [] } = useQuery({
    queryKey: ["recycler-inv", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("recycler_inventory").select("quantity").eq("recycler_user_id", user!.id)).data ?? [],
  });
  const { data: products = [] } = useQuery({
    queryKey: ["recycler-products", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("products").select("id,price,available_quantity").eq("recycler_user_id", user!.id)).data ?? [],
  });

  const totalInv = inv.reduce((s, i) => s + Number(i.quantity ?? 0), 0);
  const skuCount = products.length;
  const inventoryValue = products.reduce((s, p) => s + Number(p.price ?? 0) * Number(p.available_quantity ?? 0), 0);

  return (
    <AppShell role="recycler" title="Recycler Dashboard">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { l: "Raw inventory", v: `${totalInv} kg`, i: Boxes },
          { l: "Active SKUs", v: skuCount, i: Store },
          { l: "Inventory value", v: `$${inventoryValue.toFixed(0)}`, i: DollarSign },
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
