import Link from "next/link";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-8">
      <h1 className="text-2xl font-bold">Clair de Lune</h1>
      <nav className="flex flex-col gap-2">
        <Link href="/establishments" className="underline">
          Nos établissements
        </Link>
        <Link href="/admin/establishments" className="underline">
          Administration
        </Link>
      </nav>
    </div>
  );
}