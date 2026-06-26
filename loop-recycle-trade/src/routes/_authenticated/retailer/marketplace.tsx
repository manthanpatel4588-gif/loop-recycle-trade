import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Search, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/retailer/marketplace")({
  component: Marketplace,
});

const CATEGORIES = ["all","plastic","metal","paper","glass","textile","rubber","ewaste","organic","chemical","other"] as const;

function Marketplace() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("all");

  const { data: products = [] } = useQuery({
    queryKey: ["marketplace", cat, q],
    queryFn: async () => {
      let qb = supabase.from("products").select("*").eq("is_active", true).order("created_at", { ascending: false }).limit(60);
      if (cat !== "all") qb = qb.eq("category", cat as "plastic");
      if (q) qb = qb.ilike("name", `%${q}%`);
      const { data } = await qb;
      return data ?? [];
    },
  });

  const addToCart = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) throw new Error("no user");
      const { error } = await supabase.from("cart_items").upsert({ user_id: user.id, product_id: productId, quantity: 1 }, { onConflict: "user_id,product_id" });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cart"] }); toast.success("Added to cart"); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell role="retailer" title="Marketplace">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products" className="pl-9" />
          </div>
          <Select value={cat} onValueChange={setCat}>
            <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
            <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 && <div className="col-span-full rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-card">No products found.</div>}
          {products.map((p) => (
            <div key={p.id} className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold">{p.name}</h3>
                  <p className="text-xs text-muted-foreground capitalize">{p.category}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">${Number(p.price).toFixed(2)}</div>
                  <div className="text-xs text-muted-foreground">{p.available_quantity} {p.unit}</div>
                </div>
              </div>
              {p.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              <Button size="sm" className="mt-4 bg-brand-gradient text-brand-foreground hover:opacity-90" onClick={() => addToCart.mutate(p.id)}>
                <ShoppingCart className="mr-1 h-4 w-4" /> Add to cart
              </Button>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
