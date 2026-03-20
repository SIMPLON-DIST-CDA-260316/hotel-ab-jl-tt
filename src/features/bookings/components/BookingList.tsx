// TODO: type with booking domain type once schema is defined
export function BookingList({ bookings }: { bookings: Record<string, unknown>[] }) {
  return (
    <ul>
      {bookings.map((booking, index) => (
        <li key={index}>{String(booking.id ?? index)}</li>
      ))}
    </ul>
  );
}
