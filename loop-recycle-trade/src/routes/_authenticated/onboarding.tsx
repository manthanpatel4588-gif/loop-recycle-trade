import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Factory, Truck, Recycle, Store, Check } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/onboarding")({
  component: Onboarding,
});

const ROLES: { role: AppRole; title: string; desc: string; icon: typeof Factory }[] = [
  { role: "industry", title: "Industry", desc: "Generate waste, post listings, track sustainability.", icon: Factory },
  { role: "collector", title: "Collector", desc: "Pick up industrial waste, manage routes and earnings.", icon: Truck },
  { role: "recycler", title: "Recycler", desc: "Process waste, manage inventory, sell recycled products.", icon: Recycle },
  { role: "retailer", title: "Retailer", desc: "Browse and buy recycled products from the marketplace.", icon: Store },
];

function Onboarding() {
  const { user, refresh } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<AppRole | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [city, setCity] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!user || !role) return;
    setBusy(true);
    try {
      // 1. role
      const { error: rErr } = await supabase.from("user_roles").upsert({ user_id: user.id, role }, { onConflict: "user_id,role" });
      if (rErr) throw rErr;

      // 2. role-specific profile row
      const table = role === "industry" ? "industries" : role === "collector" ? "collectors" : role === "recycler" ? "recyclers" : "retailers";
      const { error: pErr } = await supabase.from(table).upsert({ user_id: user.id, company_name: companyName, city }, { onConflict: "user_id" });
      if (pErr) throw pErr;

      // 3. mark profile onboarded
      const { error: prErr } = await supabase.from("profiles").update({ active_role: role, onboarded: true }).eq("id", user.id);
      if (prErr) throw prErr;

      await refresh();
      toast.success("You're all set");
      navigate({ to: `/${role}`, replace: true });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-hero min-h-screen px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Welcome to EcoLoop</h1>
          <p className="mt-2 text-muted-foreground">Tell us how you'll be using the platform.</p>
        </div>

        {step === 1 && (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
              {ROLES.map((r) => {
                const active = role === r.role;
                return (
                  <button
                    key={r.role}
                    onClick={() => setRole(r.role)}
                    className={cn(
                      "rounded-2xl border bg-card p-6 text-left shadow-card transition",
                      active ? "border-brand shadow-glow" : "border-border hover:border-brand/50",
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
                        <r.icon className="h-5 w-5" />
                      </div>
                      {active && <Check className="h-5 w-5 text-brand" />}
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">{r.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{r.desc}</p>
                  </button>
                );
              })}
            </div>
            <div className="mt-8 flex justify-end">
              <Button disabled={!role} onClick={() => setStep(2)} className="bg-brand-gradient text-brand-foreground hover:opacity-90">
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 2 && role && (
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <h2 className="text-xl font-semibold">A few details</h2>
            <p className="text-sm text-muted-foreground">We'll set up your {ROLES.find(r => r.role === role)?.title} workspace.</p>
            <div className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label>Company name</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} />
              </div>
            </div>
            <div className="mt-8 flex justify-between">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button disabled={!companyName || busy} onClick={submit} className="bg-brand-gradient text-brand-foreground hover:opacity-90">
                {busy ? "Setting up…" : "Enter EcoLoop"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
