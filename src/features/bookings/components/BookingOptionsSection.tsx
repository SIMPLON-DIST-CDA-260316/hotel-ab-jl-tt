import { ConciergeBell } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { currencyFormatter } from "@/lib/formatters";
import { DetailRow } from "./DetailRow";
import { SectionHeader } from "./SectionHeader";
import type { BookingDetail } from "../queries/get-booking-detail";

type BookingOptionsSectionProps = {
  options: BookingDetail["options"];
};

export function BookingOptionsSection({
  options,
}: BookingOptionsSectionProps) {
  if (options.length === 0) return null;

  return (
    <>
      <Separator />
      <section className="space-y-3">
        <SectionHeader
          icon={
            <ConciergeBell
              className="size-3.5 text-primary"
              aria-hidden
            />
          }
        >
          Options
        </SectionHeader>
        <div className="space-y-2">
          {options.map((bookingOptionItem) => {
            const isIncluded = Number(bookingOptionItem.unitPrice) === 0;
            const lineTotal =
              bookingOptionItem.quantity * Number(bookingOptionItem.unitPrice);

            return (
              <DetailRow
                key={bookingOptionItem.name}
                label={`${bookingOptionItem.icon ? `${bookingOptionItem.icon} ` : ""}${bookingOptionItem.name}${bookingOptionItem.quantity > 1 ? ` ×${bookingOptionItem.quantity}` : ""}`}
              >
                {isIncluded ? (
                  <span className="text-green-700 dark:text-green-300">
                    Inclus
                  </span>
                ) : (
                  currencyFormatter.format(lineTotal)
                )}
              </DetailRow>
            );
          })}
        </div>
      </section>
    </>
  );
}
