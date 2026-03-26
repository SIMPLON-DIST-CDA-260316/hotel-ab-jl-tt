import { NextRequest, NextResponse } from "next/server";
import { checkSuiteAvailability } from "@/features/bookings/queries/check-suite-availability";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const suiteId = searchParams.get("suiteId");
  const checkIn = searchParams.get("checkIn");
  const checkOut = searchParams.get("checkOut");

  if (!suiteId || !checkIn || !checkOut) {
    return NextResponse.json(
      { error: "Paramètres manquants" },
      { status: 400 },
    );
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);

  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    return NextResponse.json({ error: "Dates invalides" }, { status: 400 });
  }

  if (checkOutDate <= checkInDate) {
    return NextResponse.json(
      { error: "La date de départ doit être postérieure à la date d'arrivée" },
      { status: 400 },
    );
  }

  const today = new Date(new Date().toDateString());
  if (checkInDate < today) {
    return NextResponse.json(
      { error: "La date d'arrivée ne peut pas être dans le passé" },
      { status: 400 },
    );
  }

  const availabilityResult = await checkSuiteAvailability(
    suiteId,
    checkInDate,
    checkOutDate,
  );

  if (!availabilityResult) {
    return NextResponse.json({ error: "Suite introuvable" }, { status: 404 });
  }

  return NextResponse.json(availabilityResult);
}
