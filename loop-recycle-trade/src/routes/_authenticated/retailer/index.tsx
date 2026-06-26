import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShoppingCart, Boxes, Store } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/retailer/")({
  component: RetailerHome,
});

function RetailerHome() {
  const { user } = useAuth();
  const { data: orders = [] } = useQuery({
    queryKey: ["retailer-orders", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("id,total_amount,status").eq("buyer_user_id", user!.id)).data ?? [],
  });
  const { data: cart = [] } = useQuery({
    queryKey: ["cart", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("cart_items").select("id").eq("user_id", user!.id)).data ?? [],
  });

  const spent = orders.reduce((s, o) => s + Number(o.total_amount ?? 0), 0);

  return (
    <AppShell role="retailer" title="Retailer Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { l: "Orders", v: orders.length, i: Boxes },
            { l: "Cart items", v: cart.length, i: ShoppingCart },
            { l: "Total spent", v: `$${spent.toFixed(0)}`, i: Store },
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
        <Button asChild className="bg-brand-gradient text-brand-foreground hover:opacity-90">
          <Link to="/retailer/marketplace">Browse marketplace</Link>
        </Button>
      </div>
    </AppShell>
  );
}
