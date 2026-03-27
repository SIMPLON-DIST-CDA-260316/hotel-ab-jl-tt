import { CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { shortDateFormatter, currencyFormatter } from "@/lib/formatters";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import {
  STATUS_LABELS,
  STATUS_BADGE_CLASSES,
  EXPIRED_BADGE_CLASS,
} from "../lib/booking-status-display";
import type { ManagerBooking } from "../queries/get-manager-bookings";

interface ManagerBookingsTableProps {
  bookings: ManagerBooking[];
}

export function ManagerBookingsTable({ bookings }: ManagerBookingsTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <div className="rounded-full bg-muted p-4">
          <CalendarDays className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="font-medium">Aucune réservation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Les réservations de vos établissements apparaîtront ici.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Référence</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Suite</TableHead>
          <TableHead>Établissement</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead>Statut</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((managerBooking) => (
          <ManagerBookingRow
            key={managerBooking.id}
            booking={managerBooking}
          />
        ))}
      </TableBody>
    </Table>
  );
}

interface ManagerBookingRowProps {
  booking: ManagerBooking;
}

function ManagerBookingRow({ booking: bookingData }: ManagerBookingRowProps) {
  const now = new Date();
  const isPendingExpired =
    bookingData.status === BOOKING_STATUSES.PENDING &&
    bookingData.expiresAt &&
    new Date(bookingData.expiresAt) < now;

  const displayStatus = isPendingExpired
    ? "Expirée"
    : STATUS_LABELS[bookingData.status];
  const badgeClass = isPendingExpired
    ? EXPIRED_BADGE_CLASS
    : STATUS_BADGE_CLASSES[bookingData.status];

  return (
    <TableRow>
      <TableCell className="font-mono text-xs">
        {bookingData.reference}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span className="font-medium">{bookingData.client.name}</span>
          <span className="text-xs text-muted-foreground">
            {bookingData.client.email}
          </span>
        </div>
      </TableCell>
      <TableCell>{bookingData.suite.title}</TableCell>
      <TableCell>{bookingData.establishment.name}</TableCell>
      <TableCell>
        <span className="text-sm">
          {shortDateFormatter.format(new Date(bookingData.checkIn))}
          {" → "}
          {shortDateFormatter.format(new Date(bookingData.checkOut))}
        </span>
      </TableCell>
      <TableCell className="text-right font-medium">
        {currencyFormatter.format(Number(bookingData.totalPrice))}
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={badgeClass}>
          {displayStatus}
        </Badge>
      </TableCell>
    </TableRow>
  );
}
