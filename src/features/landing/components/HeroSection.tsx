import { HeroSearchCard } from "./HeroSearchCard";

export function HeroSection() {
  return (
    <section className="relative flex min-h-[70vh] items-center overflow-hidden bg-gray-900">
      {/* Gradient fallback — replace with next/image + real photo later */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center gap-8 px-6 py-16 md:flex-row md:items-center md:gap-12">
        {/* Branding */}
        <div className="flex-1 text-white">
          <p className="text-xs uppercase tracking-[0.2em] text-white/60">
            Chaîne hôtelière rurale
          </p>
          <h1 className="mt-3 text-4xl font-light leading-tight md:text-5xl">
            Trouver votre séjour
            <br />
            sous les étoiles
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">
            Des maisons de caractère nichées en forêt, en vallée, à deux pas
            d&apos;un village. Loin du bruit, proches de l&apos;essentiel et des
            étoiles.
          </p>
        </div>

        {/* Search card */}
        <HeroSearchCard />
      </div>
    </section>
  );
}
