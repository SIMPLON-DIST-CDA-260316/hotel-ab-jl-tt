import { BOOKING_STATUSES } from "@/config/booking-statuses";

export const STATUS_LABELS: Record<string, string> = {
  [BOOKING_STATUSES.PENDING]: "En attente",
  [BOOKING_STATUSES.CONFIRMED]: "Confirmée",
  [BOOKING_STATUSES.CANCELLED]: "Annulée",
  [BOOKING_STATUSES.COMPLETED]: "Terminée",
};

export const STATUS_BADGE_CLASSES: Record<string, string> = {
  [BOOKING_STATUSES.PENDING]:
    "border-amber-200/60 bg-amber-50/90 text-amber-700 dark:border-amber-800 dark:bg-amber-950/90 dark:text-amber-300",
  [BOOKING_STATUSES.CONFIRMED]:
    "border-green-200/60 bg-green-50/90 text-green-700 dark:border-green-800 dark:bg-green-950/90 dark:text-green-300",
  [BOOKING_STATUSES.CANCELLED]:
    "border-red-200/60 bg-red-50/90 text-red-700 dark:border-red-800 dark:bg-red-950/90 dark:text-red-300",
  [BOOKING_STATUSES.COMPLETED]:
    "border-zinc-200/60 bg-zinc-50/90 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900/90 dark:text-zinc-400",
};

export const EXPIRED_BADGE_CLASS =
  "border-red-200/60 bg-red-50/90 text-red-700 dark:border-red-800 dark:bg-red-950/90 dark:text-red-300";
