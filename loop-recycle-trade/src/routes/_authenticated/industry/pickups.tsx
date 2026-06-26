import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/industry/pickups")({
  component: IndustryPickups,
});

function IndustryPickups() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: requests = [] } = useQuery({
    queryKey: ["industry-pickup-requests", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("pickup_requests")
        .select("id,status,offered_price,message,created_at,collector_user_id,listing_id,waste_listings(title,quantity,unit)")
        .eq("industry_user_id", user!.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const update = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "approved" | "rejected" }) => {
      const { error } = await supabase.from("pickup_requests").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["industry-pickup-requests"] });
      toast.success("Updated");
    },
  });

  return (
    <AppShell role="industry" title="Pickup Requests">
      <div className="rounded-2xl border border-border bg-card shadow-card">
        {requests.length === 0 && <div className="p-10 text-center text-sm text-muted-foreground">No pickup requests yet.</div>}
        <div className="divide-y divide-border">
          {requests.map((r) => {
            const listing = (r as { waste_listings?: { title: string; quantity: number; unit: string } }).waste_listings;
            return (
              <div key={r.id} className="grid grid-cols-1 gap-3 px-5 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                <div>
                  <div className="font-medium">{listing?.title ?? "Listing"}</div>
                  <div className="text-xs text-muted-foreground">{listing?.quantity} {listing?.unit} · offered ${r.offered_price ?? "—"}</div>
                  {r.message && <p className="mt-1 text-xs text-muted-foreground">"{r.message}"</p>}
                </div>
                <span className="rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-xs capitalize">{r.status}</span>
                <div className="flex gap-2">
                  {r.status === "requested" && (
                    <>
                      <Button size="sm" onClick={() => update.mutate({ id: r.id, status: "approved" })} className="bg-brand-gradient text-brand-foreground hover:opacity-90">Approve</Button>
                      <Button size="sm" variant="outline" onClick={() => update.mutate({ id: r.id, status: "rejected" })}>Reject</Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
