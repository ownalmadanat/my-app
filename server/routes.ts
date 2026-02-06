import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { storage } from "./storage";

const JWT_SECRET = process.env.SESSION_SECRET || "stress-congress-2026-secret-key";

interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

function generateToken(user: { id: string; email: string; role: string }): string {
  return jwt.sign({ userId: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

function authMiddleware(req: Request, res: Response, next: Function) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const payload = verifyToken(token);
  if (!payload) {
    return res.status(401).json({ message: "Invalid token" });
  }

  (req as any).userId = payload.userId;
  (req as any).userRole = payload.role;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  await storage.seedData();

  app.post("/api/auth/login", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());

      if (!user) {
        return res.status(404).json({ message: "You are not registered for Stress Congress 2026" });
      }

      if (!user.passwordHash) {
        return res.status(202).json({ needsPassword: true, message: "Please create a password" });
      }

      if (!password) {
        return res.status(400).json({ message: "Password is required" });
      }

      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid password" });
      }

      const token = generateToken(user);
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          qrCodeValue: user.qrCodeValue,
          checkedIn: user.checkedIn,
        },
      });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/register", async (req: Request, res: Response) => {
    try {
      const { email, name, password, role } = req.body;

      if (!email || !name || !password) {
        return res.status(400).json({ message: "Email, name, and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const validRoles = ["attendee", "staff"];
      const userRole = validRoles.includes(role) ? role : "attendee";

      const existingUser = await storage.getUserByEmail(email.toLowerCase());
      if (existingUser) {
        return res.status(409).json({ message: "An account with this email already exists. Please sign in instead." });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser(email.toLowerCase(), name, userRole, passwordHash);

      const token = generateToken(user);
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          qrCodeValue: user.qrCodeValue,
          checkedIn: user.checkedIn,
        },
      });
    } catch (error) {
      console.error("Register error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/set-password", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required" });
      }

      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      if (user.passwordHash) {
        return res.status(400).json({ message: "Password already set" });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      await storage.updateUserPassword(user.id, passwordHash);

      const token = generateToken(user);
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          qrCodeValue: user.qrCodeValue,
          checkedIn: user.checkedIn,
        },
      });
    } catch (error) {
      console.error("Set password error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/auth/reset-password", async (req: Request, res: Response) => {
    try {
      const { email, newPassword } = req.body;

      if (!email || !newPassword) {
        return res.status(400).json({ message: "Email and new password are required" });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const user = await storage.getUserByEmail(email.toLowerCase());

      if (!user) {
        return res.status(404).json({ message: "No account found with this email" });
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await storage.updateUserPassword(user.id, passwordHash);

      const token = generateToken(user);
      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          qrCodeValue: user.qrCodeValue,
          checkedIn: user.checkedIn,
        },
      });
    } catch (error) {
      console.error("Reset password error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/auth/me", authMiddleware, async (req: Request, res: Response) => {
    try {
      const user = await storage.getUserById((req as any).userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      return res.json({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        qrCodeValue: user.qrCodeValue,
        checkedIn: user.checkedIn,
      });
    } catch (error) {
      console.error("Get user error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/check-in", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { qrCodeValue } = req.body;

      if (!qrCodeValue) {
        return res.status(400).json({ success: false, message: "QR code value is required" });
      }

      const user = await storage.getUserByQRCode(qrCodeValue);

      if (!user) {
        return res.status(404).json({ success: false, message: "Attendee not found" });
      }

      if (user.checkedIn) {
        return res.json({
          success: false,
          alreadyCheckedIn: true,
          user: { name: user.name, email: user.email },
          message: "Attendee already checked in",
        });
      }

      await storage.checkInUser(user.id);

      return res.json({
        success: true,
        user: { name: user.name, email: user.email },
        message: "Check-in successful",
      });
    } catch (error) {
      console.error("Check-in error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/manual-check-in", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "Attendee not found" });
      }

      if (user.checkedIn) {
        return res.status(400).json({ success: false, message: "Attendee already checked in" });
      }

      await storage.checkInUser(user.id);

      return res.json({
        success: true,
        user: { name: user.name, email: user.email },
        message: "Check-in successful",
      });
    } catch (error) {
      console.error("Manual check-in error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.post("/api/check-out", authMiddleware, async (req: Request, res: Response) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({ success: false, message: "User ID is required" });
      }

      const user = await storage.getUserById(userId);

      if (!user) {
        return res.status(404).json({ success: false, message: "Attendee not found" });
      }

      if (!user.checkedIn) {
        return res.status(400).json({ success: false, message: "Attendee is not checked in" });
      }

      await storage.checkOutUser(user.id);

      return res.json({
        success: true,
        user: { name: user.name, email: user.email },
        message: "Check-out successful",
      });
    } catch (error) {
      console.error("Check-out error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/stats", authMiddleware, async (req: Request, res: Response) => {
    try {
      const stats = await storage.getStats();
      return res.json(stats);
    } catch (error) {
      console.error("Get stats error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/recent-checkins", authMiddleware, async (req: Request, res: Response) => {
    try {
      const checkIns = await storage.getRecentCheckIns(10);
      return res.json(checkIns);
    } catch (error) {
      console.error("Get recent check-ins error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/attendees", authMiddleware, async (req: Request, res: Response) => {
    try {
      const users = await storage.getAllUsers();
      return res.json(
        users.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role,
          checkedIn: u.checkedIn,
        }))
      );
    } catch (error) {
      console.error("Get attendees error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/sessions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const sessions = await storage.getSessions();
      return res.json(sessions);
    } catch (error) {
      console.error("Get sessions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/speakers", authMiddleware, async (req: Request, res: Response) => {
    try {
      const speakers = await storage.getSpeakers();
      return res.json(speakers);
    } catch (error) {
      console.error("Get speakers error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/notifications", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userRole = (req as any).userRole;
      const notifications = await storage.getNotifications(userRole);
      return res.json(notifications);
    } catch (error) {
      console.error("Get notifications error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/saved-sessions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const savedIds = await storage.getSavedSessions(userId);
      return res.json(savedIds);
    } catch (error) {
      console.error("Get saved sessions error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/saved-sessions", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { sessionId } = req.body;

      if (!sessionId) {
        return res.status(400).json({ message: "Session ID is required" });
      }

      await storage.saveSession(userId, sessionId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Save session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete("/api/saved-sessions/:sessionId", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const sessionId = req.params.sessionId as string;

      await storage.unsaveSession(userId, sessionId);
      return res.json({ success: true });
    } catch (error) {
      console.error("Unsave session error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/companies", authMiddleware, async (req: Request, res: Response) => {
    try {
      const companies = await storage.getCompanies();
      return res.json(companies);
    } catch (error) {
      console.error("Get companies error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get("/api/companies/:id", authMiddleware, async (req: Request, res: Response) => {
    try {
      const id = req.params.id as string;
      const company = await storage.getCompanyById(id);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
      
      return res.json(company);
    } catch (error) {
      console.error("Get company error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post("/api/company/join-via-qr", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const { qrJoinCode } = req.body;

      if (!qrJoinCode) {
        return res.status(400).json({ success: false, message: "QR code is required" });
      }

      const company = await storage.getCompanyByQRCode(qrJoinCode);

      if (!company) {
        return res.status(404).json({ success: false, message: "Company not found" });
      }

      if (!company.isSpecialPartner) {
        return res.status(400).json({ success: false, message: "This company does not have private access" });
      }

      await storage.joinCompany(userId, company.id);

      return res.json({
        success: true,
        company: {
          id: company.id,
          name: company.name,
          category: company.category,
        },
        message: `Successfully joined ${company.name}`,
      });
    } catch (error) {
      console.error("Join company error:", error);
      return res.status(500).json({ success: false, message: "Internal server error" });
    }
  });

  app.get("/api/user/companies", authMiddleware, async (req: Request, res: Response) => {
    try {
      const userId = (req as any).userId;
      const companies = await storage.getUserCompanies(userId);
      return res.json(companies);
    } catch (error) {
      console.error("Get user companies error:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
