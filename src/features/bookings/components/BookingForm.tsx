"use client";

import { Button } from "@/components/ui/button";

export function BookingForm({ suiteId }: { suiteId: string }) {
  return (
    <form>
      <input type="hidden" name="suiteId" value={suiteId} />
      <Button type="submit">Réserver</Button>
    </form>
  );
}
