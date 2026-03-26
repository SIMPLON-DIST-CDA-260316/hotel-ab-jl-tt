import { Separator } from "@/components/ui/separator";
import { currencyFormatter } from "@/lib/formatters";
import { DetailRow } from "./DetailRow";
import { SectionHeader } from "./SectionHeader";
import type { BookingDetail } from "../queries/get-booking-detail";

type BookingPricingSectionProps = {
  nightCount: number;
  pricePerNight: string;
  options: BookingDetail["options"];
  totalPrice: string;
};

export function BookingPricingSection({
  nightCount,
  pricePerNight,
  options,
  totalPrice,
}: BookingPricingSectionProps) {
  const pricePerNightNum = Number(pricePerNight);
  const paidOptions = options.filter(
    (bookingOptionItem) => Number(bookingOptionItem.unitPrice) > 0,
  );

  return (
    <section className="space-y-3">
      <SectionHeader>Tarification</SectionHeader>
      <div className="space-y-2">
        <DetailRow
          label={`${nightCount} nuit${nightCount > 1 ? "s" : ""} × ${currencyFormatter.format(pricePerNightNum)}`}
        >
          {currencyFormatter.format(nightCount * pricePerNightNum)}
        </DetailRow>
        {paidOptions.map((bookingOptionItem) => (
          <DetailRow
            key={bookingOptionItem.name}
            label={`${bookingOptionItem.name}${bookingOptionItem.quantity > 1 ? ` ×${bookingOptionItem.quantity}` : ""}`}
          >
            {currencyFormatter.format(
              bookingOptionItem.quantity * Number(bookingOptionItem.unitPrice),
            )}
          </DetailRow>
        ))}
        <Separator />
        <div className="flex items-baseline justify-between gap-4">
          <span className="text-base font-semibold">Total</span>
          <span className="text-base font-semibold">
            {currencyFormatter.format(Number(totalPrice))}
          </span>
        </div>
      </div>
    </section>
  );
}
