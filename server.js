import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import mongoSanitize from "express-mongo-sanitize";

// Load environment variables FIRST (before using process.env)
dotenv.config();

// Import custom configurations, database connector, routers, and middlewares
import connectDB from "./config/db.js";
import seedAdmin from "./utils/adminSeeder.js";
import seedClubSettings from "./utils/clubSeeder.js";
import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import memberRoutes from "./routes/memberRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import exportRoutes from "./routes/exportRoutes.js";
import communicationRoutes from "./routes/communicationRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

// Resolve paths for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const isProduction = process.env.NODE_ENV === "production";

// ─── Ensure upload directories exist ────────────────────────────────────────
const uploadDirs = [
  path.join(__dirname, "public", "uploads"),
  path.join(__dirname, "public", "uploads", "profiles"),
  path.join(__dirname, "public", "uploads", "excel"),
  path.join(__dirname, "storage", "imports", "previews"),
  path.join(__dirname, "storage", "imports", "reports"),
];
uploadDirs.forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Created directory: ${dir}`);
  }
});

// ─── Security: Helmet (HTTP security headers) ───────────────────────────────
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled so Vite dev / bundled assets work; re-enable for strict production
    crossOriginEmbedderPolicy: false,
  })
);

// ─── Security: CORS ──────────────────────────────────────────────────────────
const rawOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173";
const allowedOrigins = rawOrigins.split(",").map((o) => o.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (server-to-server, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// ─── Rate Limiting ───────────────────────────────────────────────────────────
// Strict limiter for auth endpoints (login, change-password)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please try again after 15 minutes." },
  skip: () => !isProduction, // Only enforce in production
});

// General API limiter (anti-abuse)
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests. Please slow down." },
  skip: () => !isProduction,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// ─── Body Parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" })); // Reduced from 100mb; large Excel uploads use multipart/form-data
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cookieParser());

// ─── Security: NoSQL Injection Prevention ───────────────────────────────────
// Sanitizes body and params to prevent MongoDB operator injection.
// req.query is skipped due to Node's IncomingMessage getter restrictions.
app.use((req, res, next) => {
  if (req.body) mongoSanitize.sanitize(req.body, { replaceWith: "_" });
  if (req.params) mongoSanitize.sanitize(req.params, { replaceWith: "_" });
  next();
});

// ─── Static Assets ───────────────────────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/members", memberRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/communication", communicationRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get("/api/ping", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Lions Club Member Management API is running",
    data: {
      timestamp: new Date(),
      node_env: process.env.NODE_ENV || "development",
    },
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found`,
  });
});

// ─── Centralized Error Handler (MUST be last middleware) ─────────────────────
app.use(errorHandler);

// ─── Start Server ────────────────────────────────────────────────────────────
const startServer = async () => {
  const isConnected = await connectDB();
  if (isConnected) {
    await seedAdmin();
    await seedClubSettings();
  }
  app.listen(PORT, () => {
    console.log(`================================================`);
    console.log(` Server is running on port ${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(` Ping check: http://localhost:${PORT}/api/ping`);
    console.log(`================================================`);
  });
};

startServer();
