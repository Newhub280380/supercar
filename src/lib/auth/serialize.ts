import type { users } from "@/db/schema";

type UserRow = typeof users.$inferSelect;

/** Fields safe to return right after login/registration. */
export function toAuthUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar,
  };
}

/** Account fields returned by the profile endpoints. */
export function toUserAccount(user: UserRow) {
  return {
    ...toAuthUser(user),
    phone: user.phone,
    settings: user.settings,
  };
}

/** Full account payload including audit timestamps. */
export function toUserProfile(user: UserRow) {
  return {
    ...toUserAccount(user),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
