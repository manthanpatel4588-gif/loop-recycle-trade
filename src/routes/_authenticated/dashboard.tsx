import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardRedirect,
});

function DashboardRedirect() {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!profile?.onboarded || !profile?.active_role) {
      navigate({ to: "/onboarding", replace: true });
      return;
    }
    navigate({ to: `/${profile.active_role}`, replace: true });
  }, [profile, loading, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
      Loading your workspace…
    </div>
  );
}
