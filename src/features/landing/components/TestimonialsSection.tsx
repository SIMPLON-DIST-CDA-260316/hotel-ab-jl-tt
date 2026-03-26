import { Star } from "lucide-react";
import { TESTIMONIALS } from "../lib/landing-content";

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5" aria-label={`${rating} étoiles sur 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={`h-4 w-4 ${
            index < rating
              ? "fill-accent text-accent"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function getInitials(name: string): string {
  return name
    .split(/[\s&]+/)
    .filter((word) => word.length > 0)
    .map((word) => word[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialsSection() {
  return (
    <section className="bg-secondary py-20">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Ce que disent nos hôtes
        </p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-xl border border-border bg-card p-6 shadow-md"
            >
              <StarRating rating={testimonial.rating} />
              <blockquote className="mt-4 text-sm italic leading-relaxed text-muted-foreground">
                &laquo; {testimonial.quote} &raquo;
              </blockquote>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground"
                  aria-hidden="true"
                >
                  {getInitials(testimonial.author)}
                </div>
                <div>
                  <p className="text-sm font-semibold">
                    {testimonial.author}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {testimonial.establishment} · Google Reviews
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
