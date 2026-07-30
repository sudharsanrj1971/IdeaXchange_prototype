const { z } = require('zod');

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  MONGODB_URI: z.string().url(),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters long"),
  PLATFORM_SIGNING_KEY: z.string().min(32, "PLATFORM_SIGNING_KEY must be at least 32 characters long"),
  RAFT_INTERNAL_SECRET: z.string().min(16, "RAFT_INTERNAL_SECRET must be at least 16 characters long"),
  BCRYPT_SALT_ROUNDS: z.coerce.number().default(12),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  FIREBASE_SERVICE_ACCOUNT_BASE64: z.string().min(1, "FIREBASE_SERVICE_ACCOUNT_BASE64 is required (base64-encoded Firebase service account JSON)"),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error("❌ Invalid environment configuration:", JSON.stringify(parsed.error.format(), null, 2));
    process.exit(1);
  }
  process.env = { ...process.env, ...parsed.data };
}

module.exports = { validateEnv };
