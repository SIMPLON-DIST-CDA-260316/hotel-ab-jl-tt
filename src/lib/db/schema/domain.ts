import { sql } from "drizzle-orm";
import { BOOKING_STATUSES } from "@/config/booking-statuses";
import {
  pgTable,
  pgEnum,
  text,
  boolean,
  timestamp,
  integer,
  numeric,
  date,
  time,
  index,
  primaryKey,
  unique,
  check,
} from "drizzle-orm/pg-core";
import { user } from "./auth";

// ─── Enums ───

export const amenityScopeEnum = pgEnum("amenity_scope", [
  "property",
  "room",
  "both",
]);

export const pricingModelEnum = pgEnum("pricing_model", [
  "per_person_per_night",
  "per_night",
  "per_person_per_stay",
  "per_stay",
  "per_unit",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "confirmed",
  "cancelled",
  "completed",
]);

export const inquirySubjectEnum = pgEnum("inquiry_subject", [
  "complaint",
  "extra_service",
  "suite_info",
  "app_issue",
]);

export const inquiryStatusEnum = pgEnum("inquiry_status", [
  "unread",
  "read",
  "replied",
]);

// ─── Establishment ───

export const establishment = pgTable(
  "establishment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    address: text("address").notNull(),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    description: text("description"),
    image: text("image"),
    phone: text("phone"),
    email: text("email"),
    checkInTime: time("check_in_time").notNull(),
    checkOutTime: time("check_out_time").notNull(),
    managerId: text("manager_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [index("establishment_manager_id_idx").on(table.managerId)],
);

// ─── Suite ───

export const suite = pgTable(
  "suite",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    description: text("description"),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    mainImage: text("main_image").notNull(),
    capacity: integer("capacity").notNull(),
    area: numeric("area", { precision: 6, scale: 2 }),
    establishmentId: text("establishment_id")
      .notNull()
      .references(() => establishment.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => [
    index("suite_establishment_id_idx").on(table.establishmentId),
    check("suite_price_positive", sql`${table.price} > 0`),
    check("suite_capacity_positive", sql`${table.capacity} > 0`),
  ],
);

// ─── Image ───

export const image = pgTable(
  "image",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    url: text("url").notNull(),
    alt: text("alt"),
    position: integer("position").notNull(),
    suiteId: text("suite_id")
      .notNull()
      .references(() => suite.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    unique("image_suite_position_unique").on(table.suiteId, table.position),
    index("image_suite_id_idx").on(table.suiteId),
  ],
);

// ─── Amenity ───

export const amenity = pgTable("amenity", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  category: text("category").notNull(),
  scope: amenityScopeEnum("scope").notNull(),
  icon: text("icon"),
});

// ─── Establishment ↔ Amenity (N:N) ───

export const establishmentAmenity = pgTable(
  "establishment_amenity",
  {
    establishmentId: text("establishment_id")
      .notNull()
      .references(() => establishment.id, { onDelete: "cascade" }),
    amenityId: text("amenity_id")
      .notNull()
      .references(() => amenity.id, { onDelete: "cascade" }),
  },
  (table) => [
    primaryKey({ columns: [table.establishmentId, table.amenityId] }),
  ],
);

// ─── Suite ↔ Amenity (N:N) ───

export const suiteAmenity = pgTable(
  "suite_amenity",
  {
    suiteId: text("suite_id")
      .notNull()
      .references(() => suite.id, { onDelete: "cascade" }),
    amenityId: text("amenity_id")
      .notNull()
      .references(() => amenity.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.suiteId, table.amenityId] })],
);

// ─── Option ───

export const option = pgTable("option", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  icon: text("icon"),
  pricingModel: pricingModelEnum("pricing_model").notNull(),
  defaultPrice: numeric("default_price", { precision: 10, scale: 2 }).notNull(),
});

// ─── Establishment ↔ Option (N:N with price and inclusion) ───

export const establishmentOption = pgTable(
  "establishment_option",
  {
    establishmentId: text("establishment_id")
      .notNull()
      .references(() => establishment.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => option.id, { onDelete: "cascade" }),
    price: numeric("price", { precision: 10, scale: 2 }).notNull(),
    included: boolean("included").default(false).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.establishmentId, table.optionId] }),
  ],
);

// ─── Booking ───

export const booking = pgTable(
  "booking",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    reference: text("reference").notNull().unique(),
    checkIn: date("check_in", { mode: "date" }).notNull(),
    checkOut: date("check_out", { mode: "date" }).notNull(),
    guestCount: integer("guest_count").notNull(),
    pricePerNight: numeric("price_per_night", {
      precision: 10,
      scale: 2,
    }).notNull(),
    totalPrice: numeric("total_price", { precision: 10, scale: 2 }).notNull(),
    status: bookingStatusEnum("status").default(BOOKING_STATUSES.PENDING).notNull(),
    cancelledAt: timestamp("cancelled_at"),
    clientId: text("client_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    suiteId: text("suite_id")
      .notNull()
      .references(() => suite.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("booking_client_id_idx").on(table.clientId),
    index("booking_suite_id_idx").on(table.suiteId),
    check("booking_dates_valid", sql`${table.checkOut} > ${table.checkIn}`),
    check(
      "booking_price_per_night_positive",
      sql`${table.pricePerNight} > 0`,
    ),
    check("booking_total_price_positive", sql`${table.totalPrice} > 0`),
    check("booking_guest_count_positive", sql`${table.guestCount} > 0`),
  ],
);

// ─── Booking ↔ Option (N:N with quantity and price snapshot) ───

export const bookingOption = pgTable(
  "booking_option",
  {
    bookingId: text("booking_id")
      .notNull()
      .references(() => booking.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => option.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: numeric("unit_price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.bookingId, table.optionId] }),
    check("booking_option_quantity_positive", sql`${table.quantity} > 0`),
    check(
      "booking_option_unit_price_non_negative",
      sql`${table.unitPrice} >= 0`,
    ),
  ],
);

// ─── Review ───

export const review = pgTable(
  "review",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    flagged: boolean("flagged").default(false).notNull(),
    bookingId: text("booking_id")
      .notNull()
      .unique()
      .references(() => booking.id, { onDelete: "cascade" }),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("review_booking_id_idx").on(table.bookingId),
    check("review_rating_range", sql`${table.rating} BETWEEN 1 AND 5`),
  ],
);

// ─── Inquiry ───

export const inquiry = pgTable(
  "inquiry",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    email: text("email").notNull(),
    subject: inquirySubjectEnum("subject").notNull(),
    message: text("message").notNull(),
    status: inquiryStatusEnum("status").default("unread").notNull(),
    establishmentId: text("establishment_id").references(
      () => establishment.id,
      { onDelete: "set null" },
    ),
    userId: text("user_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("inquiry_establishment_id_idx").on(table.establishmentId),
    index("inquiry_user_id_idx").on(table.userId),
  ],
);
