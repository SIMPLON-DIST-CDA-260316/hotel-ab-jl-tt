import { scryptSync, randomBytes } from "crypto";

// Must match Better Auth's internal hash format: hex(salt):hex(key)
// Parameters: N=16384, r=16, p=1, keylen=64  (see better-auth/src/utils/hash.ts)
const SCRYPT_PARAMS = { N: 16384, r: 16, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

export function hashPassword(password: string): string {
  const salt = randomBytes(SALT_LENGTH);
  const key = scryptSync(password, salt, KEY_LENGTH, SCRYPT_PARAMS);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}
