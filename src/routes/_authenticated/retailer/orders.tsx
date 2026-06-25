import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/retailer/orders")({
  component: Orders,
});

function Orders() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: orders = [] } = useQuery({
    queryKey: ["orders-list", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("orders").select("*").eq("buyer_user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });
  const { data: cart = [] } = useQuery({
    queryKey: ["cart-detail", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("cart_items").select("id,quantity,product_id,products(id,name,price,unit,recycler_user_id)").eq("user_id", user!.id)).data ?? [],
  });

  const removeItem = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("cart_items").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cart-detail"] }),
  });

  type CartRow = { id: string; quantity: number; product_id: string; products: { id: string; name: string; price: number; unit: string; recycler_user_id: string } | null };
  const rows = cart as unknown as CartRow[];
  const total = rows.reduce((s, r) => s + (r.products ? Number(r.products.price) * Number(r.quantity) : 0), 0);

  const checkout = useMutation({
    mutationFn: async () => {
      if (!user || rows.length === 0) throw new Error("cart empty");
      const { data: order, error } = await supabase.from("orders").insert({ buyer_user_id: user.id, total_amount: total, status: "pending" }).select().single();
      if (error) throw error;
      const items = rows.filter(r => r.products).map(r => ({
        order_id: order.id, product_id: r.products!.id, recycler_user_id: r.products!.recycler_user_id,
        quantity: r.quantity, unit_price: r.products!.price,
      }));
      if (items.length) {
        const { error: oiErr } = await supabase.from("order_items").insert(items);
        if (oiErr) throw oiErr;
      }
      await supabase.from("cart_items").delete().eq("user_id", user.id);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["cart-detail"] });
      qc.invalidateQueries({ queryKey: ["orders-list"] });
      qc.invalidateQueries({ queryKey: ["cart"] });
      toast.success("Order placed");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell role="retailer" title="Cart & Orders">
      <div className="grid gap-6 lg:grid-cols-[2fr_3fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-base font-semibold">Cart</h2>
          <div className="mt-4 divide-y divide-border">
            {rows.length === 0 && <div className="py-6 text-sm text-muted-foreground">Cart is empty.</div>}
            {rows.map((r) => (
              <div key={r.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div>
                  <div className="font-medium">{r.products?.name ?? "Item"}</div>
                  <div className="text-xs text-muted-foreground">{r.quantity} × ${Number(r.products?.price ?? 0).toFixed(2)}</div>
                </div>
                <button onClick={() => removeItem.mutate(r.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-lg font-semibold">${total.toFixed(2)}</span>
          </div>
          <Button disabled={rows.length === 0 || checkout.isPending} onClick={() => checkout.mutate()} className="mt-4 w-full bg-brand-gradient text-brand-foreground hover:opacity-90">
            {checkout.isPending ? "Placing…" : "Place order"}
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-base font-semibold">Orders</h2>
          <div className="mt-4 divide-y divide-border">
            {orders.length === 0 && <div className="py-6 text-sm text-muted-foreground">No orders yet.</div>}
            {orders.map((o) => (
              <div key={o.id} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="font-medium">Order #{o.id.slice(0, 8)}</div>
                  <div className="text-xs text-muted-foreground">{new Date(o.created_at).toLocaleString()}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">${Number(o.total_amount).toFixed(2)}</div>
                  <span className="text-xs capitalize text-muted-foreground">{o.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
