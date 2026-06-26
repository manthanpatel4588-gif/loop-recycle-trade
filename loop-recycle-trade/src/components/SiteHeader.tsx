import { Link } from "@tanstack/react-router";
import { Recycle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

export function SiteHeader() {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-gradient text-brand-foreground shadow-glow">
            <Recycle className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <span className="text-base font-semibold tracking-tight">EcoLoop</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Platform</a>
          <a href="#process" className="hover:text-foreground">How it works</a>
          <a href="#stats" className="hover:text-foreground">Impact</a>
          <a href="#testimonials" className="hover:text-foreground">Customers</a>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <Button asChild size="sm"><Link to="/dashboard">Dashboard</Link></Button>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/auth">Sign in</Link></Button>
              <Button asChild size="sm" className="bg-brand-gradient text-brand-foreground hover:opacity-90"><Link to="/auth">Get started</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
