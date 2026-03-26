import { HIGHLIGHTS } from "../lib/landing-content";

export function HighlightsSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-5xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Pourquoi nous choisir
        </p>
        <div className="mt-14 grid grid-cols-1 gap-12 sm:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <div key={highlight.title} className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-accent">
                <highlight.icon className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-base font-semibold">
                {highlight.title}
              </h3>
              <p className="mx-auto mt-3 max-w-[240px] text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
