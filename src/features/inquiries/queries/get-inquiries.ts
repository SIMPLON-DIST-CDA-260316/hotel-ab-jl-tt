import { db } from "@/lib/db";
import { establishment, inquiry } from "@/lib/db/schema/domain";
import { eq, isNull } from "drizzle-orm";

export async function getInquiries() {
  return db
    .select({
      id: inquiry.id,
      name: inquiry.name,
      email: inquiry.email,
      subject: inquiry.subject,
      message: inquiry.message,
      establishmentName: establishment.name,
    })
    .from(inquiry)
    .leftJoin(establishment, eq(inquiry.establishmentId, establishment.id));
}
