// TODO: type with reservation domain type once schema is defined
export function ReservationList({ reservations }: { reservations: Record<string, unknown>[] }) {
  return (
    <ul>
      {reservations.map((r, i) => (
        <li key={i}>{String(r.id ?? i)}</li>
      ))}
    </ul>
  );
}
