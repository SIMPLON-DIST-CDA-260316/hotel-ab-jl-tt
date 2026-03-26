import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteManagerButton } from "@/features/managers/components/DeleteManagerButton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getInquiries } from "@/features/inquiries/queries/get-inquiries";

export default async function AdminManagersPage() {
  const inquiries = await getInquiries();

  const subjects = [
    { name: "complaint", text: "Je souhaite poser une réclamation" },
    {
      name: "extra_service",
      text: "Je souhaite commander un service supplémentaire",
    },
    { name: "suite_info", text: "Je souhaite en savoir plus sur une suite" },
    { name: "app_issue", text: "J'ai un souci avec cette application" },
  ];

  return (
    <main className="container mx-auto px-4 py-8">
      <nav className="mb-4 text-sm text-muted-foreground">
        <Link href="/admin/establishments" className="hover:underline">
          Établissements
        </Link>
        {" / "}
        <span className="text-foreground font-medium">Messages</span>
      </nav>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Messagerie</h1>
      </div>

      {inquiries.length === 0 ? (
        <p className="text-muted-foreground">Aucun message.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Objet</TableHead>
              <TableHead>Etablissement</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inquiries.map((inquiry) => (
              <TableRow key={inquiry.id}>
                <TableCell className="font-medium">{inquiry.name}</TableCell>
                <TableCell>{inquiry.email}</TableCell>
                <TableCell>
                  {subjects.find((s) => (s.name === inquiry.subject))?.text}
                </TableCell>
                <TableCell>{inquiry.establishmentName}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
