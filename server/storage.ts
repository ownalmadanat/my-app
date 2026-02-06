import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, desc, sql, like, or } from "drizzle-orm";
import pg from "pg";
import * as schema from "@shared/schema";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

export interface IStorage {
  getUserByEmail(email: string): Promise<schema.User | undefined>;
  getUserById(id: string): Promise<schema.User | undefined>;
  getUserByQRCode(qrCodeValue: string): Promise<schema.User | undefined>;
  createUser(email: string, name: string, role: string, passwordHash: string): Promise<schema.User>;
  updateUserPassword(id: string, passwordHash: string): Promise<void>;
  checkInUser(id: string): Promise<void>;
  getAllUsers(): Promise<schema.User[]>;
  getStats(): Promise<{ totalRegistered: number; checkedIn: number; pending: number; attendeeCount: number; staffCount: number }>;
  getRecentCheckIns(limit?: number): Promise<Array<{ id: string; name: string; email: string; checkedInAt: string }>>;
  getSessions(): Promise<Array<schema.Session & { speakerName?: string }>>;
  getSpeakers(): Promise<schema.Speaker[]>;
  getNotifications(role?: string): Promise<schema.Notification[]>;
  getSavedSessions(userId: string): Promise<string[]>;
  saveSession(userId: string, sessionId: string): Promise<void>;
  unsaveSession(userId: string, sessionId: string): Promise<void>;
  getCompanies(): Promise<schema.Company[]>;
  getCompanyById(id: string): Promise<schema.Company | undefined>;
  getCompanyByQRCode(qrJoinCode: string): Promise<schema.Company | undefined>;
  joinCompany(userId: string, companyId: string): Promise<void>;
  getUserCompanies(userId: string): Promise<schema.Company[]>;
  seedData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.email, email.toLowerCase()));
    return user;
  }

  async getUserById(id: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.id, id));
    return user;
  }

  async getUserByQRCode(qrCodeValue: string): Promise<schema.User | undefined> {
    const [user] = await db.select().from(schema.users).where(eq(schema.users.qrCodeValue, qrCodeValue));
    return user;
  }

  async createUser(email: string, name: string, role: string, passwordHash: string): Promise<schema.User> {
    const crypto = await import("crypto");
    const qrCodeValue = `SC2026-${crypto.randomUUID()}`;
    const [user] = await db.insert(schema.users).values({
      email: email.toLowerCase(),
      name,
      role,
      qrCodeValue,
      passwordHash,
    }).returning();
    return user;
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<void> {
    await db.update(schema.users).set({ passwordHash }).where(eq(schema.users.id, id));
  }

  async checkInUser(id: string): Promise<void> {
    await db.update(schema.users).set({ checkedIn: true, checkedInAt: new Date() }).where(eq(schema.users.id, id));
  }

  async getAllUsers(): Promise<schema.User[]> {
    return db.select().from(schema.users).orderBy(schema.users.name);
  }

  async getStats(): Promise<{ totalRegistered: number; checkedIn: number; pending: number; attendeeCount: number; staffCount: number }> {
    const users = await db.select().from(schema.users);
    const totalRegistered = users.length;
    const checkedIn = users.filter((u) => u.checkedIn).length;
    const pending = totalRegistered - checkedIn;
    const attendeeCount = users.filter((u) => u.role === "attendee").length;
    const staffCount = users.filter((u) => u.role === "staff").length;
    return { totalRegistered, checkedIn, pending, attendeeCount, staffCount };
  }

  async getRecentCheckIns(limit = 10): Promise<Array<{ id: string; name: string; email: string; checkedInAt: string }>> {
    const users = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.checkedIn, true))
      .orderBy(desc(schema.users.checkedInAt))
      .limit(limit);
    
    return users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      checkedInAt: u.checkedInAt?.toISOString() || new Date().toISOString(),
    }));
  }

  async getSessions(): Promise<Array<schema.Session & { speakerName?: string }>> {
    const sessions = await db
      .select({
        id: schema.sessions.id,
        title: schema.sessions.title,
        description: schema.sessions.description,
        speakerId: schema.sessions.speakerId,
        startTime: schema.sessions.startTime,
        endTime: schema.sessions.endTime,
        location: schema.sessions.location,
        track: schema.sessions.track,
        day: schema.sessions.day,
        speakerName: schema.speakers.name,
      })
      .from(schema.sessions)
      .leftJoin(schema.speakers, eq(schema.sessions.speakerId, schema.speakers.id))
      .orderBy(schema.sessions.startTime);
    
    return sessions;
  }

  async getSpeakers(): Promise<schema.Speaker[]> {
    return db.select().from(schema.speakers).orderBy(schema.speakers.name);
  }

  async getNotifications(role?: string): Promise<schema.Notification[]> {
    if (role) {
      return db
        .select()
        .from(schema.notifications)
        .where(or(eq(schema.notifications.targetRole, role), sql`${schema.notifications.targetRole} IS NULL`))
        .orderBy(desc(schema.notifications.createdAt));
    }
    return db.select().from(schema.notifications).orderBy(desc(schema.notifications.createdAt));
  }

  async getSavedSessions(userId: string): Promise<string[]> {
    const saved = await db
      .select({ sessionId: schema.savedSessions.sessionId })
      .from(schema.savedSessions)
      .where(eq(schema.savedSessions.userId, userId));
    return saved.map((s) => s.sessionId);
  }

  async saveSession(userId: string, sessionId: string): Promise<void> {
    await db.insert(schema.savedSessions).values({ userId, sessionId }).onConflictDoNothing();
  }

  async unsaveSession(userId: string, sessionId: string): Promise<void> {
    await db
      .delete(schema.savedSessions)
      .where(and(eq(schema.savedSessions.userId, userId), eq(schema.savedSessions.sessionId, sessionId)));
  }

  async getCompanies(): Promise<schema.Company[]> {
    return db.select().from(schema.companies).orderBy(schema.companies.category, schema.companies.name);
  }

  async getCompanyById(id: string): Promise<schema.Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.id, id));
    return company;
  }

  async getCompanyByQRCode(qrJoinCode: string): Promise<schema.Company | undefined> {
    const [company] = await db.select().from(schema.companies).where(eq(schema.companies.qrJoinCode, qrJoinCode));
    return company;
  }

  async joinCompany(userId: string, companyId: string): Promise<void> {
    await db.insert(schema.companyMemberships).values({ userId, companyId }).onConflictDoNothing();
  }

  async getUserCompanies(userId: string): Promise<schema.Company[]> {
    const memberships = await db
      .select({ company: schema.companies })
      .from(schema.companyMemberships)
      .innerJoin(schema.companies, eq(schema.companyMemberships.companyId, schema.companies.id))
      .where(eq(schema.companyMemberships.userId, userId));
    return memberships.map(m => m.company);
  }

  async seedData(): Promise<void> {
    const existingUsers = await db.select().from(schema.users).limit(1);
    if (existingUsers.length > 0) {
      console.log("Database already seeded");
      return;
    }

    console.log("Seeding database...");

    const sampleUsers = [
      { email: "john.doe@example.com", name: "John Doe", role: "attendee", qrCodeValue: "SC2026-ATT-001" },
      { email: "jane.smith@example.com", name: "Jane Smith", role: "attendee", qrCodeValue: "SC2026-ATT-002" },
      { email: "michael.johnson@example.com", name: "Michael Johnson", role: "attendee", qrCodeValue: "SC2026-ATT-003" },
      { email: "sarah.williams@example.com", name: "Sarah Williams", role: "attendee", qrCodeValue: "SC2026-ATT-004" },
      { email: "david.brown@example.com", name: "David Brown", role: "attendee", qrCodeValue: "SC2026-ATT-005" },
      { email: "emily.davis@example.com", name: "Emily Davis", role: "attendee", qrCodeValue: "SC2026-ATT-006" },
      { email: "robert.miller@example.com", name: "Robert Miller", role: "attendee", qrCodeValue: "SC2026-ATT-007" },
      { email: "jennifer.wilson@example.com", name: "Jennifer Wilson", role: "attendee", qrCodeValue: "SC2026-ATT-008" },
      { email: "staff@stresscongress.org", name: "Staff Member", role: "staff", qrCodeValue: "SC2026-STAFF-001" },
      { email: "admin@stresscongress.org", name: "Admin User", role: "staff", qrCodeValue: "SC2026-STAFF-002" },
    ];

    await db.insert(schema.users).values(sampleUsers);

    const sampleSpeakers = [
      { name: "Dr. Amanda Chen", title: "Professor of Psychology", company: "Stanford University", bio: "Leading researcher in stress management and cognitive behavioral therapy with over 20 years of experience." },
      { name: "Dr. James Mitchell", title: "Chief Medical Officer", company: "MindWell Health", bio: "Pioneer in integrative medicine approaches for stress-related disorders." },
      { name: "Prof. Maria Rodriguez", title: "Neuroscience Chair", company: "MIT", bio: "Renowned expert on the neurological effects of chronic stress." },
      { name: "Dr. Thomas Anderson", title: "Clinical Director", company: "Wellness Institute", bio: "Specialist in workplace stress reduction programs." },
    ];

    const insertedSpeakers = await db.insert(schema.speakers).values(sampleSpeakers).returning();

    const eventDate = new Date("2026-03-03T08:00:00");
    const sampleSessions = [
      {
        title: "Opening Keynote: The Future of Stress Research",
        description: "Join us for an inspiring opening session exploring cutting-edge developments in stress science.",
        speakerId: insertedSpeakers[0].id,
        startTime: new Date(eventDate.getTime()),
        endTime: new Date(eventDate.getTime() + 60 * 60 * 1000),
        location: "Main Hall A",
        track: "Keynote",
        day: 1,
      },
      {
        title: "Neurological Pathways of Chronic Stress",
        description: "Deep dive into how chronic stress affects brain structure and function.",
        speakerId: insertedSpeakers[2].id,
        startTime: new Date(eventDate.getTime() + 90 * 60 * 1000),
        endTime: new Date(eventDate.getTime() + 150 * 60 * 1000),
        location: "Room B2",
        track: "Research",
        day: 1,
      },
      {
        title: "Workplace Wellness Programs That Work",
        description: "Evidence-based strategies for implementing effective stress reduction in corporate settings.",
        speakerId: insertedSpeakers[3].id,
        startTime: new Date(eventDate.getTime() + 180 * 60 * 1000),
        endTime: new Date(eventDate.getTime() + 240 * 60 * 1000),
        location: "Room C1",
        track: "Applied",
        day: 1,
      },
      {
        title: "Panel Discussion: Integrative Approaches",
        description: "Leading experts discuss combining traditional and modern stress management techniques.",
        speakerId: insertedSpeakers[1].id,
        startTime: new Date(eventDate.getTime() + 270 * 60 * 1000),
        endTime: new Date(eventDate.getTime() + 330 * 60 * 1000),
        location: "Main Hall A",
        track: "Panel",
        day: 1,
      },
    ];

    await db.insert(schema.sessions).values(sampleSessions);

    const sampleNotifications = [
      { title: "Welcome to Stress Congress 2026!", message: "We're excited to have you join us for this groundbreaking event.", type: "announcement" },
      { title: "Event Location Update", message: "The main hall entrance has been moved to the east side of the building.", type: "alert" },
      { title: "Networking Dinner Tonight", message: "Don't forget to join us at 7 PM for the networking dinner at the Grand Ballroom.", type: "reminder" },
    ];

    await db.insert(schema.notifications).values(sampleNotifications);

    const companies = [
      { name: "BDO", category: "Accounting / Audit / Advisory", description: "Global network providing audit, tax, and advisory services to businesses worldwide.", isSpecialPartner: false },
      { name: "EY (Ernst & Young)", category: "Accounting / Audit / Advisory", description: "One of the Big Four professional services firms offering assurance, tax, consulting and strategy services.", isSpecialPartner: false },
      { name: "Moore MKW", category: "Accounting / Audit / Advisory", description: "Professional accounting and advisory services firm with a focus on medium-sized enterprises.", isSpecialPartner: false },
      { name: "Eshuis", category: "Accounting / Audit / Advisory", description: "Regional accounting firm providing personalized financial services and business advice.", isSpecialPartner: false },
      { name: "MitH Management", category: "Consulting / Finance / Strategy", description: "Strategic management consulting firm specializing in organizational transformation and leadership development.", isSpecialPartner: true, qrJoinCode: "SC2026-COMPANY-MITH" },
      { name: "Robert Muntel", category: "Consulting / Finance / Strategy", description: "Independent consulting practice focused on finance strategy and risk management.", isSpecialPartner: false },
      { name: "Appelboom Consultancy", category: "Consulting / Finance / Strategy", description: "Boutique consultancy specializing in business process optimization and digital transformation.", isSpecialPartner: false },
      { name: "Capgemini", category: "Consulting / Finance / Strategy", description: "Global leader in consulting, technology services, and digital transformation.", isSpecialPartner: true, qrJoinCode: "SC2026-COMPANY-CAPGEMINI" },
      { name: "Nedap", category: "Technology / Engineering / Industrial", description: "Technology company creating intelligent solutions for healthcare, security, and retail sectors.", isSpecialPartner: false },
      { name: "Actemium", category: "Technology / Engineering / Industrial", description: "Industrial process automation and electrical engineering solutions provider.", isSpecialPartner: false },
      { name: "Witteveen + Bos", category: "Technology / Engineering / Industrial", description: "Engineering and consultancy company focused on water, infrastructure, environment and construction.", isSpecialPartner: true, qrJoinCode: "SC2026-COMPANY-WITTEVEEN" },
      { name: "Eaton", category: "Technology / Engineering / Industrial", description: "Power management company providing energy-efficient solutions for electrical systems.", isSpecialPartner: false },
      { name: "Port of Twente", category: "Logistics / Transport / Infrastructure", description: "Inland port and multimodal logistics hub connecting European transportation networks.", isSpecialPartner: true, qrJoinCode: "SC2026-COMPANY-PORTTWENTE" },
      { name: "Cargill", category: "Logistics / Transport / Infrastructure", description: "Global food and agriculture company providing food, agricultural, financial and industrial products.", isSpecialPartner: true, qrJoinCode: "SC2026-COMPANY-CARGILL" },
      { name: "Achmea", category: "Insurance / Risk Services", description: "Leading Dutch insurance company offering health, life, and property insurance solutions.", isSpecialPartner: true, qrJoinCode: "SC2026-COMPANY-ACHMEA" },
      { name: "Bolk Transport", category: "Logistics / Transport / Infrastructure", description: "Specialized heavy transport and logistics company for exceptional cargo.", isSpecialPartner: false },
      { name: "Nijhof Wassink", category: "Logistics / Transport / Infrastructure", description: "International transport and logistics company with comprehensive supply chain solutions.", isSpecialPartner: false },
      { name: "E. van Wijk", category: "Logistics / Transport / Infrastructure", description: "Established transport company specializing in container and bulk logistics.", isSpecialPartner: false },
      { name: "CAPE", category: "Logistics / Transport / Infrastructure", description: "Innovative logistics solutions provider with focus on sustainable transport.", isSpecialPartner: false },
      { name: "AON", category: "Insurance / Risk Services", description: "Global professional services firm providing risk, retirement and health solutions.", isSpecialPartner: false },
    ];

    await db.insert(schema.companies).values(companies);

    console.log("Database seeded successfully!");
  }
}

export const storage = new DatabaseStorage();
