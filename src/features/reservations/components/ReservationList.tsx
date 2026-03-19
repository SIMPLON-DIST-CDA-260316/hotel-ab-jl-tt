// TODO: type with reservation domain type once schema is defined
type ReservationListProps = {
  reservations: Record<string, unknown>[];
};

export function ReservationList({ reservations }: ReservationListProps) {
  return (
    <ul>
      {reservations.map((reservation, index) => (
        <li key={index}>{String(reservation.id ?? index)}</li>
      ))}
    </ul>
  );
}
