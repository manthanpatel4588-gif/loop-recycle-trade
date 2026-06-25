import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Recycle, Factory, Truck, Boxes, Store, ArrowRight, LineChart, Sparkles, MapPin,
  ShieldCheck, Leaf, BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/SiteHeader";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EcoLoop — AI-Powered Circular Economy Platform" },
      { name: "description", content: "Connect industries, scrap collectors, recyclers, and retailers. Cut waste, track carbon, source recycled materials in one marketplace." },
      { property: "og:title", content: "EcoLoop — AI-Powered Circular Economy Platform" },
      { property: "og:description", content: "End-to-end SaaS for industrial waste, collection logistics, recycling, and the recycled-product marketplace." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader />

      {/* HERO */}
      <section className="bg-hero relative overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
              <Sparkles className="h-3.5 w-3.5" /> AI-powered circular economy
            </div>
            <h1 className="text-balance text-5xl font-semibold tracking-tight sm:text-6xl lg:text-7xl">
              Waste in.<span className="text-brand"> Value out.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
              EcoLoop connects industries, collectors, recyclers, and retailers on one platform —
              turning industrial waste streams into a measurable, marketable supply of recycled goods.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="bg-brand-gradient text-brand-foreground shadow-glow hover:opacity-90">
                <Link to="/auth">Start free <ArrowRight className="ml-1 h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="#process">See how it works</a>
              </Button>
            </div>
          </div>

          {/* preview tile */}
          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="rounded-2xl border border-border bg-card/80 p-6 shadow-card backdrop-blur">
              <div className="grid gap-4 sm:grid-cols-4">
                {[
                  { l: "Waste managed", v: "12,480 t", i: Recycle },
                  { l: "CO₂ avoided", v: "8,210 t", i: Leaf },
                  { l: "Active pickups", v: "342", i: Truck },
                  { l: "Marketplace SKUs", v: "1,026", i: Boxes },
                ].map((s) => (
                  <div key={s.l} className="rounded-xl border border-border/60 bg-surface-elevated p-4">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                      <s.i className="h-3.5 w-3.5 text-brand" /> {s.l}
                    </div>
                    <div className="mt-2 text-2xl font-semibold">{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">One platform. Four workflows.</h2>
            <p className="mt-4 text-muted-foreground">Built for every link in the circular chain — from factory floor to retail shelf.</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { i: Factory, t: "Waste Listings", d: "Industries post waste with quantity, photos, and pickup window. Approve collectors with one tap." },
              { i: MapPin, t: "Smart Matching", d: "AI ranks collectors by distance, specialty, rating, and prior performance for every listing." },
              { i: Store, t: "Recycled Marketplace", d: "Recyclers list certified products; retailers browse, request quotes, and order directly." },
              { i: BarChart3, t: "Sustainability Analytics", d: "Track waste diverted, CO₂ saved, and ESG metrics with monthly reports out of the box." },
            ].map((f) => (
              <div key={f.t} className="group rounded-2xl border border-border bg-card p-6 shadow-card transition hover:border-brand/40">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/15 text-brand">
                  <f.i className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{f.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section id="process" className="border-t border-border/60 bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">How the loop closes</h2>
            <p className="mt-4 text-muted-foreground">A single workflow links every party — no spreadsheets, no phone calls.</p>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-4">
            {[
              { n: "01", t: "Industry", d: "Post waste streams with photos, AI classifies category and value.", i: Factory },
              { n: "02", t: "Collector", d: "Bid on jobs, schedule pickup, upload geo-tagged proof.", i: Truck },
              { n: "03", t: "Recycler", d: "Track inventory, process into products, certify quality.", i: Recycle },
              { n: "04", t: "Retailer", d: "Browse marketplace, quote, order, track delivery.", i: Store },
            ].map((s, i) => (
              <div key={s.t} className="relative rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-widest text-brand">{s.n}</span>
                  <s.i className="h-5 w-5 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
                {i < 3 && (
                  <ArrowRight className="absolute -right-3 top-1/2 hidden h-5 w-5 -translate-y-1/2 text-border lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section id="stats" className="border-t border-border/60 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-4">
          {[
            { v: "12,480 t", l: "Waste managed" },
            { v: "8,210 t", l: "CO₂ avoided" },
            { v: "1,200+", l: "Verified partners" },
            { v: "$4.6M", l: "GMV processed" },
          ].map((s) => (
            <div key={s.l} className="border-l border-brand/40 pl-6">
              <div className="text-5xl font-semibold tracking-tight">{s.v}</div>
              <div className="mt-2 text-sm uppercase tracking-wide text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="testimonials" className="border-t border-border/60 bg-surface py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">Trusted by operators across the chain</h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { q: "We cut our landfill diversion paperwork in half and finally have a defensible ESG number.", n: "Anita R.", r: "Head of Sustainability, Polychem Industries" },
              { q: "I get matched to nearby jobs within minutes. My fleet utilization is up 38%.", n: "Marcus T.", r: "Founder, GreenHaul Logistics" },
              { q: "Our retail buyers love that every SKU traces back to the source waste stream.", n: "Priya M.", r: "Ops Lead, RePolymer Goods" },
            ].map((t) => (
              <figure key={t.n} className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <blockquote className="text-sm leading-relaxed">"{t.q}"</blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/15 text-sm font-semibold text-brand">{t.n.charAt(0)}</div>
                  <div className="text-sm">
                    <div className="font-medium">{t.n}</div>
                    <div className="text-muted-foreground">{t.r}</div>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-24">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
            <ShieldCheck className="h-3.5 w-3.5" /> Free to start
          </div>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Close your loop, today.</h2>
          <p className="mt-4 text-muted-foreground">Onboard your team in minutes. No credit card required.</p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-brand-gradient text-brand-foreground shadow-glow hover:opacity-90">
              <Link to="/auth">Create your account <ArrowRight className="ml-1 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-sm text-muted-foreground sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <Recycle className="h-4 w-4 text-brand" />
            <span>© {new Date().getFullYear()} EcoLoop</span>
          </div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-foreground">About</a>
            <a href="#" className="hover:text-foreground">Contact</a>
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
