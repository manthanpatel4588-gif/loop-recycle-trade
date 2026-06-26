import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/recycler/inventory")({
  component: Inventory,
});

const CATEGORIES = ["plastic","metal","paper","glass","textile","rubber","ewaste","organic","chemical","other"] as const;
type Category = typeof CATEGORIES[number];

function Inventory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ category: "plastic" as Category, quantity: "", unit: "kg", notes: "" });

  const { data: items = [] } = useQuery({
    queryKey: ["inv", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("recycler_inventory").select("*").eq("recycler_user_id", user!.id).order("created_at", { ascending: false })).data ?? [],
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("no user");
      const { error } = await supabase.from("recycler_inventory").insert({
        recycler_user_id: user.id, category: form.category, quantity: Number(form.quantity), unit: form.unit, notes: form.notes,
      });
      if (error) throw error;
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["inv"] }); toast.success("Added"); setOpen(false); setForm({ category: "plastic", quantity: "", unit: "kg", notes: "" }); },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell role="recycler" title="Inventory">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="bg-brand-gradient text-brand-foreground hover:opacity-90"><Plus className="mr-1 h-4 w-4" />Add stock</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Add inventory</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Category</Label>
                  <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>Quantity</Label><Input required type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Notes</Label><Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
                <Button type="submit" disabled={create.isPending} className="w-full bg-brand-gradient text-brand-foreground hover:opacity-90">Add</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          {items.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No inventory yet.</div>}
          <div className="divide-y divide-border">
            {items.map((i) => (
              <div key={i.id} className="grid grid-cols-[1fr_auto_auto] items-center gap-3 px-5 py-3 text-sm">
                <div className="font-medium capitalize">{i.category}</div>
                <div>{i.quantity} {i.unit}</div>
                <div className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
