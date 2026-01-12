import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const adapter = prismaAdapter(prisma, {
  provider: "postgresql",
});

// Wrap createUser to enforce First User Claim
const originalCreateUser = adapter.createUser;
adapter.createUser = async (data, ctx) => {
  const count = await prisma.user.count();

  if (count === 0) {
    // First user becomes admin
    return originalCreateUser({
      ...data,
      role: "admin",
    }, ctx);
  } else {
    // Subsequent users are REJECTED
    // This prevents any sign-up via API or Frontend
    throw new Error("Registration is closed. Only the first user can sign up.");
  }
};

export const auth = betterAuth({
  database: adapter,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: ["http://localhost:3000"], // Explicitly trust localhost
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutes
    }
  },
  advanced: {
    useSecureCookies: false, // Force false for localhost development
    crossSubDomainCookies: {
      enabled: false
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: false,
      path: "/",
      httpOnly: true
    }
  },
  debug: true // Enable debug logs to see why session might be rejected
});
