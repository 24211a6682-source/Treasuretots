import { createHash, randomBytes } from "node:crypto";
import { Router } from "express";
import { db, passwordResetTokensTable, usersTable } from "@workspace/db";
import { and, eq, gt, isNull, sql } from "drizzle-orm";
import { signToken, hashPassword, comparePassword } from "../lib/auth";
import { requireAuth } from "../middlewares/requireAuth";
import {
  RegisterBody,
  LoginBody,
  RequestPasswordResetBody,
  ResetPasswordBody,
} from "@workspace/api-zod";
import { sendPasswordResetEmail } from "../lib/email";

const router = Router();
const RESET_REQUEST_MESSAGE = "If an account exists for that email, a reset link has been sent.";

function hashResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function getAppOrigin(): string {
  const configuredOrigin =
    process.env.APP_URL ||
    process.env.ALLOWED_ORIGIN?.split(",")[0]?.trim() ||
    process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();

  if (!configuredOrigin) {
    throw new Error("APP_URL, ALLOWED_ORIGIN, or REPLIT_DOMAINS is required for password reset emails");
  }

  const url = new URL(
    configuredOrigin.startsWith("http://") || configuredOrigin.startsWith("https://")
      ? configuredOrigin
      : `https://${configuredOrigin}`,
  );
  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Password reset application origin must use HTTP or HTTPS");
  }
  return url.origin;
}

router.post("/v1/auth/register", async (req, res) => {
  const parse = RegisterBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const name = parse.data.name.trim();
  const email = parse.data.email?.trim().toLowerCase() || null;
  const phone = parse.data.phone?.trim() || null;
  const { password } = parse.data;
  if (!email && !phone) {
    res.status(400).json({ error: "Email or phone required" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(
      email ? eq(usersTable.email, email) : eq(usersTable.phone, phone!)
    ).limit(1);
    if (existing.length > 0) {
      // Use a generic message to prevent user-enumeration via the register endpoint.
      res.status(400).json({ error: "Registration failed. Please check your details and try again." });
      return;
    }
    const passwordHash = await hashPassword(password);
    const [user] = await db.insert(usersTable).values({
      name,
      email,
      phone,
      passwordHash,
      role: "user",
    }).returning();
    const token = signToken({ userId: user.id, role: user.role });
    res.status(201).json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Registration failed" });
  }
});

router.post("/v1/auth/login", async (req, res) => {
  const parse = LoginBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }
  const email = parse.data.email?.trim().toLowerCase() || null;
  const phone = parse.data.phone?.trim() || null;
  const { password } = parse.data;
  if (!email && !phone) {
    res.status(400).json({ error: "Email or phone required" });
    return;
  }
  try {
    const condition = email
      ? sql`lower(${usersTable.email}) = ${email}`
      : eq(usersTable.phone, phone!);
    const [user] = await db.select().from(usersTable).where(condition).limit(1);
    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const valid = await comparePassword(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const token = signToken({ userId: user.id, role: user.role });
    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt },
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Login failed" });
  }
});

router.get("/v1/auth/me", requireAuth, async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.userId)).limit(1);
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: user.id, name: user.name, email: user.email, phone: user.phone, role: user.role, createdAt: user.createdAt });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "Failed to get user" });
  }
});

router.post("/v1/auth/password-reset/request", async (req, res) => {
  const parse = RequestPasswordResetBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const email = parse.data.email.trim().toLowerCase();
  res.json({ message: RESET_REQUEST_MESSAGE });

  try {
    const [user] = await db
      .select({ id: usersTable.id, name: usersTable.name, email: usersTable.email })
      .from(usersTable)
      .where(sql`lower(${usersTable.email}) = ${email}`)
      .limit(1);

    if (user?.email) {
      const now = new Date();
      await db
        .update(passwordResetTokensTable)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokensTable.userId, user.id),
            isNull(passwordResetTokensTable.usedAt),
          ),
        );

      const token = randomBytes(32).toString("base64url");
      await db.insert(passwordResetTokensTable).values({
        userId: user.id,
        tokenHash: hashResetToken(token),
        expiresAt: new Date(now.getTime() + 60 * 60 * 1000),
      });

      const resetUrl = new URL("/reset-password", getAppOrigin());
      resetUrl.searchParams.set("token", token);
      await sendPasswordResetEmail(
        { email: user.email, name: user.name, resetUrl: resetUrl.toString() },
        req.log,
      );
    }
  } catch (err) {
    req.log.error({ err }, "Password reset request error");
  }
});

router.post("/v1/auth/password-reset", async (req, res) => {
  const parse = ResetPasswordBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const now = new Date();
  const tokenHash = hashResetToken(parse.data.token);

  try {
    const passwordHash = await hashPassword(parse.data.password);
    const didReset = await db.transaction(async (tx) => {
      const [claimedToken] = await tx
        .update(passwordResetTokensTable)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokensTable.tokenHash, tokenHash),
            isNull(passwordResetTokensTable.usedAt),
            gt(passwordResetTokensTable.expiresAt, now),
          ),
        )
        .returning({ userId: passwordResetTokensTable.userId });

      if (!claimedToken) return false;

      await tx
        .update(usersTable)
        .set({ passwordHash })
        .where(eq(usersTable.id, claimedToken.userId));

      await tx
        .update(passwordResetTokensTable)
        .set({ usedAt: now })
        .where(
          and(
            eq(passwordResetTokensTable.userId, claimedToken.userId),
            isNull(passwordResetTokensTable.usedAt),
          ),
        );

      return true;
    });

    if (!didReset) {
      res.status(400).json({ error: "This reset link is invalid or has expired." });
      return;
    }

    res.json({ message: "Your password has been reset. You can now log in." });
  } catch (err) {
    req.log.error({ err }, "Password reset error");
    res.status(500).json({ error: "Password reset failed" });
  }
});

export default router;
