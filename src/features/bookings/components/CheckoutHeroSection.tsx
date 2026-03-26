import Image from "next/image";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { currencyFormatter } from "@/lib/formatters";

type CheckoutHeroSectionProps = {
  suiteTitle: string;
  suiteImage: string | null;
  establishmentName: string;
  pricePerNight: number;
};

export function CheckoutHeroSection({
  suiteTitle,
  suiteImage,
  establishmentName,
  pricePerNight,
}: CheckoutHeroSectionProps) {
  const hasImage = suiteImage && !suiteImage.includes("placeholder");

  return (
    <>
      <div className="relative">
        <AspectRatio ratio={16 / 5}>
          {hasImage ? (
            <Image
              src={suiteImage}
              alt={suiteTitle}
              fill
              className="object-cover"
              sizes="(min-width: 672px) 672px, 100vw"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
              <span className="text-4xl font-bold text-primary/20">
                {suiteTitle.charAt(0)}
              </span>
            </div>
          )}
        </AspectRatio>
      </div>
      <div className="p-6 pb-0">
        <h1 className="text-xl font-bold sm:text-2xl">{suiteTitle}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {establishmentName} · {currencyFormatter.format(pricePerNight)} / nuit
        </p>
      </div>
    </>
  );
}
