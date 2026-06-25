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

export const Route = createFileRoute("/_authenticated/industry/listings")({
  component: Listings,
});

const CATEGORIES = ["plastic","metal","paper","glass","textile","rubber","ewaste","organic","chemical","other"] as const;
type Category = typeof CATEGORIES[number];

function Listings() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: "plastic" as Category,
    quantity: "", unit: "kg", pickup_address: "", city: "",
  });

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["listings", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("waste_listings").select("*").eq("industry_user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("not signed in");
      const { error } = await supabase.from("waste_listings").insert({
        industry_user_id: user.id,
        title: form.title,
        description: form.description,
        category: form.category,
        quantity: Number(form.quantity),
        unit: form.unit,
        pickup_address: form.pickup_address,
        city: form.city,
        status: "active",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Listing posted");
      qc.invalidateQueries({ queryKey: ["listings"] });
      qc.invalidateQueries({ queryKey: ["industry-listings"] });
      setOpen(false);
      setForm({ title: "", description: "", category: "plastic", quantity: "", unit: "kg", pickup_address: "", city: "" });
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell role="industry" title="Waste Listings">
      <div className="space-y-6">
        <div className="flex justify-end">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-brand-gradient text-brand-foreground hover:opacity-90"><Plus className="mr-1 h-4 w-4" />New listing</Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Post a waste listing</DialogTitle></DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); create.mutate(); }} className="space-y-4">
                <div className="space-y-2"><Label>Title</Label><Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={form.category} onValueChange={(v: Category) => setForm({ ...form, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2"><Label>Quantity</Label><Input required type="number" step="0.01" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
                </div>
                <div className="space-y-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2"><Label>City</Label><Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div>
                  <div className="space-y-2"><Label>Pickup address</Label><Input value={form.pickup_address} onChange={(e) => setForm({ ...form, pickup_address: e.target.value })} /></div>
                </div>
                <Button disabled={create.isPending} type="submit" className="w-full bg-brand-gradient text-brand-foreground hover:opacity-90">
                  {create.isPending ? "Posting…" : "Post listing"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-card">
          {isLoading && <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && items.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No listings yet.</div>}
          <div className="divide-y divide-border">
            {items.map((i) => (
              <div key={i.id} className="grid grid-cols-1 gap-2 px-5 py-4 sm:grid-cols-[1fr_auto_auto_auto] sm:items-center">
                <div>
                  <div className="font-medium">{i.title}</div>
                  <div className="text-xs text-muted-foreground capitalize">{i.category} · {i.city}</div>
                </div>
                <div className="text-sm">{i.quantity} {i.unit}</div>
                <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs capitalize">{i.status}</span>
                <div className="text-xs text-muted-foreground">{new Date(i.created_at).toLocaleDateString()}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
