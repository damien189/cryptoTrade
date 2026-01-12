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
  trustedOrigins: process.env.NODE_ENV === "production"
    ? [process.env.BETTER_AUTH_URL!]
    : ["http://localhost:3000"],
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5 // 5 minutes
    }
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === "production",
    crossSubDomainCookies: {
      enabled: false
    },
    defaultCookieAttributes: {
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      httpOnly: true
    }
  },
  debug: true // Enable debug logs to see why session might be rejected
});
