"use client";

import { Button } from "@/components/ui/button";

export function ReservationForm({ suiteId }: { suiteId: string }) {
  return (
    <form>
      <input type="hidden" name="suiteId" value={suiteId} />
      <Button type="submit">Réserver</Button>
    </form>
  );
}
