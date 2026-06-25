import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/collector/jobs")({
  component: Jobs,
});

function Jobs() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [openId, setOpenId] = useState<string | null>(null);
  const [price, setPrice] = useState("");
  const [message, setMessage] = useState("");

  const { data: jobs = [] } = useQuery({
    queryKey: ["available-jobs"],
    queryFn: async () => {
      const { data } = await supabase.from("waste_listings").select("*").eq("status", "active").order("created_at", { ascending: false }).limit(50);
      return data ?? [];
    },
  });

  const submit = useMutation({
    mutationFn: async (listingId: string) => {
      const listing = jobs.find((j) => j.id === listingId);
      if (!listing || !user) throw new Error("missing");
      const { error } = await supabase.from("pickup_requests").insert({
        listing_id: listingId,
        collector_user_id: user.id,
        industry_user_id: listing.industry_user_id,
        offered_price: price ? Number(price) : null,
        message,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Request sent");
      qc.invalidateQueries({ queryKey: ["collector-pickups"] });
      setOpenId(null); setPrice(""); setMessage("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <AppShell role="collector" title="Browse Jobs">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {jobs.length === 0 && <div className="col-span-full rounded-2xl border border-border bg-card p-10 text-center text-sm text-muted-foreground shadow-card">No active jobs right now.</div>}
        {jobs.map((j) => (
          <div key={j.id} className="rounded-2xl border border-border bg-card p-5 shadow-card">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{j.title}</h3>
                <p className="text-xs text-muted-foreground capitalize">{j.category} · {j.city}</p>
              </div>
              <span className="text-xs rounded-full border border-border bg-surface-elevated px-2 py-0.5">{j.quantity} {j.unit}</span>
            </div>
            {j.description && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{j.description}</p>}
            <Dialog open={openId === j.id} onOpenChange={(o) => setOpenId(o ? j.id : null)}>
              <DialogTrigger asChild>
                <Button size="sm" className="mt-4 w-full bg-brand-gradient text-brand-foreground hover:opacity-90">Request pickup</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Request pickup</DialogTitle></DialogHeader>
                <form onSubmit={(e) => { e.preventDefault(); submit.mutate(j.id); }} className="space-y-4">
                  <div className="space-y-2"><Label>Offered price ($)</Label><Input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} /></div>
                  <div className="space-y-2"><Label>Message</Label><Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Pickup window, equipment, etc." /></div>
                  <Button type="submit" disabled={submit.isPending} className="w-full bg-brand-gradient text-brand-foreground hover:opacity-90">{submit.isPending ? "Sending…" : "Send request"}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        ))}
      </div>
    </AppShell>
  );
}
