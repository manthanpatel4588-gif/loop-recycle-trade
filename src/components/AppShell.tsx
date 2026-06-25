import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { type ReactNode } from "react";
import {
  Recycle, LayoutDashboard, Factory, Truck, Boxes, Store, ShieldCheck,
  LogOut, Bell, MessageSquare, Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, type AppRole } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

const ROLE_LINKS: Record<AppRole, { to: string; label: string; icon: typeof Factory }[]> = {
  industry: [
    { to: "/industry", label: "Dashboard", icon: LayoutDashboard },
    { to: "/industry/listings", label: "Waste Listings", icon: Factory },
    { to: "/industry/pickups", label: "Pickups", icon: Truck },
    { to: "/industry/sustainability", label: "Sustainability", icon: Recycle },
  ],
  collector: [
    { to: "/collector", label: "Dashboard", icon: LayoutDashboard },
    { to: "/collector/jobs", label: "Browse Jobs", icon: Factory },
    { to: "/collector/pickups", label: "My Pickups", icon: Truck },
  ],
  recycler: [
    { to: "/recycler", label: "Dashboard", icon: LayoutDashboard },
    { to: "/recycler/inventory", label: "Inventory", icon: Boxes },
    { to: "/recycler/products", label: "Products", icon: Store },
  ],
  retailer: [
    { to: "/retailer", label: "Dashboard", icon: LayoutDashboard },
    { to: "/retailer/marketplace", label: "Marketplace", icon: Store },
    { to: "/retailer/orders", label: "Orders", icon: Boxes },
  ],
  admin: [
    { to: "/admin", label: "Overview", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: ShieldCheck },
  ],
};

export function AppShell({ role, children, title }: { role: AppRole; children: ReactNode; title: string }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const links = ROLE_LINKS[role];

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: "/", replace: true });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar md:flex md:flex-col">
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-brand-foreground shadow-glow">
            <Recycle className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight">EcoLoop</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{role}</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {links.map((l) => {
            const active = location.pathname === l.to || location.pathname.startsWith(l.to + "/");
            return (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground",
                )}
              >
                <l.icon className="h-4 w-4" />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          <button onClick={handleSignOut} className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground">
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-border bg-background/70 px-4 backdrop-blur sm:px-6">
          <div>
            <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
            <p className="text-xs text-muted-foreground">{profile?.full_name ?? profile?.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost"><Bell className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost"><MessageSquare className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost"><Settings className="h-4 w-4" /></Button>
          </div>
        </header>
        <main className="flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
