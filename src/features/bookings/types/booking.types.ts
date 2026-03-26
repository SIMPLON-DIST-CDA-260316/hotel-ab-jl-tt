import type { ActionErrors } from "@/types/action.types";

export type SelectedOption = {
  optionId: string;
  quantity: number;
};

export type BookingActionResult =
  | { success: true; bookingId: string; bookingReference: string }
  | { success: false; errors: ActionErrors }
  | { success: false; existingPending: true; suiteName: string; reference: string };
