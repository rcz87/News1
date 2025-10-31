import express, { type Request, Response, NextFunction } from "express";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cors from "cors";
import dotenv from "dotenv";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Load environment variables
dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// Security Headers - Helmet
app.use(helmet({
  contentSecurityPolicy: isProduction ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for admin panel
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Allow Google Fonts
      fontSrc: ["'self'", "https://fonts.gstatic.com"], // Allow Google Fonts fonts
      imgSrc: ["'self'", "data:", "https:"], // Allow external images
      connectSrc: ["'self'", "https://images.unsplash.com", "https://fonts.googleapis.com", "https://fonts.gstatic.com"], // Allow Unsplash images and Google Fonts
    }
  } : false, // Disable in dev for Vite HMR
  crossOriginEmbedderPolicy: false, // Allow external images
}));

// CORS Configuration - Enhanced for mobile support
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5000', 'http://127.0.0.1:5000'];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (isProduction) {
      // In production, check against allowed origins
      const isAllowed = allowedOrigins.some(allowed => {
        if (allowed.includes('*')) {
          // Support wildcard domains like *.domain.com
          const pattern = allowed.replace('*.', '');
          return origin.endsWith(pattern);
        }
        return origin === allowed;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // In development, allow all origins including mobile
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Length', 'X-Total-Count']
}));

// Rate Limiting - Prevent DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction ? 100 : 1000, // Limit each IP to 100 requests per windowMs in production
  message: 'Terlalu banyak request dari IP ini, silakan coba lagi nanti.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Body parser middleware
declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

app.use(express.json({
  limit: '10mb', // Limit body size
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));

app.use(express.urlencoded({ 
  extended: false,
  limit: '10mb' 
}));

// Request logging middleware
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
      
      // Only log response in development
      if (!isProduction && capturedJsonResponse) {
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
  const server = await registerRoutes(app);

  // Error handling middleware - Enhanced for security
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    
    // In production, don't expose internal error details
    const message = isProduction 
      ? (status === 500 ? "Internal Server Error" : err.message)
      : err.message || "Internal Server Error";

    // Log the full error details server-side
    if (isProduction) {
      console.error('Error:', {
        status,
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      });
    }

    res.status(status).json({ 
      error: message,
      ...(isProduction ? {} : { stack: err.stack })
    });
    
    // Don't throw in production to prevent server crash
    if (!isProduction) {
      throw err;
    }
  });

  // Setup Vite in development or serve static files in production
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Start server
  const port = parseInt(process.env.PORT || '5000', 10);
  const host = process.env.HOST || "0.0.0.0";
  
  // Trust proxy for rate limiting when behind nginx
  app.set('trust proxy', true);
  
  server.listen(port, host, () => {
    log(`🚀 Server running on ${host}:${port}`);
    log(`🔒 Security: ${isProduction ? 'Production Mode' : 'Development Mode'}`);
    log(`🛡️  Rate limiting: ${isProduction ? '100 req/15min' : '1000 req/15min'}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      log('HTTP server closed');
      process.exit(0);
    });
  });
})();
