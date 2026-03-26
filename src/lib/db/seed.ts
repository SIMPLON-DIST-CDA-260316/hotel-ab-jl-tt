/**
 * Development seed — inserts representative test data.
 *
 * Idempotent: deletes seed data then re-inserts, so it can be run multiple
 * times without duplicating rows. Intended for local dev and CI only — never
 * run against a production database.
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
  review,
  inquiry,
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
  "seed-client-2",
  "seed-client-3",
  "seed-client-4",
  "seed-client-5",
];

async function seed() {
  // Clean seed data for idempotence (order respects FK constraints)
  await db.delete(review);
  await db.delete(inquiry);
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

  // ─── Users ───

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
      name: "Jean Lefèvre",
      email: "jean@example.test",
      emailVerified: true,
      role: ROLES.CLIENT,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-client-2",
      name: "Claire Moreau",
      email: "claire@example.test",
      emailVerified: true,
      role: ROLES.CLIENT,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-client-3",
      name: "Luc Girard",
      email: "luc@example.test",
      emailVerified: true,
      role: ROLES.CLIENT,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-client-4",
      name: "Émilie Roux",
      email: "emilie@example.test",
      emailVerified: true,
      role: ROLES.CLIENT,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "seed-client-5",
      name: "Antoine Duval",
      email: "antoine@example.test",
      emailVerified: true,
      role: ROLES.CLIENT,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ─── Accounts (credential provider, same password for all seed users) ───

  const emailByUserId: Record<string, string> = {
    "seed-admin-1": "admin@clairdelune.test",
    "seed-manager-1": "manager@clairdelune.test",
    "seed-manager-2": "manager2@clairdelune.test",
    "seed-manager-3": "manager3@clairdelune.test",
    "seed-client-1": "jean@example.test",
    "seed-client-2": "claire@example.test",
    "seed-client-3": "luc@example.test",
    "seed-client-4": "emilie@example.test",
    "seed-client-5": "antoine@example.test",
  };

  await db.insert(account).values(
    SEED_USER_IDS.map((userId) => ({
      id: crypto.randomUUID(),
      accountId: emailByUserId[userId],
      providerId: "credential",
      userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    })),
  );

  // ─── Establishments ───
  // manager-1: Tours + Bourges, manager-2: Clermont-Ferrand + Orléans, manager-3: Limoges + Vichy

  const establishments = await db
    .insert(establishment)
    .values([
      {
        name: "Clair de Lune — Tours",
        address: "7 rue Nationale",
        postalCode: "37000",
        city: "Tours",
        description:
          "Ancien château reconverti en hôtel de luxe, alliant élégance classique et confort moderne au cœur de la Touraine.",
        image: "/images/establishments/tours.jpg",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-1",
      },
      {
        name: "Clair de Lune — Bourges",
        address: "14 place Gordaine",
        postalCode: "18000",
        city: "Bourges",
        description:
          "Maison de maître du XVIIIe siècle au charme préservé, nichée dans le centre historique de Bourges.",
        image: "/images/establishments/bourges.jpg",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-1",
      },
      {
        name: "Clair de Lune — Clermont-Ferrand",
        address: "22 boulevard Desaix",
        postalCode: "63000",
        city: "Clermont-Ferrand",
        description:
          "Hôtel design contemporain avec vue imprenable sur la chaîne des Puys, entre pierre de Volvic et lignes épurées.",
        image: "/images/establishments/clermont-ferrand.jpg",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-2",
      },
      {
        name: "Clair de Lune — Orléans",
        address: "3 quai du Châtelet",
        postalCode: "45000",
        city: "Orléans",
        description:
          "En bord de Loire, un havre de nature et de sérénité où le fleuve royal rythme le séjour.",
        image: "/images/establishments/orleans.jpg",
        checkInTime: "14:00",
        checkOutTime: "10:30",
        managerId: "seed-manager-2",
      },
      {
        name: "Clair de Lune — Limoges",
        address: "9 boulevard de la Cité",
        postalCode: "87000",
        city: "Limoges",
        description:
          "Boutique-hôtel inspiré par l'art de la porcelaine, chaque suite est une pièce unique.",
        image: "/images/establishments/limoges.jpg",
        checkInTime: "15:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-3",
      },
      {
        name: "Clair de Lune — Vichy",
        address: "18 rue du Parc",
        postalCode: "03200",
        city: "Vichy",
        description:
          "Hôtel spa & bien-être dans la tradition thermale de Vichy, dédié à la détente et au ressourcement.",
        image: "/images/establishments/vichy.jpg",
        checkInTime: "14:00",
        checkOutTime: "11:00",
        managerId: "seed-manager-3",
      },
    ])
    .returning({ id: establishment.id, city: establishment.city });

  const establishmentByCity = Object.fromEntries(
    establishments.map((establishmentRow) => [establishmentRow.city, establishmentRow.id]),
  );
  const toursId = establishmentByCity["Tours"];
  const bourgesId = establishmentByCity["Bourges"];
  const clermontId = establishmentByCity["Clermont-Ferrand"];
  const orleansId = establishmentByCity["Orléans"];
  const limogesId = establishmentByCity["Limoges"];
  const vichyId = establishmentByCity["Vichy"];

  // ─── Suites ───

  const suites = await db
    .insert(suite)
    .values([
      // Tours (4 suites — château luxe)
      {
        title: "Suite Royale",
        description:
          "La suite d'exception du château : lit à baldaquin, cheminée en pierre, vue sur les jardins à la française.",
        price: "380.00",
        mainImage: "/images/suites/tours-royale.jpg",
        capacity: 2,
        area: "65.00",
        establishmentId: toursId,
      },
      {
        title: "Suite des Jardins",
        description:
          "Accès direct aux jardins du château, terrasse privée et décor floral raffiné.",
        price: "280.00",
        mainImage: "/images/suites/tours-jardins.jpg",
        capacity: 2,
        area: "48.00",
        establishmentId: toursId,
      },
      {
        title: "Suite Amboise",
        description:
          "Inspirée du château d'Amboise, mêlant mobilier Renaissance et confort contemporain.",
        price: "320.00",
        mainImage: "/images/suites/tours-amboise.jpg",
        capacity: 3,
        area: "55.00",
        establishmentId: toursId,
      },
      {
        title: "Suite Chenonceau",
        description:
          "Élégance et lumière, avec des arches gracieuses rappelant le château des Dames.",
        price: "300.00",
        mainImage: "/images/suites/tours-chenonceau.jpg",
        capacity: 2,
        area: "50.00",
        establishmentId: toursId,
      },
      // Bourges (2 suites — charme historique)
      {
        title: "Suite Jacques-Cœur",
        description:
          "Suite de prestige rendant hommage au grand argentier, poutres apparentes et tapisseries murales.",
        price: "220.00",
        mainImage: "/images/suites/bourges-jacques-coeur.jpg",
        capacity: 2,
        area: "42.00",
        establishmentId: bourgesId,
      },
      {
        title: "Suite des Marais",
        description:
          "Ambiance champêtre avec vue sur les marais de Bourges, tons naturels et boiseries.",
        price: "180.00",
        mainImage: "/images/suites/bourges-marais.jpg",
        capacity: 2,
        area: "35.00",
        establishmentId: bourgesId,
      },
      // Clermont-Ferrand (3 suites — design contemporain)
      {
        title: "Suite Puy-de-Dôme",
        description:
          "Vue panoramique sur le Puy-de-Dôme, baie vitrée plein ouest pour des couchers de soleil inoubliables.",
        price: "260.00",
        mainImage: "/images/suites/clermont-puy-de-dome.jpg",
        capacity: 2,
        area: "50.00",
        establishmentId: clermontId,
      },
      {
        title: "Suite Volcanique",
        description:
          "Design brut en pierre de Volvic et acier, esprit loft industriel revisité.",
        price: "220.00",
        mainImage: "/images/suites/clermont-volcanique.jpg",
        capacity: 2,
        area: "42.00",
        establishmentId: clermontId,
      },
      {
        title: "Suite Arverne",
        description:
          "Suite familiale spacieuse avec coin enfants, inspirée des paysages auvergnats.",
        price: "240.00",
        mainImage: "/images/suites/clermont-arverne.jpg",
        capacity: 4,
        area: "58.00",
        establishmentId: clermontId,
      },
      // Orléans (2 suites — nature Loire)
      {
        title: "Suite Loire",
        description:
          "Face au fleuve, grandes fenêtres et teintes bleutées pour un séjour au fil de l'eau.",
        price: "200.00",
        mainImage: "/images/suites/orleans-loire.jpg",
        capacity: 2,
        area: "40.00",
        establishmentId: orleansId,
      },
      {
        title: "Suite des Roseraies",
        description:
          "Atmosphère romantique avec jardin privatif de roses, idéale pour un séjour en amoureux.",
        price: "230.00",
        mainImage: "/images/suites/orleans-roseraies.jpg",
        capacity: 2,
        area: "38.00",
        establishmentId: orleansId,
      },
      // Limoges (2 suites — boutique art)
      {
        title: "Suite Porcelaine",
        description:
          "Décor unique inspiré de la porcelaine de Limoges : motifs bleu cobalt, élégance artisanale.",
        price: "190.00",
        mainImage: "/images/suites/limoges-porcelaine.jpg",
        capacity: 2,
        area: "36.00",
        establishmentId: limogesId,
      },
      {
        title: "Suite des Émaux",
        description:
          "Hommage aux émaux limousins, jeux de couleurs et lumière dans un cadre intimiste.",
        price: "170.00",
        mainImage: "/images/suites/limoges-emaux.jpg",
        capacity: 2,
        area: "32.00",
        establishmentId: limogesId,
      },
      // Vichy (3 suites — spa & bien-être)
      {
        title: "Suite Thermale",
        description:
          "Bain thermal privatif, chromo-thérapie et accès direct à l'espace bien-être.",
        price: "290.00",
        mainImage: "/images/suites/vichy-thermale.jpg",
        capacity: 2,
        area: "52.00",
        establishmentId: vichyId,
      },
      {
        title: "Suite des Sources",
        description:
          "Ambiance zen et minérale, douche sensorielle et vue sur le parc des Sources.",
        price: "240.00",
        mainImage: "/images/suites/vichy-sources.jpg",
        capacity: 2,
        area: "44.00",
        establishmentId: vichyId,
      },
      {
        title: "Suite Célestins",
        description:
          "Suite premium avec salon séparé, terrasse et vue sur l'Allier.",
        price: "320.00",
        mainImage: "/images/suites/vichy-celestins.jpg",
        capacity: 3,
        area: "60.00",
        establishmentId: vichyId,
      },
    ])
    .returning({ id: suite.id, title: suite.title });

  const suiteByTitle = Object.fromEntries(
    suites.map((suiteRow) => [suiteRow.title, suiteRow.id]),
  );

  // ─── Amenities ───

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

  // ─── Establishment ↔ Amenity ───

  await db.insert(establishmentAmenity).values([
    // Tours (château luxe) — full-service
    ...[
      "parking-gratuit", "borne-recharge-ve", "restaurant", "bar-salon",
      "petit-dejeuner-disponible", "piscine-exterieure", "spa-jacuzzi",
      "sauna", "jardin", "reception-24h", "bagagerie", "menage-quotidien",
      "acces-pmr", "ascenseur", "wifi-parties-communes",
    ].map((slug) => ({ establishmentId: toursId, amenityId: amenityBySlug[slug] })),
    // Bourges (charme) — mid-range
    ...[
      "parking-gratuit", "petit-dejeuner-disponible", "jardin",
      "bagagerie", "menage-quotidien", "wifi-parties-communes",
      "animaux-acceptes",
    ].map((slug) => ({ establishmentId: bourgesId, amenityId: amenityBySlug[slug] })),
    // Clermont-Ferrand (design) — modern amenities
    ...[
      "parking-gratuit", "borne-recharge-ve", "bar-salon",
      "petit-dejeuner-disponible", "reception-24h", "menage-quotidien",
      "ascenseur", "acces-pmr", "wifi-parties-communes",
    ].map((slug) => ({ establishmentId: clermontId, amenityId: amenityBySlug[slug] })),
    // Orléans (nature) — eco-friendly
    ...[
      "parking-gratuit", "petit-dejeuner-disponible", "jardin",
      "menage-quotidien", "wifi-parties-communes", "animaux-acceptes",
    ].map((slug) => ({ establishmentId: orleansId, amenityId: amenityBySlug[slug] })),
    // Limoges (boutique) — intimate
    ...[
      "bar-salon", "petit-dejeuner-disponible", "menage-quotidien",
      "wifi-parties-communes", "ascenseur",
    ].map((slug) => ({ establishmentId: limogesId, amenityId: amenityBySlug[slug] })),
    // Vichy (spa) — wellness-focused
    ...[
      "parking-gratuit", "restaurant", "bar-salon",
      "petit-dejeuner-disponible", "piscine-interieure", "spa-jacuzzi",
      "sauna", "jardin", "reception-24h", "bagagerie", "menage-quotidien",
      "acces-pmr", "ascenseur", "wifi-parties-communes",
    ].map((slug) => ({ establishmentId: vichyId, amenityId: amenityBySlug[slug] })),
  ]);

  // ─── Suite ↔ Amenity ───

  const commonRoomAmenities = [
    "douche", "seche-cheveux", "articles-toilette", "wifi-gratuit",
    "tv-ecran-plat", "climatisation", "chauffage", "coffre-fort", "penderie",
  ];

  const luxuryRoomAmenities = [
    ...commonRoomAmenities, "baignoire", "peignoirs", "prises-usb",
    "insonorisation", "minibar", "machine-nespresso", "bureau",
  ];

  const suiteAmenityAssignments: Record<string, string[]> = {
    // Tours — château luxe
    "Suite Royale": [...luxuryRoomAmenities, "terrasse-privee"],
    "Suite des Jardins": [...luxuryRoomAmenities, "terrasse-privee", "balcon"],
    "Suite Amboise": [...luxuryRoomAmenities, "balcon"],
    "Suite Chenonceau": [...luxuryRoomAmenities],
    // Bourges — charme
    "Suite Jacques-Cœur": [...commonRoomAmenities, "baignoire", "peignoirs", "minibar", "bouilloire", "bureau"],
    "Suite des Marais": [...commonRoomAmenities, "bouilloire", "bureau"],
    // Clermont-Ferrand — design
    "Suite Puy-de-Dôme": [...commonRoomAmenities, "baignoire", "peignoirs", "prises-usb", "insonorisation", "minibar", "machine-nespresso", "bureau", "balcon"],
    "Suite Volcanique": [...commonRoomAmenities, "prises-usb", "insonorisation", "minibar", "machine-nespresso", "bureau"],
    "Suite Arverne": [...commonRoomAmenities, "baignoire", "prises-usb", "bouilloire", "bureau", "accessible-fauteuil-roulant", "salle-de-bain-pmr"],
    // Orléans — nature
    "Suite Loire": [...commonRoomAmenities, "peignoirs", "bouilloire", "bureau", "balcon"],
    "Suite des Roseraies": [...commonRoomAmenities, "baignoire", "peignoirs", "minibar", "bouilloire", "terrasse-privee"],
    // Limoges — boutique
    "Suite Porcelaine": [...commonRoomAmenities, "baignoire", "peignoirs", "minibar", "bouilloire", "bureau"],
    "Suite des Émaux": [...commonRoomAmenities, "bouilloire", "bureau"],
    // Vichy — spa
    "Suite Thermale": [...luxuryRoomAmenities, "terrasse-privee"],
    "Suite des Sources": [...commonRoomAmenities, "baignoire", "peignoirs", "prises-usb", "minibar", "bouilloire", "bureau"],
    "Suite Célestins": [...luxuryRoomAmenities, "terrasse-privee", "balcon"],
  };

  await db.insert(suiteAmenity).values(
    Object.entries(suiteAmenityAssignments).flatMap(([suiteTitle, slugs]) =>
      slugs.map((slug) => ({
        suiteId: suiteByTitle[suiteTitle],
        amenityId: amenityBySlug[slug],
      })),
    ),
  );

  // ─── Options ───

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

  // ─── Establishment ↔ Option ───

  await db.insert(establishmentOption).values([
    // Tours (château luxe) — premium pricing
    { establishmentId: toursId, optionId: optionBySlug["petit-dejeuner"], price: "18.00", included: false },
    { establishmentId: toursId, optionId: optionBySlug["demi-pension"], price: "45.00", included: false },
    { establishmentId: toursId, optionId: optionBySlug["lit-supplementaire"], price: "30.00", included: false },
    { establishmentId: toursId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: toursId, optionId: optionBySlug["acces-spa"], price: "35.00", included: false },
    { establishmentId: toursId, optionId: optionBySlug["pack-romantique"], price: "65.00", included: false },
    { establishmentId: toursId, optionId: optionBySlug["parking-payant"], price: "0.00", included: true },
    // Bourges (charme) — cosy options
    { establishmentId: bourgesId, optionId: optionBySlug["petit-dejeuner"], price: "12.00", included: false },
    { establishmentId: bourgesId, optionId: optionBySlug["lit-supplementaire"], price: "18.00", included: false },
    { establishmentId: bourgesId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: bourgesId, optionId: optionBySlug["supplement-animal"], price: "8.00", included: false },
    { establishmentId: bourgesId, optionId: optionBySlug["panier-pique-nique"], price: "16.00", included: false },
    // Clermont-Ferrand (design) — modern options
    { establishmentId: clermontId, optionId: optionBySlug["petit-dejeuner"], price: "15.00", included: false },
    { establishmentId: clermontId, optionId: optionBySlug["demi-pension"], price: "38.00", included: false },
    { establishmentId: clermontId, optionId: optionBySlug["lit-supplementaire"], price: "22.00", included: false },
    { establishmentId: clermontId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: clermontId, optionId: optionBySlug["parking-payant"], price: "6.00", included: false },
    { establishmentId: clermontId, optionId: optionBySlug["location-velos"], price: "12.00", included: false },
    // Orléans (nature) — eco options
    { establishmentId: orleansId, optionId: optionBySlug["petit-dejeuner"], price: "14.00", included: true },
    { establishmentId: orleansId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: orleansId, optionId: optionBySlug["supplement-animal"], price: "8.00", included: false },
    { establishmentId: orleansId, optionId: optionBySlug["panier-pique-nique"], price: "18.00", included: false },
    { establishmentId: orleansId, optionId: optionBySlug["location-velos"], price: "10.00", included: false },
    { establishmentId: orleansId, optionId: optionBySlug["pack-romantique"], price: "42.00", included: false },
    // Limoges (boutique) — limited selection
    { establishmentId: limogesId, optionId: optionBySlug["petit-dejeuner"], price: "13.00", included: false },
    { establishmentId: limogesId, optionId: optionBySlug["lit-supplementaire"], price: "20.00", included: false },
    { establishmentId: limogesId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: limogesId, optionId: optionBySlug["pack-romantique"], price: "40.00", included: false },
    // Vichy (spa) — wellness-centric
    { establishmentId: vichyId, optionId: optionBySlug["petit-dejeuner"], price: "16.00", included: true },
    { establishmentId: vichyId, optionId: optionBySlug["demi-pension"], price: "42.00", included: false },
    { establishmentId: vichyId, optionId: optionBySlug["lit-supplementaire"], price: "25.00", included: false },
    { establishmentId: vichyId, optionId: optionBySlug["lit-bebe"], price: "0.00", included: true },
    { establishmentId: vichyId, optionId: optionBySlug["acces-spa"], price: "20.00", included: false },
    { establishmentId: vichyId, optionId: optionBySlug["pack-romantique"], price: "55.00", included: false },
    { establishmentId: vichyId, optionId: optionBySlug["parking-payant"], price: "8.00", included: false },
  ]);

  // ─── Suite Gallery Images (2 extra per suite = 32 gallery images) ───

  const suiteGalleryImages: { suiteTitle: string; images: { url: string; alt: string }[] }[] = [
    // Tours
    { suiteTitle: "Suite Royale", images: [
      { url: "/images/suites/tours-royale-2.jpg", alt: "Salon de la Suite Royale avec cheminée en pierre" },
      { url: "/images/suites/tours-royale-3.jpg", alt: "Salle de bain en marbre de la Suite Royale" },
    ]},
    { suiteTitle: "Suite des Jardins", images: [
      { url: "/images/suites/tours-jardins-2.jpg", alt: "Terrasse privée de la Suite des Jardins" },
      { url: "/images/suites/tours-jardins-3.jpg", alt: "Vue sur les jardins depuis la Suite des Jardins" },
    ]},
    { suiteTitle: "Suite Amboise", images: [
      { url: "/images/suites/tours-amboise-2.jpg", alt: "Salon Renaissance de la Suite Amboise" },
      { url: "/images/suites/tours-amboise-3.jpg", alt: "Salle de bain de la Suite Amboise" },
    ]},
    { suiteTitle: "Suite Chenonceau", images: [
      { url: "/images/suites/tours-chenonceau-2.jpg", alt: "Chambre lumineuse de la Suite Chenonceau" },
      { url: "/images/suites/tours-chenonceau-3.jpg", alt: "Détail décoratif de la Suite Chenonceau" },
    ]},
    // Bourges
    { suiteTitle: "Suite Jacques-Cœur", images: [
      { url: "/images/suites/bourges-jacques-coeur-2.jpg", alt: "Poutres apparentes de la Suite Jacques-Cœur" },
      { url: "/images/suites/bourges-jacques-coeur-3.jpg", alt: "Salle de bain de la Suite Jacques-Cœur" },
    ]},
    { suiteTitle: "Suite des Marais", images: [
      { url: "/images/suites/bourges-marais-2.jpg", alt: "Vue sur les marais depuis la Suite des Marais" },
      { url: "/images/suites/bourges-marais-3.jpg", alt: "Coin lecture de la Suite des Marais" },
    ]},
    // Clermont-Ferrand
    { suiteTitle: "Suite Puy-de-Dôme", images: [
      { url: "/images/suites/clermont-puy-de-dome-2.jpg", alt: "Baie vitrée panoramique de la Suite Puy-de-Dôme" },
      { url: "/images/suites/clermont-puy-de-dome-3.jpg", alt: "Salle de bain design de la Suite Puy-de-Dôme" },
    ]},
    { suiteTitle: "Suite Volcanique", images: [
      { url: "/images/suites/clermont-volcanique-2.jpg", alt: "Mur en pierre de Volvic de la Suite Volcanique" },
      { url: "/images/suites/clermont-volcanique-3.jpg", alt: "Salle de bain de la Suite Volcanique" },
    ]},
    { suiteTitle: "Suite Arverne", images: [
      { url: "/images/suites/clermont-arverne-2.jpg", alt: "Espace famille de la Suite Arverne" },
      { url: "/images/suites/clermont-arverne-3.jpg", alt: "Salle de bain accessible de la Suite Arverne" },
    ]},
    // Orléans
    { suiteTitle: "Suite Loire", images: [
      { url: "/images/suites/orleans-loire-2.jpg", alt: "Vue sur la Loire depuis la Suite Loire" },
      { url: "/images/suites/orleans-loire-3.jpg", alt: "Salle de bain de la Suite Loire" },
    ]},
    { suiteTitle: "Suite des Roseraies", images: [
      { url: "/images/suites/orleans-roseraies-2.jpg", alt: "Terrasse avec rosiers de la Suite des Roseraies" },
      { url: "/images/suites/orleans-roseraies-3.jpg", alt: "Baignoire de la Suite des Roseraies" },
    ]},
    // Limoges
    { suiteTitle: "Suite Porcelaine", images: [
      { url: "/images/suites/limoges-porcelaine-2.jpg", alt: "Détails porcelaine de la Suite Porcelaine" },
      { url: "/images/suites/limoges-porcelaine-3.jpg", alt: "Salle de bain de la Suite Porcelaine" },
    ]},
    { suiteTitle: "Suite des Émaux", images: [
      { url: "/images/suites/limoges-emaux-2.jpg", alt: "Décor coloré de la Suite des Émaux" },
      { url: "/images/suites/limoges-emaux-3.jpg", alt: "Salle de bain de la Suite des Émaux" },
    ]},
    // Vichy
    { suiteTitle: "Suite Thermale", images: [
      { url: "/images/suites/vichy-thermale-2.jpg", alt: "Bain thermal privatif de la Suite Thermale" },
      { url: "/images/suites/vichy-thermale-3.jpg", alt: "Terrasse de la Suite Thermale" },
    ]},
    { suiteTitle: "Suite des Sources", images: [
      { url: "/images/suites/vichy-sources-2.jpg", alt: "Douche sensorielle de la Suite des Sources" },
      { url: "/images/suites/vichy-sources-3.jpg", alt: "Vue sur le parc depuis la Suite des Sources" },
    ]},
    { suiteTitle: "Suite Célestins", images: [
      { url: "/images/suites/vichy-celestins-2.jpg", alt: "Salon séparé de la Suite Célestins" },
      { url: "/images/suites/vichy-celestins-3.jpg", alt: "Vue sur l'Allier depuis la Suite Célestins" },
    ]},
  ];

  await db.insert(image).values(
    suiteGalleryImages.flatMap(({ suiteTitle, images: suiteImages }) =>
      suiteImages.map((suiteImage, index) => ({
        url: suiteImage.url,
        alt: suiteImage.alt,
        position: index + 1,
        suiteId: suiteByTitle[suiteTitle],
      })),
    ),
  );

  // ─── Bookings ───

  // Helper to create dates relative to now
  const daysFromNow = (days: number): Date => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date;
  };

  const bookings = await db
    .insert(booking)
    .values([
      // Completed bookings (past)
      {
        reference: "SEED-PAST-001",
        checkIn: daysFromNow(-60),
        checkOut: daysFromNow(-57),
        guestCount: 2,
        pricePerNight: "380.00",
        totalPrice: "1140.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-1",
        suiteId: suiteByTitle["Suite Royale"],
      },
      {
        reference: "SEED-PAST-002",
        checkIn: daysFromNow(-45),
        checkOut: daysFromNow(-42),
        guestCount: 2,
        pricePerNight: "200.00",
        totalPrice: "600.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-2",
        suiteId: suiteByTitle["Suite Loire"],
      },
      {
        reference: "SEED-PAST-003",
        checkIn: daysFromNow(-40),
        checkOut: daysFromNow(-38),
        guestCount: 2,
        pricePerNight: "290.00",
        totalPrice: "580.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-3",
        suiteId: suiteByTitle["Suite Thermale"],
      },
      {
        reference: "SEED-PAST-004",
        checkIn: daysFromNow(-35),
        checkOut: daysFromNow(-32),
        guestCount: 2,
        pricePerNight: "220.00",
        totalPrice: "660.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-1",
        suiteId: suiteByTitle["Suite Jacques-Cœur"],
      },
      {
        reference: "SEED-PAST-005",
        checkIn: daysFromNow(-30),
        checkOut: daysFromNow(-27),
        guestCount: 2,
        pricePerNight: "260.00",
        totalPrice: "780.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-4",
        suiteId: suiteByTitle["Suite Puy-de-Dôme"],
      },
      {
        reference: "SEED-PAST-006",
        checkIn: daysFromNow(-25),
        checkOut: daysFromNow(-23),
        guestCount: 2,
        pricePerNight: "190.00",
        totalPrice: "380.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-5",
        suiteId: suiteByTitle["Suite Porcelaine"],
      },
      {
        reference: "SEED-PAST-007",
        checkIn: daysFromNow(-20),
        checkOut: daysFromNow(-17),
        guestCount: 3,
        pricePerNight: "320.00",
        totalPrice: "960.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-2",
        suiteId: suiteByTitle["Suite Célestins"],
      },
      {
        reference: "SEED-PAST-008",
        checkIn: daysFromNow(-15),
        checkOut: daysFromNow(-12),
        guestCount: 2,
        pricePerNight: "230.00",
        totalPrice: "690.00",
        status: BOOKING_STATUSES.COMPLETED,
        clientId: "seed-client-3",
        suiteId: suiteByTitle["Suite des Roseraies"],
      },
      // Cancelled bookings (past)
      {
        reference: "SEED-CANC-001",
        checkIn: daysFromNow(-50),
        checkOut: daysFromNow(-47),
        guestCount: 2,
        pricePerNight: "180.00",
        totalPrice: "540.00",
        status: BOOKING_STATUSES.CANCELLED,
        cancelledAt: daysFromNow(-55),
        clientId: "seed-client-4",
        suiteId: suiteByTitle["Suite des Marais"],
      },
      {
        reference: "SEED-CANC-002",
        checkIn: daysFromNow(-10),
        checkOut: daysFromNow(-7),
        guestCount: 4,
        pricePerNight: "240.00",
        totalPrice: "720.00",
        status: BOOKING_STATUSES.CANCELLED,
        cancelledAt: daysFromNow(-15),
        clientId: "seed-client-1",
        suiteId: suiteByTitle["Suite Arverne"],
      },
      // Confirmed future bookings
      {
        reference: "SEED-FUTURE-001",
        checkIn: daysFromNow(3),
        checkOut: daysFromNow(6),
        guestCount: 2,
        pricePerNight: "380.00",
        totalPrice: "1140.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-1",
        suiteId: suiteByTitle["Suite Royale"],
      },
      {
        reference: "SEED-FUTURE-002",
        checkIn: daysFromNow(7),
        checkOut: daysFromNow(10),
        guestCount: 2,
        pricePerNight: "290.00",
        totalPrice: "870.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-2",
        suiteId: suiteByTitle["Suite Thermale"],
      },
      {
        reference: "SEED-FUTURE-003",
        checkIn: daysFromNow(14),
        checkOut: daysFromNow(17),
        guestCount: 2,
        pricePerNight: "320.00",
        totalPrice: "960.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-3",
        suiteId: suiteByTitle["Suite Chenonceau"],
      },
      {
        reference: "SEED-FUTURE-004",
        checkIn: daysFromNow(20),
        checkOut: daysFromNow(22),
        guestCount: 2,
        pricePerNight: "200.00",
        totalPrice: "400.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-5",
        suiteId: suiteByTitle["Suite Loire"],
      },
      // Pending bookings (awaiting confirmation)
      {
        reference: "SEED-PEND-001",
        checkIn: daysFromNow(10),
        checkOut: daysFromNow(13),
        guestCount: 2,
        pricePerNight: "170.00",
        totalPrice: "510.00",
        status: BOOKING_STATUSES.PENDING,
        clientId: "seed-client-4",
        suiteId: suiteByTitle["Suite des Émaux"],
      },
      {
        reference: "SEED-PEND-002",
        checkIn: daysFromNow(25),
        checkOut: daysFromNow(28),
        guestCount: 2,
        pricePerNight: "240.00",
        totalPrice: "720.00",
        status: BOOKING_STATUSES.PENDING,
        clientId: "seed-client-1",
        suiteId: suiteByTitle["Suite des Sources"],
      },
      // Near-future booking (non-cancellable, 2 days from now)
      {
        reference: "SEED-FUTURE-005",
        checkIn: daysFromNow(2),
        checkOut: daysFromNow(5),
        guestCount: 2,
        pricePerNight: "220.00",
        totalPrice: "660.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-2",
        suiteId: suiteByTitle["Suite Volcanique"],
      },
      // Far-future bookings
      {
        reference: "SEED-FUTURE-006",
        checkIn: daysFromNow(45),
        checkOut: daysFromNow(49),
        guestCount: 4,
        pricePerNight: "240.00",
        totalPrice: "960.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-3",
        suiteId: suiteByTitle["Suite Arverne"],
      },
      {
        reference: "SEED-FUTURE-007",
        checkIn: daysFromNow(30),
        checkOut: daysFromNow(33),
        guestCount: 2,
        pricePerNight: "280.00",
        totalPrice: "840.00",
        status: BOOKING_STATUSES.CONFIRMED,
        clientId: "seed-client-5",
        suiteId: suiteByTitle["Suite des Jardins"],
      },
    ])
    .returning({ id: booking.id, reference: booking.reference });

  const bookingByReference = Object.fromEntries(
    bookings.map((bookingRow) => [bookingRow.reference, bookingRow.id]),
  );

  // ─── Booking ↔ Option (snapshots for some bookings) ───

  await db.insert(bookingOption).values([
    // SEED-PAST-001: Suite Royale — petit-déjeuner + spa
    { bookingId: bookingByReference["SEED-PAST-001"], optionId: optionBySlug["petit-dejeuner"], quantity: 2, unitPrice: "18.00" },
    { bookingId: bookingByReference["SEED-PAST-001"], optionId: optionBySlug["acces-spa"], quantity: 2, unitPrice: "35.00" },
    // SEED-PAST-003: Suite Thermale — spa included in experience
    { bookingId: bookingByReference["SEED-PAST-003"], optionId: optionBySlug["acces-spa"], quantity: 2, unitPrice: "20.00" },
    // SEED-PAST-004: Suite Jacques-Cœur — petit-déjeuner + panier pique-nique
    { bookingId: bookingByReference["SEED-PAST-004"], optionId: optionBySlug["petit-dejeuner"], quantity: 2, unitPrice: "12.00" },
    { bookingId: bookingByReference["SEED-PAST-004"], optionId: optionBySlug["panier-pique-nique"], quantity: 1, unitPrice: "16.00" },
    // SEED-PAST-008: Suite des Roseraies — pack romantique
    { bookingId: bookingByReference["SEED-PAST-008"], optionId: optionBySlug["pack-romantique"], quantity: 1, unitPrice: "42.00" },
    // SEED-FUTURE-001: Suite Royale — petit-déjeuner + pack romantique
    { bookingId: bookingByReference["SEED-FUTURE-001"], optionId: optionBySlug["petit-dejeuner"], quantity: 2, unitPrice: "18.00" },
    { bookingId: bookingByReference["SEED-FUTURE-001"], optionId: optionBySlug["pack-romantique"], quantity: 1, unitPrice: "65.00" },
    // SEED-FUTURE-002: Suite Thermale — spa
    { bookingId: bookingByReference["SEED-FUTURE-002"], optionId: optionBySlug["acces-spa"], quantity: 2, unitPrice: "20.00" },
    // SEED-FUTURE-006: Suite Arverne — lit supplémentaire (famille)
    { bookingId: bookingByReference["SEED-FUTURE-006"], optionId: optionBySlug["lit-supplementaire"], quantity: 1, unitPrice: "22.00" },
    { bookingId: bookingByReference["SEED-FUTURE-006"], optionId: optionBySlug["petit-dejeuner"], quantity: 4, unitPrice: "15.00" },
  ]);

  // ─── Reviews (on completed bookings) ───

  await db.insert(review).values([
    {
      rating: 5,
      comment: "Un séjour royal, au sens propre ! La cheminée dans la chambre et la vue sur les jardins sont exceptionnelles. Service impeccable.",
      bookingId: bookingByReference["SEED-PAST-001"],
      userId: "seed-client-1",
    },
    {
      rating: 4,
      comment: "Très bel emplacement en bord de Loire. La suite est lumineuse et agréable, petit-déjeuner correct. Seul bémol : le parking un peu loin.",
      bookingId: bookingByReference["SEED-PAST-002"],
      userId: "seed-client-2",
    },
    {
      rating: 5,
      comment: "L'accès au bain thermal privatif vaut à lui seul le séjour. Cadre magnifique, personnel aux petits soins. On reviendra !",
      bookingId: bookingByReference["SEED-PAST-003"],
      userId: "seed-client-3",
    },
    {
      rating: 4,
      comment: "Charme authentique de cette maison de maître. Les poutres apparentes et l'ambiance sont superbes. Dommage que le WiFi soit un peu capricieux.",
      bookingId: bookingByReference["SEED-PAST-004"],
      userId: "seed-client-1",
    },
    {
      rating: 5,
      comment: "Vue époustouflante sur la chaîne des Puys depuis la baie vitrée. Le design est moderne sans être froid. Petit-déjeuner de qualité.",
      bookingId: bookingByReference["SEED-PAST-005"],
      userId: "seed-client-4",
    },
    {
      rating: 3,
      comment: "L'hôtel est joli et la décoration soignée, mais la suite est un peu petite pour le prix. Bon accueil néanmoins.",
      bookingId: bookingByReference["SEED-PAST-006"],
      userId: "seed-client-5",
    },
    {
      rating: 5,
      comment: "La Suite Célestins est fabuleuse : salon séparé, terrasse avec vue sur l'Allier, et l'espace spa de l'hôtel est extraordinaire.",
      bookingId: bookingByReference["SEED-PAST-007"],
      userId: "seed-client-2",
    },
    {
      rating: 4,
      comment: "Le pack romantique dans la Suite des Roseraies était parfait pour notre anniversaire. La terrasse privée avec les rosiers est un vrai bonheur.",
      bookingId: bookingByReference["SEED-PAST-008"],
      userId: "seed-client-3",
    },
    // One flagged review
    {
      rating: 1,
      comment: "ARNAQUE ! La chambre ne correspondait pas du tout aux photos. Je déconseille fortement.",
      flagged: true,
      bookingId: bookingByReference["SEED-CANC-001"],
      userId: "seed-client-4",
    },
  ]);

  // ─── Inquiries ───

  await db.insert(inquiry).values([
    {
      name: "Jean Lefèvre",
      email: "jean@example.test",
      subject: "suite_info",
      message: "Bonjour, je souhaite savoir si la Suite Royale à Tours dispose d'un accès direct au jardin. Merci.",
      status: "replied",
      establishmentId: toursId,
      userId: "seed-client-1",
    },
    {
      name: "Claire Moreau",
      email: "claire@example.test",
      subject: "extra_service",
      message: "Serait-il possible d'organiser un transfert depuis la gare de Vichy pour notre arrivée le 15 ? Nous serons deux avec des bagages volumineux.",
      status: "read",
      establishmentId: vichyId,
      userId: "seed-client-2",
    },
    {
      name: "Luc Girard",
      email: "luc@example.test",
      subject: "complaint",
      message: "Lors de notre séjour à Orléans, le chauffage de la chambre ne fonctionnait pas correctement. Nous avons dû demander des couvertures supplémentaires.",
      status: "replied",
      establishmentId: orleansId,
      userId: "seed-client-3",
    },
    {
      name: "Sophie Visiteur",
      email: "sophie.visiteur@email.fr",
      subject: "suite_info",
      message: "Bonjour, je recherche une suite accessible PMR pour un séjour début mai. Quels établissements proposez-vous ?",
      status: "unread",
    },
    {
      name: "Émilie Roux",
      email: "emilie@example.test",
      subject: "extra_service",
      message: "Je souhaiterais réserver le pack romantique pour la Suite Porcelaine à Limoges. Est-ce possible pour le week-end prochain ?",
      status: "unread",
      establishmentId: limogesId,
      userId: "seed-client-4",
    },
    {
      name: "Antoine Duval",
      email: "antoine@example.test",
      subject: "app_issue",
      message: "Je n'arrive pas à modifier la date de ma réservation depuis l'application. Le bouton ne répond pas.",
      status: "read",
      userId: "seed-client-5",
    },
    {
      name: "Marc Touriste",
      email: "marc.touriste@email.fr",
      subject: "suite_info",
      message: "Bonjour, est-ce que l'hôtel de Bourges accepte les chiens de grande taille ? Nous avons un labrador.",
      status: "unread",
      establishmentId: bourgesId,
    },
    {
      name: "Luc Girard",
      email: "luc@example.test",
      subject: "extra_service",
      message: "Suite à notre prochain séjour à Clermont-Ferrand, nous aimerions louer deux VTT pour trois jours. Pouvez-vous confirmer la disponibilité ?",
      status: "unread",
      establishmentId: clermontId,
      userId: "seed-client-3",
    },
  ]);

  // ─── Summary ───

  console.log("Seed complete:");
  console.log("  9 users (1 admin + 3 managers + 5 clients)");
  console.log("  6 establishments (Tours, Bourges, Clermont-Ferrand, Orléans, Limoges, Vichy)");
  console.log("  16 suites with 32 gallery images");
  console.log("  38 amenities + 10 options");
  console.log("  19 bookings (8 completed, 2 cancelled, 7 confirmed, 2 pending)");
  console.log("  9 reviews (1 flagged)");
  console.log("  8 inquiries");
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
