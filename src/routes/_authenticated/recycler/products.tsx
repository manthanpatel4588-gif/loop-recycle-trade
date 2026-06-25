import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/recycler/products")({
  component: Products,
});

const CATEGORIES = ["plastic","metal","paper","glass","textile","rubber","ewaste","organic","chemical","other"] as const;
type Category = typeof CATEGORIES[number];

function Products() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", category: "plastic" as Category, description: "", price: "", available_quantity: "", unit: "kg" });

  const { data: products = [] } = useQuery({
    queryKey: ["my-products", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("products").select("*").eq("recycler_user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("no user");
      const { error } = await supabase.from("products").insert({
        recycler_user_id: user.id, name: form.name, category: form.category, description: form.description,
        price: Number(form.price), available_quantity: Number(form.available_quantity), unit: form.unit,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["my-products"] }); toast.success("Listed"); setOpen(false); setForm({ name: "", category: "plastic", description: "", price: "", available_quantity: "", unit: "kg" }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell role="recycler" title="Products">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-brand-gradient text-brand-foreground hover:opacity-90"><Plus className="mr-1 h-4 w-4" />New product</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>List a recycled product</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Name</Label><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Category</Label>
                    <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Price ($)</Label><Input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Quantity</Label><Input required type="number" step="0.01" value={form.available_quantity} onChange={(e) => setForm({ ...form, available_quantity: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <Button type="submit" disabled={create.isPending} className="w-full bg-brand-gradient text-brand-foreground hover:opacity-90">List</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.length === 0 && <div className="col-span-full rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-card">No products yet.</div>}
          {products.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
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
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
