import express, { type Express, type Request } from "express";

// Extend Express Request to carry the raw body buffer needed for webhook
// signature verification (populated by the express.json verify callback below).
declare global {
  namespace Express {
    interface Request {
      rawBody?: Buffer;
    }
  }
}
import cors from "cors";
import pinoHttp from "pino-http";
import rateLimit from "express-rate-limit";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
app.set("trust proxy", 1);

// ---------------------------------------------------------------------------
// CORS — restrict to the explicitly configured frontend origin(s).
// Set ALLOWED_ORIGIN to a comma-separated list of permitted origins.
// With no env var set, the server falls back to Replit's managed preview
// domains so the preview pane keeps working.
// ---------------------------------------------------------------------------
const rawAllowedOrigins = process.env.ALLOWED_ORIGIN ?? "";
const allowedOrigins: Set<string> = new Set(
  rawAllowedOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
);

app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests (e.g. curl, server-to-server) have no Origin header.
      if (!origin) return callback(null, true);

      if (allowedOrigins.size === 0) {
        // No allow-list configured: permit only Replit-managed preview hosts.
        if (
          /^https:\/\/[^/]+\.replit\.dev(:\d+)?$/.test(origin) ||
          /^https:\/\/[^/]+\.pike\.repl\.co$/.test(origin)
        ) {
          return callback(null, true);
        }
        logger.warn({ origin }, "CORS request rejected — ALLOWED_ORIGIN not configured");
        return callback(new Error("CORS: origin not allowed"));
      }

      if (allowedOrigins.has(origin)) {
        return callback(null, true);
      }

      logger.warn({ origin }, "CORS request rejected — origin not in allowlist");
      return callback(new Error("CORS: origin not allowed"));
    },
    credentials: true,
  }),
);

// ---------------------------------------------------------------------------
// Rate limiting — applied only to authentication endpoints to prevent
// brute-force and credential-stuffing attacks.
// ---------------------------------------------------------------------------
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15-minute window
  max: 20,                   // max 20 attempts per IP per window
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests, please try again later." },
  skipSuccessfulRequests: false,
});

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(express.json({
  verify(req: Request, _res, buf) {
    req.rawBody = buf;
  },
}));
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter to auth endpoints before the main router.
app.use(
  [
    "/api/v1/auth/login",
    "/api/v1/auth/register",
    "/api/v1/auth/password-reset/request",
    "/api/v1/auth/password-reset",
  ],
  authRateLimiter,
);

app.use("/api", router);

export default app;
