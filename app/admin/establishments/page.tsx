import Link from "next/link";
import { getEstablishments } from "@/features/establishments/queries/get-establishments";
import { DeleteEstablishmentButton } from "@/features/establishments/components/DeleteEstablishmentButton";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default async function AdminEstablishmentsPage() {
  // TODO: vérifier rôle admin

  const establishments = await getEstablishments();

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Gestion des établissements</h1>
        <Button asChild>
          <Link href="/admin/establishments/new">Ajouter</Link>
        </Button>
      </div>

      {establishments.length === 0 ? (
        <p className="text-muted-foreground">Aucun établissement.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {establishments.map((establishment) => (
              <TableRow key={establishment.id}>
                <TableCell className="font-medium">
                  {establishment.name}
                </TableCell>
                <TableCell>{establishment.city}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <Link
                        href={`/admin/establishments/${establishment.id}/edit`}
                      >
                        Modifier
                      </Link>
                    </Button>
                    <DeleteEstablishmentButton
                      id={establishment.id}
                      name={establishment.name}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </main>
  );
}
