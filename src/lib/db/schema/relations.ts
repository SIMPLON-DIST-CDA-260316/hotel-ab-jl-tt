/**
 * Drizzle relations — query builder metadata only.
 *
 * Nothing in this file creates or modifies database objects.
 * Relations defined here enable Drizzle's `db.query.*` relational API
 * (joins, nested selects) but have no SQL equivalent — they are invisible
 * to `drizzle-kit push` and do not appear in migrations.
 *
 * All FK constraints that actually exist in the database are declared
 * via `.references()` in schema/domain.ts.
 */
import { relations } from "drizzle-orm";
import { user, session, account } from "./auth";
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
} from "./domain";

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
