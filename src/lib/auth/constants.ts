export const AUTH_COOKIE_NAME = "auth_token";
export const JWT_EXPIRES_IN = "7d";
export const REFRESH_TOKEN_EXPIRES_IN = "30d";
export const PASSWORD_RESET_EXPIRES_MINUTES = 60;
export const BCRYPT_ROUNDS = 12;

export const VALID_ROLES = ["admin", "cosmetologist", "client"] as const;

export const ROLE_GUARDED_PATHS: Record<string, string[]> = {
  "/dashboard": ["cosmetologist", "admin"],
  "/profile": ["admin", "cosmetologist", "client"],
};

export const AUTH_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/role-selection",
];

export const PUBLIC_PATHS = [
  "/",
  "/about",
  "/pricing",
  "/contact",
];
