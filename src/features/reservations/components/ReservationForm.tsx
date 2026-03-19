"use client";

import { Button } from "@/components/ui/button";

type ReservationFormProps = {
  suiteId: string;
};

export function ReservationForm({ suiteId }: ReservationFormProps) {
  return (
    <form>
      <input type="hidden" name="suiteId" value={suiteId} />
      <Button type="submit">Réserver</Button>
    </form>
  );
}
