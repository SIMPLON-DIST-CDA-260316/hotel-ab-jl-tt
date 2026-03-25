"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteManager } from "../actions/delete-manager";

type DeleteManagerButtonProps = {
  id: string;
  name: string;
};

export function DeleteManagerButton({ id, name }: DeleteManagerButtonProps) {
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleDelete(event: React.MouseEvent) {
    event.preventDefault();
    startTransition(async () => {
      const result = await deleteManager(id);
      if (!result.success) {
        setError(result.error);
      } else {
        setOpen(false);
      }
    });
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) setError(null);
      }}
    >
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Supprimer
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Supprimer {name} ?</AlertDialogTitle>
          <AlertDialogDescription>
            Le compte sera désactivé. Le gérant ne pourra plus se connecter. Ses
            données sont conservées pour l&apos;historique.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && (
          <p className="text-sm font-medium text-destructive">{error}</p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Annuler</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
