import type { ActionErrors } from "@/types/action.types";

export type BookingActionResult =
  | { success: true; bookingId: string; bookingReference: string }
  | { success: false; errors: ActionErrors };

export type AvailabilityResult = {
  available: boolean;
  nightCount: number;
  pricePerNight: number;
  totalPrice: number;
};
