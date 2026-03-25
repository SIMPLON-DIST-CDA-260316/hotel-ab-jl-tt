import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type SuiteBookingSidebarProps = {
  capacity: number;
  isAuthenticated: boolean;
};

export function SuiteBookingSidebar({ capacity, isAuthenticated }: SuiteBookingSidebarProps) {
  return (
    <aside className="hidden lg:block w-[340px] shrink-0 sticky top-8" aria-label="Réservation">
      <Card className="rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border border-zinc-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-zinc-100">
              <div className="p-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-zinc-300 tracking-widest uppercase">Arrivée</span>
                <span className="text-sm font-medium text-zinc-800">— mars 2026</span>
              </div>
              <div className="p-4 flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-zinc-300 tracking-widest uppercase">Départ</span>
                <span className="text-sm font-medium text-zinc-800">— mars 2026</span>
              </div>
            </div>
            <div className="border-t border-zinc-100 p-4 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-zinc-300 tracking-widest uppercase">Voyageurs</span>
                <span className="text-sm font-medium text-zinc-800">
                  {capacity} voyageur{capacity > 1 ? "s" : ""}
                </span>
              </div>
              <svg className="size-4 text-zinc-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          <div className="pt-4 px-0 space-y-3">
            {isAuthenticated ? (
              <Button className="w-full h-12 rounded-xl font-semibold" disabled>
                Réserver
              </Button>
            ) : (
              <Button className="w-full h-12 rounded-xl font-semibold" asChild>
                <Link href="/sign-in">Se connecter pour réserver</Link>
              </Button>
            )}
            <p className="text-center text-[11px] text-zinc-400 flex items-center justify-center gap-1.5">
              <svg className="size-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" aria-hidden>
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              Annulation gratuite disponible
            </p>
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}
