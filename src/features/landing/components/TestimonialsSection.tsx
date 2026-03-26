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

export function TestimonialsSection() {
  return (
    <section className="bg-secondary py-16">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Ce que disent nos hôtes
        </p>
        <h2 className="mt-2 text-center text-2xl font-semibold">
          Témoignages
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <div
              key={testimonial.author}
              className="rounded-lg bg-card p-6 shadow-sm"
            >
              <StarRating rating={testimonial.rating} />
              <blockquote className="mt-4 text-sm italic leading-relaxed text-muted-foreground">
                &laquo; {testimonial.quote} &raquo;
              </blockquote>
              <div className="mt-4">
                <p className="text-sm font-semibold">{testimonial.author}</p>
                <p className="text-xs text-muted-foreground">
                  {testimonial.establishment} · Google Reviews
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
