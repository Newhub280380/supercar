/**
 * Создаёт владельца CRM с настоящим bcrypt-хешем, если учётки ещё нет.
 * Пароль уже существующего пользователя не перезаписывается.
 *
 *   DEMO_EMAIL=owner@zishel.kz DEMO_PASSWORD='Owner12345!' npx tsx src/db/ensure-owner.ts
 */
import { eq } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { db } from "./index";
import { users } from "./schema";

const email = (process.env.DEMO_EMAIL ?? "owner@zishel.kz").toLowerCase();
const password = process.env.DEMO_PASSWORD ?? "Owner12345!";

async function main(): Promise<void> {
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  if (existing) {
    if (existing.role === "client") {
      await db
        .update(users)
        .set({ role: "cosmetologist", updatedAt: new Date() })
        .where(eq(users.id, existing.id));
      console.log(`Promoted ${email} to cosmetologist`);
    } else {
      console.log(`Owner already exists: ${email}`);
    }
    return;
  }

  const passwordHash = await hashPassword(password);
  await db.insert(users).values({
    email,
    passwordHash,
    name: "Владелец",
    role: "cosmetologist",
    phone: "+7 777 688 78 88",
  });
  console.log(`Owner created: ${email}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
