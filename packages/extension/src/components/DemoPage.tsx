import { ArrowUpRight, Check, Layers, Play, Shield } from "lucide-react";

export function DemoPage() {
  const featureCards = [
    {
      title: "Signal inbox",
      body: "Capture key quotes, screenshots, docs, and links from every customer conversation.",
      Icon: Layers,
    },
    {
      title: "Launch guardrails",
      body: "Keep compliance checks, pricing experiments, and release notes visible together.",
      Icon: Shield,
    },
    {
      title: "Async briefings",
      body: "Give execs a tight weekly view without asking teams for yet another status deck.",
      Icon: Play,
    },
  ];

  return (
    <main className="min-h-screen bg-[#f3f1ea] text-[#20211d]">
      <header className="sticky top-0 z-10 border-b border-black/10 bg-[#f8f6ef]/88 px-10 py-4 backdrop-blur">
        <div className="flex max-w-6xl items-center justify-between">
          <div className="font-display text-xl font-black tracking-tight">Northstar</div>
          <nav className="flex items-center gap-6 text-sm font-semibold text-black/60">
            <a href="#features">Platform</a>
            <a href="#pricing">Pricing</a>
            <a href="https://stripe.com" data-demo-link>
              Payments
            </a>
            <button className="rounded-md bg-[#20211d] px-4 py-2 text-white">Start trial</button>
          </nav>
        </div>
      </header>

      <section className="grid max-w-6xl grid-cols-[1fr_420px] gap-12 px-10 py-16">
        <div>
          <p className="mb-4 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-black/55">
            Product operations
          </p>
          <h1 className="max-w-3xl font-display text-6xl font-black leading-[0.95] tracking-tight">
            Turn scattered customer signals into a clean launch plan.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-black/65">
            Northstar brings roadmap notes, support tickets, product analytics, pricing feedback, and launch
            tasks into one operating rhythm for teams shipping fast.
          </p>
          <div className="mt-8 flex gap-3">
            <a className="inline-flex items-center gap-2 rounded-md bg-[#20211d] px-5 py-3 text-sm font-bold text-white" href="https://example.com/demo">
              Book demo <ArrowUpRight size={16} />
            </a>
            <a className="inline-flex items-center gap-2 rounded-md border border-black/12 bg-white px-5 py-3 text-sm font-bold" href="https://example.com/report">
              Read report
            </a>
          </div>
        </div>
        <img
          className="h-[460px] w-full rounded-xl object-cover shadow-2xl"
          alt="A focused product team reviewing notes on a wall"
          src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80"
        />
      </section>

      <section id="features" className="grid max-w-6xl grid-cols-3 gap-5 px-10 pb-12">
        {featureCards.map(({ title, body, Icon }) => (
          <article key={title} className="rounded-xl border border-black/10 bg-white p-6 shadow-sm">
            <Icon className="mb-8 text-[#1b7f6a]" size={28} />
            <h2 className="text-xl font-black">{title}</h2>
            <p className="mt-3 leading-7 text-black/62">{body}</p>
          </article>
        ))}
      </section>

      <section id="pricing" className="max-w-6xl px-10 pb-24">
        <h2 className="mb-5 text-3xl font-black">Simple pricing for teams that ship weekly.</h2>
        <div className="grid grid-cols-3 gap-5">
          {["Starter", "Growth", "Enterprise"].map((plan, index) => (
            <article key={plan} className="rounded-xl border border-black/10 bg-[#fffdf7] p-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black">{plan}</h3>
                <span className="rounded-full bg-[#dff8ef] px-2 py-1 text-xs font-bold text-[#135845]">{index === 1 ? "Popular" : "Plan"}</span>
              </div>
              <p className="mt-4 text-4xl font-black">${[19, 49, 99][index]}</p>
              <ul className="mt-5 space-y-3 text-sm text-black/64">
                <li className="flex gap-2"><Check size={16} /> Unlimited capture boards</li>
                <li className="flex gap-2"><Check size={16} /> Customer source metadata</li>
                <li className="flex gap-2"><Check size={16} /> Weekly roadmap exports</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
