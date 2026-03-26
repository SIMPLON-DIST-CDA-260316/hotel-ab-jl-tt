"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type PendingBookingAlertProps = {
  open: boolean;
  suiteName: string;
  reference: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export function PendingBookingAlert({
  open,
  suiteName,
  reference,
  onConfirm,
  onCancel,
}: PendingBookingAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Réservation en attente existante</AlertDialogTitle>
          <AlertDialogDescription>
            Vous avez déjà une réservation en attente pour{" "}
            <strong>{suiteName}</strong> (réf. {reference}). En continuant,
            cette réservation sera annulée et remplacée par la nouvelle.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>
            Remplacer la réservation
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
