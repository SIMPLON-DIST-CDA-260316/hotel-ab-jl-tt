import { relations, sql } from "drizzle-orm";
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

// ─── Enums ───

export const roleEnum = pgEnum("role", ["admin", "manager", "client"]);

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

// ─── Better Auth: User (enrichi avec role + deleted_at) ───

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  role: roleEnum("role").default("client").notNull(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at")
    .$onUpdate(() => new Date())
    .notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ─── Better Auth: Session ───

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  (table) => [index("session_userId_idx").on(table.userId)],
);

// ─── Better Auth: Account ───

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("account_userId_idx").on(table.userId)],
);

// ─── Better Auth: Verification ───

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at")
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("verification_identifier_idx").on(table.identifier)],
);

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

// ─── Establishment ↔ Option (N:N avec prix et inclusion) ───

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
    status: bookingStatusEnum("status").default("confirmed").notNull(),
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

// ─── Booking ↔ Option (N:N avec quantité et prix snapshot) ───

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

// ═══════════════════════════════════════════════════════════
// Relations (pour le query builder Drizzle — .with())
// ═══════════════════════════════════════════════════════════

// ─── User relations ───

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  managedEstablishments: many(establishment),
  bookings: many(booking),
  reviews: many(review),
  inquiries: many(inquiry),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

// ─── Establishment relations ───

export const establishmentRelations = relations(
  establishment,
  ({ one, many }) => ({
    manager: one(user, {
      fields: [establishment.managerId],
      references: [user.id],
    }),
    suites: many(suite),
    inquiries: many(inquiry),
    establishmentAmenities: many(establishmentAmenity),
    establishmentOptions: many(establishmentOption),
  }),
);

// ─── Suite relations ───

export const suiteRelations = relations(suite, ({ one, many }) => ({
  establishment: one(establishment, {
    fields: [suite.establishmentId],
    references: [establishment.id],
  }),
  images: many(image),
  bookings: many(booking),
  suiteAmenities: many(suiteAmenity),
}));

// ─── Image relations ───

export const imageRelations = relations(image, ({ one }) => ({
  suite: one(suite, {
    fields: [image.suiteId],
    references: [suite.id],
  }),
}));

// ─── Amenity relations ───

export const amenityRelations = relations(amenity, ({ many }) => ({
  establishmentAmenities: many(establishmentAmenity),
  suiteAmenities: many(suiteAmenity),
}));

export const establishmentAmenityRelations = relations(
  establishmentAmenity,
  ({ one }) => ({
    establishment: one(establishment, {
      fields: [establishmentAmenity.establishmentId],
      references: [establishment.id],
    }),
    amenity: one(amenity, {
      fields: [establishmentAmenity.amenityId],
      references: [amenity.id],
    }),
  }),
);

export const suiteAmenityRelations = relations(suiteAmenity, ({ one }) => ({
  suite: one(suite, {
    fields: [suiteAmenity.suiteId],
    references: [suite.id],
  }),
  amenity: one(amenity, {
    fields: [suiteAmenity.amenityId],
    references: [amenity.id],
  }),
}));

// ─── Option relations ───

export const optionRelations = relations(option, ({ many }) => ({
  establishmentOptions: many(establishmentOption),
  bookingOptions: many(bookingOption),
}));

export const establishmentOptionRelations = relations(
  establishmentOption,
  ({ one }) => ({
    establishment: one(establishment, {
      fields: [establishmentOption.establishmentId],
      references: [establishment.id],
    }),
    option: one(option, {
      fields: [establishmentOption.optionId],
      references: [option.id],
    }),
  }),
);

// ─── Booking relations ───

export const bookingRelations = relations(booking, ({ one, many }) => ({
  client: one(user, {
    fields: [booking.clientId],
    references: [user.id],
  }),
  suite: one(suite, {
    fields: [booking.suiteId],
    references: [suite.id],
  }),
  review: one(review),
  bookingOptions: many(bookingOption),
}));

export const bookingOptionRelations = relations(bookingOption, ({ one }) => ({
  booking: one(booking, {
    fields: [bookingOption.bookingId],
    references: [booking.id],
  }),
  option: one(option, {
    fields: [bookingOption.optionId],
    references: [option.id],
  }),
}));

// ─── Review relations ───

export const reviewRelations = relations(review, ({ one }) => ({
  booking: one(booking, {
    fields: [review.bookingId],
    references: [booking.id],
  }),
  user: one(user, {
    fields: [review.userId],
    references: [user.id],
  }),
}));

// ─── Inquiry relations ───

export const inquiryRelations = relations(inquiry, ({ one }) => ({
  establishment: one(establishment, {
    fields: [inquiry.establishmentId],
    references: [establishment.id],
  }),
  user: one(user, {
    fields: [inquiry.userId],
    references: [user.id],
  }),
}));
