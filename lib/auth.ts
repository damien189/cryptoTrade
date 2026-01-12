import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

const adapter = prismaAdapter(prisma, {
  provider: "postgresql",
});

// Wrap createUser to enforce First User Claim
const originalCreateUser = adapter.createUser;
adapter.createUser = async (data, ctx) => {
  try {
    const count = await prisma.user.count();
    console.log("[v0] Auth Hook: Checking user count:", count);

    if (count === 0) {
      console.log("[v0] Auth Hook: allowing first user as admin");
      // First user becomes admin
      return originalCreateUser({
        ...data,
        role: "admin",
      }, ctx);
    } else {
      console.log("[v0] Auth Hook: blocking subsequent user");
      // Subsequent users are REJECTED
      throw new Error("Registration is closed. Only the first user can sign up.");
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("Registration is closed")) {
      throw error;
    }
    console.error("[v0] Auth Hook Error:", error);
    throw new Error("Registration failed due to system error.");
  }
};

export const auth = betterAuth({
  database: adapter,
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: process.env.NODE_ENV === "production"
    ? [
      process.env.BETTER_AUTH_URL!,
      "https://" + process.env.VERCEL_URL,
      // Add current origin as safe fallback if needed
    ]
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
