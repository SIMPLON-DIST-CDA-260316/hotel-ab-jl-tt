import { Skeleton } from "@/components/ui/skeleton";

export default function SuitesLoading() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <Skeleton className="mb-6 h-8 w-72" />
      <div className="flex gap-8">
        <aside className="hidden w-60 shrink-0 lg:block">
          <Skeleton className="h-96 w-full" />
        </aside>
        <div className="flex-1">
          <Skeleton className="mb-4 h-5 w-40" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex flex-col gap-2">
                <Skeleton className="aspect-[16/10] w-full rounded-lg" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-5 w-1/3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
