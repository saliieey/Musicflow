import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config } from "../config";
import { testConnection } from "./database.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test database connection first
  log("🔌 Testing database connection...");
  const dbConnected = await testConnection();
  
  if (!dbConnected) {
    log("⚠️  Warning: Database connection failed. App will continue with limited functionality.");
    log("💡 Make sure PostgreSQL is running and credentials are correct in config.js");
  } else {
    log("✅ Database connected successfully!");
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = config.PORT;
  server.listen(Number(port), "0.0.0.0", () => {
    log(`🚀 MusicFlow server running on port ${port}`);
    log(`🌐 Frontend: http://localhost:${port}`);
    log(`🔌 API: http://localhost:${port}/api`);
    
      // Show a safe summary of the database connection for demonstration
      const mask = (value?: string | number) => {
        if (value === undefined || value === null) return "(not set)";
        const s = String(value);
        if (s.length <= 4) return "****";
        return "*".repeat(Math.max(0, s.length - 4)) + s.slice(-4);
      };

      const maskDatabaseUrl = (url?: string) => {
        if (!url) return "(not set)";
        try {
          // try to parse a postgres URL and mask the password
          const parsed = new URL(url);
          if (parsed.password) parsed.password = mask(parsed.password);
          // hide long query strings
          parsed.search = parsed.search ? "?…" : "";
          return parsed.toString();
        } catch (e) {
          return mask(url);
        }
      };

      const dbSummary = [
        `   Host: ${config.DB_HOST}`,
        `   Port: ${config.DB_PORT}`,
        `   Name: ${config.DB_NAME}`,
        `   User: ${config.DB_USER}`,
        `   Password: ${mask(config.DB_PASSWORD)}`,
        `   URL: ${maskDatabaseUrl(config.DATABASE_URL)}`,
      ].join("\n");

      log("📋 Database details (sensitive values masked):\n" + dbSummary);
    if (dbConnected) {
      log(`💾 Database: Connected to PostgreSQL`);
    } else {
      log(`⚠️  Database: Not connected - using fallback storage`);
    }
  });
})();
