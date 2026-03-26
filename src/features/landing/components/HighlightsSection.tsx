import { HIGHLIGHTS } from "../lib/landing-content";

export function HighlightsSection() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Pourquoi nous choisir
        </p>
        <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3">
          {HIGHLIGHTS.map((highlight) => (
            <div key={highlight.title} className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-900 text-white">
                <highlight.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{highlight.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {highlight.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
