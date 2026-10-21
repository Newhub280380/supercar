import { and, desc, eq, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { contacts } from "@/db/schema";
import {
  contactFromBody,
  matchContact,
  parseContactsCsv,
  type ContactStatus,
  type ContactWrite,
  type CsvImportIssue,
} from "./contacts";

const MAX_IMPORT_ROWS = 2000;

export type ContactRecord = {
  id: string;
  name: string;
  specialty: string | null;
  city: string | null;
  clinic: string | null;
  source: string | null;
  phones: string | null;
  whatsapp: string | null;
  instagram: string | null;
  status: ContactStatus;
  createdAt: Date;
  updatedAt: Date;
};

function toRecord(row: typeof contacts.$inferSelect): ContactRecord {
  return {
    id: row.id,
    name: row.name,
    specialty: row.specialty,
    city: row.city,
    clinic: row.clinic,
    source: row.source,
    phones: row.phones,
    whatsapp: row.whatsapp,
    instagram: row.instagram,
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function valuesOf(ownerId: string, input: ContactWrite) {
  return {
    ownerId,
    name: input.name,
    specialty: input.specialty,
    city: input.city,
    clinic: input.clinic,
    source: input.source,
    phones: input.phones,
    phoneKey: input.phoneKey,
    whatsapp: input.whatsapp,
    whatsappKey: input.whatsappKey,
    instagram: input.instagram,
    instagramKey: input.instagramKey,
    status: input.status,
  };
}

export async function listContacts(
  ownerId: string,
  opts: { q?: string | null; status?: ContactStatus | null } = {},
): Promise<ContactRecord[]> {
  const filters = [eq(contacts.ownerId, ownerId)];
  if (opts.status) filters.push(eq(contacts.status, opts.status));
  if (opts.q) {
    const pattern = `%${opts.q.replace(/[%_]/g, "")}%`;
    const search = or(
      ilike(contacts.name, pattern),
      ilike(contacts.clinic, pattern),
      ilike(contacts.city, pattern),
      ilike(contacts.specialty, pattern),
      ilike(contacts.phones, pattern),
      ilike(contacts.whatsapp, pattern),
      ilike(contacts.instagram, pattern),
    );
    if (search) filters.push(search);
  }

  const rows = await db
    .select()
    .from(contacts)
    .where(and(...filters))
    .orderBy(desc(contacts.createdAt));
  return rows.map(toRecord);
}

export async function getContact(
  ownerId: string,
  id: string,
): Promise<ContactRecord | null> {
  const [row] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.ownerId, ownerId)))
    .limit(1);
  return row ? toRecord(row) : null;
}

export async function createContact(
  ownerId: string,
  input: ContactWrite,
): Promise<ContactRecord> {
  const [row] = await db
    .insert(contacts)
    .values(valuesOf(ownerId, input))
    .returning();
  return toRecord(row);
}

export async function updateContact(
  ownerId: string,
  id: string,
  input: ContactWrite,
): Promise<ContactRecord | null> {
  const [row] = await db
    .update(contacts)
    .set({ ...valuesOf(ownerId, input), updatedAt: new Date() })
    .where(and(eq(contacts.id, id), eq(contacts.ownerId, ownerId)))
    .returning();
  return row ? toRecord(row) : null;
}

export async function deleteContact(
  ownerId: string,
  id: string,
): Promise<boolean> {
  const rows = await db
    .delete(contacts)
    .where(and(eq(contacts.id, id), eq(contacts.ownerId, ownerId)))
    .returning({ id: contacts.id });
  return rows.length > 0;
}

export async function importContactsCsv(
  ownerId: string,
  csv: string,
): Promise<{
  created: number;
  updated: number;
  errors: CsvImportIssue[];
}> {
  const parsed = parseContactsCsv(csv);
  if (parsed.rows.length > MAX_IMPORT_ROWS) {
    return {
      created: 0,
      updated: 0,
      errors: [
        {
          row: 1,
          message: `Слишком много строк: ${parsed.rows.length}. Лимит ${MAX_IMPORT_ROWS}.`,
        },
      ],
    };
  }

  const existing = await db
    .select({
      id: contacts.id,
      phoneKey: contacts.phoneKey,
      whatsappKey: contacts.whatsappKey,
      instagramKey: contacts.instagramKey,
    })
    .from(contacts)
    .where(eq(contacts.ownerId, ownerId));

  let created = 0;
  let updated = 0;
  const known = existing.map((row) => ({
    id: row.id,
    phoneKey: row.phoneKey,
    whatsappKey: row.whatsappKey,
    instagramKey: row.instagramKey,
  }));

  for (const row of parsed.rows) {
    const matchId = matchContact(known, row);
    if (matchId) {
      await db
        .update(contacts)
        .set({ ...valuesOf(ownerId, row), updatedAt: new Date() })
        .where(and(eq(contacts.id, matchId), eq(contacts.ownerId, ownerId)));
      const current = known.find((item) => item.id === matchId);
      if (current) {
        current.phoneKey = row.phoneKey ?? current.phoneKey;
        current.whatsappKey = row.whatsappKey ?? current.whatsappKey;
        current.instagramKey = row.instagramKey ?? current.instagramKey;
      }
      updated += 1;
    } else {
      const [inserted] = await db
        .insert(contacts)
        .values(valuesOf(ownerId, row))
        .returning({ id: contacts.id });
      known.push({
        id: inserted.id,
        phoneKey: row.phoneKey,
        whatsappKey: row.whatsappKey,
        instagramKey: row.instagramKey,
      });
      created += 1;
    }
  }

  return { created, updated, errors: parsed.errors };
}

export function readContactBody(data: Record<string, unknown>) {
  return contactFromBody(data);
}
