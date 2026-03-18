import Link from "next/link";

export default function Page() {
  return (
    <div>
      <p>landing page</p>
      <Link href="/establishments" className="underline">
        Nos établissements
      </Link>
    </div>
  );
}