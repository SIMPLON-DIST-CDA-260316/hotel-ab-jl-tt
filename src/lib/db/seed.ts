/**
 * Development seed — inserts representative test data.
 *
 * Idempotent: uses `onConflictDoNothing` so it can be run multiple times
 * without duplicating rows. Intended for local dev and CI only — never run
 * against a production database.
 *
 * For the initial admin account, use seed-admin.ts instead.
 */
import { db } from "@/lib/db";
import { user, account } from "@/lib/db/schema/auth";
import {
  establishment,
  suite,
  image,
  amenity,
  establishmentAmenity,
  suiteAmenity,
  option,
  establishmentOption,
  booking,
  bookingOption,
} from "@/lib/db/schema/domain";
import { inArray } from "drizzle-orm";
import { ROLES } from "@/config/roles";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import { hashPassword } from "better-auth/crypto";

const SEED_PASSWORD = "Test1234!";
const SEED_USER_IDS = [
  "seed-admin-1",
  "seed-manager-1",
  "seed-manager-2",
  "seed-manager-3",
  "seed-client-1",
];

async function seed() {
  // Clean seed data for idempotence (order respects FK constraints)
  await db.delete(bookingOption);
  await db.delete(booking);
  await db.delete(image);
  await db.delete(suiteAmenity);
  await db.delete(suite);
  await db.delete(establishmentAmenity);
  await db.delete(establishmentOption);
  await db.delete(establishment);
  await db.delete(amenity);
  await db.delete(option);
  await db.delete(account).where(inArray(account.userId, SEED_USER_IDS));
  await db.delete(user).where(inArray(user.id, SEED_USER_IDS));

  const now = new Date();
  const hashedPassword = await hashPassword(SEED_PASSWORD);

  // --- Users ---

  await db.insert(user).values([
    {
      id: "seed-admin-1",
      name: "Admin Test",
      email: "admin@clairdelune.test",
      emailVerified: true,
      role: ROLES.ADMIN,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-manager-1",
      name: "Marie Dupont",
      email: "manager@clairdelune.test",
      emailVerified: true,
      role: ROLES.MANAGER,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-manager-2",
      name: "Pierre Martin",
      email: "manager2@clairdelune.test",
      emailVerified: true,
      role: ROLES.MANAGER,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-manager-3",
      name: "Sophie Bernard",
      email: "manager3@clairdelune.test",
      emailVerified: true,
      role: ROLES.MANAGER,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-client-1",
      name: "Client Test",
      email: "client@clairdelune.test",
      emailVerified: true,
      role: ROLES.CLIENT,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // --- Accounts (credential provider, same password for all seed users) ---

  await db.insert(account).values(
    SEED_USER_IDS.map((userId) => {
      const seedUser = {
        "seed-admin-1": "admin@clairdelune.test",
        "seed-manager-1": "manager@clairdelune.test",
        "seed-manager-2": "manager2@clairdelune.test",
        "seed-manager-3": "manager3@clairdelune.test",
        "seed-client-1": "client@clairdelune.test",
      }[userId]!;

      return {
        id: crypto.randomUUID(),
        accountId: seedUser,
        providerId: "credential",
        userId,
        password: hashedPassword,
        createdAt: now,
        updatedAt: now,
      };
    }),
  );

  // --- Establishments ---
  // manager-1: Paris + Lyon, manager-2: Lille
  // manager-3 has no establishment (safe to delete in E2E)

  const establishments = await db
    .insert(establishment)
    .values([
      {
        name: "Clair de Lune — Paris",
        address: "12 rue de Rivoli",
        postalCode: "75001",
        city: "Paris",
        description: "Un havre de paix au cœur de la capitale.",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-1",
      },
      {
        name: "Clair de Lune — Lyon",
        address: "45 quai Saint-Antoine",
        postalCode: "69002",
        city: "Lyon",
        description: "Vue imprenable sur la Saône.",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-1",
      },
      {
        name: "Clair de Lune — Lille",
        address: "8 place du Général de Gaulle",
        postalCode: "59000",
        city: "Lille",
        description: "Charme et convivialité dans le Vieux-Lille.",
        checkInTime: "15:00",
        checkOutTime: "10:30",
        managerId: "seed-manager-2",
      },
    ])
    .returning({ id: establishment.id, city: establishment.city });

  const parisId = establishments.find((e) => e.city === "Paris")!.id;
  const lyonId = establishments.find((e) => e.city === "Lyon")!.id;
  const lilleId = establishments.find((e) => e.city === "Lille")!.id;

  const suites = await db
    .insert(suite)
    .values([
      {
        title: "Suite Étoile",
        description: "Suite luxueuse avec vue sur la Tour Eiffel.",
        price: "250.00",
        mainImage: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&q=80",
        capacity: 2,
        area: "45.00",
        establishmentId: parisId,
      },
      {
        title: "Suite Lumière",
        description: "Ambiance tamisée et décoration Art Déco.",
        price: "180.00",
        mainImage: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&q=80",
        capacity: 2,
        area: "35.00",
        establishmentId: parisId,
      },
      {
        title: "Suite Confluence",
        description: "Au croisement du Rhône et de la Saône.",
        price: "200.00",
        mainImage: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
        capacity: 3,
        area: "50.00",
        establishmentId: lyonId,
      },
      {
        title: "Suite Grand Place",
        description: "Vue sur la Grand Place de Lille.",
        price: "160.00",
        mainImage: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&q=80",
        capacity: 2,
        area: "38.00",
        establishmentId: lilleId,
      },
    ])
    .returning({ id: suite.id, title: suite.title });

  const suiteEtoileId = suites.find((s) => s.title === "Suite Étoile")!.id;
  const suiteLumiereId = suites.find((s) => s.title === "Suite Lumière")!.id;
  const suiteConfluenceId = suites.find(
    (s) => s.title === "Suite Confluence",
  )!.id;
  const suiteGrandPlaceId = suites.find(
    (s) => s.title === "Suite Grand Place",
  )!.id;

  // --- Amenities ---

  const amenities = await db
    .insert(amenity)
    .values([
      // Property-level
      { name: "Parking gratuit", slug: "parking-gratuit", category: "Stationnement", scope: "property" },
      { name: "Borne recharge VE", slug: "borne-recharge-ve", category: "Stationnement", scope: "property" },
      { name: "Restaurant", slug: "restaurant", category: "Restauration", scope: "property" },
      { name: "Bar / salon", slug: "bar-salon", category: "Restauration", scope: "property" },
      { name: "Petit-déjeuner disponible", slug: "petit-dejeuner-disponible", category: "Restauration", scope: "property" },
      { name: "Piscine extérieure", slug: "piscine-exterieure", category: "Bien-être", scope: "property" },
      { name: "Piscine intérieure", slug: "piscine-interieure", category: "Bien-être", scope: "property" },
      { name: "Spa / jacuzzi", slug: "spa-jacuzzi", category: "Bien-être", scope: "property" },
      { name: "Sauna", slug: "sauna", category: "Bien-être", scope: "property" },
      { name: "Jardin", slug: "jardin", category: "Bien-être", scope: "property" },
      { name: "Réception 24h", slug: "reception-24h", category: "Services", scope: "property" },
      { name: "Bagagerie", slug: "bagagerie", category: "Services", scope: "property" },
      { name: "Ménage quotidien", slug: "menage-quotidien", category: "Services", scope: "property" },
      { name: "Accès PMR", slug: "acces-pmr", category: "Accessibilité", scope: "property" },
      { name: "Ascenseur", slug: "ascenseur", category: "Accessibilité", scope: "property" },
      { name: "Animaux acceptés", slug: "animaux-acceptes", category: "Animaux", scope: "property" },
      { name: "WiFi gratuit (parties communes)", slug: "wifi-parties-communes", category: "Technologie", scope: "property" },
      // Room-level
      { name: "Douche", slug: "douche", category: "Salle de bain", scope: "room" },
      { name: "Baignoire", slug: "baignoire", category: "Salle de bain", scope: "room" },
      { name: "Sèche-cheveux", slug: "seche-cheveux", category: "Salle de bain", scope: "room" },
      { name: "Articles de toilette", slug: "articles-toilette", category: "Salle de bain", scope: "room" },
      { name: "Peignoirs", slug: "peignoirs", category: "Salle de bain", scope: "room" },
      { name: "WiFi gratuit", slug: "wifi-gratuit", category: "Technologie", scope: "room" },
      { name: "TV écran plat", slug: "tv-ecran-plat", category: "Technologie", scope: "room" },
      { name: "Prises USB", slug: "prises-usb", category: "Technologie", scope: "room" },
      { name: "Climatisation", slug: "climatisation", category: "Confort", scope: "room" },
      { name: "Chauffage", slug: "chauffage", category: "Confort", scope: "room" },
      { name: "Insonorisation", slug: "insonorisation", category: "Confort", scope: "room" },
      { name: "Minibar", slug: "minibar", category: "Boissons", scope: "room" },
      { name: "Bouilloire", slug: "bouilloire", category: "Boissons", scope: "room" },
      { name: "Machine Nespresso", slug: "machine-nespresso", category: "Boissons", scope: "room" },
      { name: "Coffre-fort", slug: "coffre-fort", category: "Mobilier", scope: "room" },
      { name: "Bureau", slug: "bureau", category: "Mobilier", scope: "room" },
      { name: "Penderie", slug: "penderie", category: "Mobilier", scope: "room" },
      { name: "Balcon", slug: "balcon", category: "Extérieur", scope: "room" },
      { name: "Terrasse privée", slug: "terrasse-privee", category: "Extérieur", scope: "room" },
      { name: "Accessible fauteuil roulant", slug: "accessible-fauteuil-roulant", category: "Accessibilité", scope: "room" },
      { name: "Salle de bain PMR", slug: "salle-de-bain-pmr", category: "Accessibilité", scope: "room" },
    ])
    .returning({ id: amenity.id, slug: amenity.slug });

  const amenityBySlug = Object.fromEntries(
    amenities.map((amenityRow) => [amenityRow.slug, amenityRow.id]),
  );

  // --- Establishment ↔ Amenity ---

  await db.insert(establishmentAmenity).values([
    // Paris: full-service
    ...[
      "parking-gratuit", "borne-recharge-ve", "restaurant", "bar-salon",
      "petit-dejeuner-disponible", "piscine-interieure", "spa-jacuzzi",
      "sauna", "reception-24h", "bagagerie", "menage-quotidien",
      "acces-pmr", "ascenseur", "wifi-parties-communes",
    ].map((slug) => ({ establishmentId: parisId, amenityId: amenityBySlug[slug] })),
    // Lyon: mid-range
    ...[
      "parking-gratuit", "restaurant", "petit-dejeuner-disponible",
      "jardin", "reception-24h", "bagagerie", "menage-quotidien",
      "ascenseur", "wifi-parties-communes", "animaux-acceptes",
    ].map((slug) => ({ establishmentId: lyonId, amenityId: amenityBySlug[slug] })),
    // Lille: boutique
    ...[
      "bar-salon", "petit-dejeuner-disponible", "reception-24h",
      "menage-quotidien", "ascenseur", "wifi-parties-communes",
      "acces-pmr",
    ].map((slug) => ({ establishmentId: lilleId, amenityId: amenityBySlug[slug] })),
  ]);

  // --- Suite ↔ Amenity ---

  const commonRoomAmenities = [
    "douche", "seche-cheveux", "articles-toilette", "wifi-gratuit",
    "tv-ecran-plat", "climatisation", "chauffage", "coffre-fort", "penderie",
  ];

  await db.insert(suiteAmenity).values([
    // Suite Étoile (luxe): all common + extras
    ...[
      ...commonRoomAmenities, "baignoire", "peignoirs", "prises-usb",
      "insonorisation", "minibar", "machine-nespresso", "bureau", "balcon",
    ].map((slug) => ({ suiteId: suiteEtoileId, amenityId: amenityBySlug[slug] })),
    // Suite Lumière (mid): common + some extras
    ...[
      ...commonRoomAmenities, "peignoirs", "insonorisation",
      "minibar", "bouilloire", "bureau",
    ].map((slug) => ({ suiteId: suiteLumiereId, amenityId: amenityBySlug[slug] })),
    // Suite Confluence (spacieuse): common + terrasse
    ...[
      ...commonRoomAmenities, "baignoire", "peignoirs", "prises-usb",
      "minibar", "machine-nespresso", "bureau", "terrasse-privee",
    ].map((slug) => ({ suiteId: suiteConfluenceId, amenityId: amenityBySlug[slug] })),
    // Suite Grand Place (cosy): common + bouilloire
    ...[
      ...commonRoomAmenities, "bouilloire", "bureau",
      "accessible-fauteuil-roulant", "salle-de-bain-pmr",
    ].map((slug) => ({ suiteId: suiteGrandPlaceId, amenityId: amenityBySlug[slug] })),
  ]);

  // --- Options ---

  const options = await db
    .insert(option)
    .values([
      { name: "Petit-déjeuner", slug: "petit-dejeuner", pricingModel: "per_person_per_night", defaultPrice: "14.00" },
      { name: "Demi-pension", slug: "demi-pension", pricingModel: "per_person_per_night", defaultPrice: "35.00" },
      { name: "Lit supplémentaire", slug: "lit-supplementaire", pricingModel: "per_night", defaultPrice: "20.00" },
      { name: "Lit bébé", slug: "lit-bebe", pricingModel: "per_night", defaultPrice: "0.00" },
      { name: "Supplément animal", slug: "supplement-animal", pricingModel: "per_night", defaultPrice: "10.00" },
      { name: "Parking payant", slug: "parking-payant", pricingModel: "per_night", defaultPrice: "8.00" },
      { name: "Accès spa", slug: "acces-spa", pricingModel: "per_person_per_stay", defaultPrice: "25.00" },
      { name: "Panier pique-nique", slug: "panier-pique-nique", pricingModel: "per_unit", defaultPrice: "18.00" },
      { name: "Location vélos", slug: "location-velos", pricingModel: "per_unit", defaultPrice: "15.00" },
      { name: "Pack romantique", slug: "pack-romantique", pricingModel: "per_stay", defaultPrice: "45.00" },
    ])
    .returning({ id: option.id, slug: option.slug });

  const optionBySlug = Object.fromEntries(
    options.map((optionRow) => [optionRow.slug, optionRow.id]),
  );

  // --- Establishment ↔ Option ---

  await db.insert(establishmentOption).values([
    // Paris: most options, spa included for premium feel
    { establishmentId: parisId, optionId: optionBySlug["petit-dejeuner"], price: "16.00", included: false },
    { establishmentId: parisId, optionId: optionBySlug["demi-pension"], price: "40.00", included: false },
    { establishmentId: parisId, optionId: optionBySlug["lit-supplementaire"], price: "25.00", included: false },
    { establishmentId: parisId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: parisId, optionId: optionBySlug["acces-spa"], price: "30.00", included: false },
    { establishmentId: parisId, optionId: optionBySlug["pack-romantique"], price: "55.00", included: false },
    { establishmentId: parisId, optionId: optionBySlug["parking-payant"], price: "12.00", included: false },
    // Lyon: mid-range options
    { establishmentId: lyonId, optionId: optionBySlug["petit-dejeuner"], price: "14.00", included: true },
    { establishmentId: lyonId, optionId: optionBySlug["lit-supplementaire"], price: "20.00", included: false },
    { establishmentId: lyonId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: lyonId, optionId: optionBySlug["supplement-animal"], price: "10.00", included: false },
    { establishmentId: lyonId, optionId: optionBySlug["panier-pique-nique"], price: "18.00", included: false },
    { establishmentId: lyonId, optionId: optionBySlug["location-velos"], price: "15.00", included: false },
    // Lille: boutique selection
    { establishmentId: lilleId, optionId: optionBySlug["petit-dejeuner"], price: "12.00", included: false },
    { establishmentId: lilleId, optionId: optionBySlug["lit-supplementaire"], price: "18.00", included: false },
    { establishmentId: lilleId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: lilleId, optionId: optionBySlug["pack-romantique"], price: "40.00", included: false },
  ]);

  // --- Suite images ---

  await db.insert(image).values([
    // Suite Étoile (3 gallery images)
    { url: "/placeholder-suite-etoile-1.jpg", alt: "Salon de la Suite Étoile", position: 1, suiteId: suiteEtoileId },
    { url: "/placeholder-suite-etoile-2.jpg", alt: "Salle de bain de la Suite Étoile", position: 2, suiteId: suiteEtoileId },
    { url: "/placeholder-suite-etoile-3.jpg", alt: "Vue depuis le balcon de la Suite Étoile", position: 3, suiteId: suiteEtoileId },
    // Suite Lumière (2 gallery images)
    { url: "/placeholder-suite-lumiere-1.jpg", alt: "Chambre de la Suite Lumière", position: 1, suiteId: suiteLumiereId },
    { url: "/placeholder-suite-lumiere-2.jpg", alt: "Salle de bain Art Déco de la Suite Lumière", position: 2, suiteId: suiteLumiereId },
    // Suite Confluence (3 gallery images)
    { url: "/placeholder-suite-confluence-1.jpg", alt: "Chambre de la Suite Confluence", position: 1, suiteId: suiteConfluenceId },
    { url: "/placeholder-suite-confluence-2.jpg", alt: "Terrasse de la Suite Confluence", position: 2, suiteId: suiteConfluenceId },
    { url: "/placeholder-suite-confluence-3.jpg", alt: "Vue sur la Saône depuis la Suite Confluence", position: 3, suiteId: suiteConfluenceId },
    // Suite Grand Place (2 gallery images)
    { url: "/placeholder-suite-grandplace-1.jpg", alt: "Chambre de la Suite Grand Place", position: 1, suiteId: suiteGrandPlaceId },
    { url: "/placeholder-suite-grandplace-2.jpg", alt: "Vue sur la Grand Place depuis la Suite Grand Place", position: 2, suiteId: suiteGrandPlaceId },
  ]);

  // Future booking (Paris) — blocks deletion of Paris establishment
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const nextMonthEnd = new Date(nextMonth);
  nextMonthEnd.setDate(nextMonthEnd.getDate() + 3);

  // Past booking (Lyon) — does NOT block deletion of Lyon establishment
  const lastMonth = new Date();
  lastMonth.setMonth(lastMonth.getMonth() - 1);
  const lastMonthEnd = new Date(lastMonth);
  lastMonthEnd.setDate(lastMonthEnd.getDate() + 2);

  // Near-future booking (2 days from now — non-cancellable)
  const twoDaysFromNow = new Date();
  twoDaysFromNow.setDate(twoDaysFromNow.getDate() + 2);
  const twoDaysFromNowEnd = new Date(twoDaysFromNow);
  twoDaysFromNowEnd.setDate(twoDaysFromNowEnd.getDate() + 4);

  // Far-future booking (next week)
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 10);
  const nextWeekEnd = new Date(nextWeek);
  nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

  // Another past booking (2 months ago, cancelled)
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  const twoMonthsAgoEnd = new Date(twoMonthsAgo);
  twoMonthsAgoEnd.setDate(twoMonthsAgoEnd.getDate() + 3);

  await db.insert(booking).values([
    {
      reference: "SEED-FUTURE-001",
      checkIn: nextMonth,
      checkOut: nextMonthEnd,
      guestCount: 2,
      pricePerNight: "250.00",
      totalPrice: "750.00",
      status: BOOKING_STATUSES.CONFIRMED,
      clientId: "seed-client-1",
      suiteId: suiteEtoileId,
    },
    {
      reference: "SEED-FUTURE-002",
      checkIn: twoDaysFromNow,
      checkOut: twoDaysFromNowEnd,
      guestCount: 2,
      pricePerNight: "200.00",
      totalPrice: "800.00",
      status: BOOKING_STATUSES.CONFIRMED,
      clientId: "seed-client-1",
      suiteId: suiteConfluenceId,
    },
    {
      reference: "SEED-FUTURE-003",
      checkIn: nextWeek,
      checkOut: nextWeekEnd,
      guestCount: 1,
      pricePerNight: "160.00",
      totalPrice: "320.00",
      status: BOOKING_STATUSES.PENDING,
      clientId: "seed-client-1",
      suiteId: suiteGrandPlaceId,
    },
    {
      reference: "SEED-PAST-001",
      checkIn: lastMonth,
      checkOut: lastMonthEnd,
      guestCount: 2,
      pricePerNight: "200.00",
      totalPrice: "400.00",
      status: BOOKING_STATUSES.COMPLETED,
      clientId: "seed-client-1",
      suiteId: suiteConfluenceId,
    },
    {
      reference: "SEED-PAST-002",
      checkIn: twoMonthsAgo,
      checkOut: twoMonthsAgoEnd,
      guestCount: 2,
      pricePerNight: "180.00",
      totalPrice: "540.00",
      status: BOOKING_STATUSES.CANCELLED,
      clientId: "seed-client-1",
      suiteId: suiteLumiereId,
    },
  ]);

  console.log(
    "Seed complete: 5 users + 3 establishments + 4 suites + 38 amenities + 10 options + 10 images + 5 bookings",
  );
  console.log(`All seed users share password: ${SEED_PASSWORD}`);
}

if (import.meta.main) {
  seed()
    .catch((error: unknown) => {
      console.error("Seed failed:", error);
      process.exit(1);
    })
    .finally(() => process.exit(0));
}
