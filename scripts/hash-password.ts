import { hashPassword } from "../lib/auth/session";

const password = process.argv[2];
if (!password) {
  console.error("Usage: npm run hash-password -- 'your-password'");
  process.exit(1);
}

process.env.SESSION_SECRET = process.env.SESSION_SECRET || "temporary-for-hash-script-only";
console.log(hashPassword(password));
