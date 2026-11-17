/**
 * Seed the MongoDB database with demo data (SPECIFICATION.md §9.5).
 *
 *   npm run seed
 *
 * WARNING: deletes ALL documents in users, services and appointments, then inserts:
 *   - 2 professionals, 1 client (shared demo password below)
 *   - 4 services (2 per professional)
 *   - appointments covering every dashboard tab (§6.2):
 *       Upcoming  → CONFIRMED in the future
 *       Past      → CONFIRMED in the past + COMPLETED
 *       Cancelled → CANCELLED
 *
 * Appointment dates are relative to "now", so re-run the seed whenever the
 * upcoming ones have become past.
 *
 * Fields mirror models/*.ts — keep them in sync if the schema changes.
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const DEMO_PASSWORD = "Password123!";
const TIMEZONE = "Africa/Nairobi"; // UTC+3 all year (no daylight saving)
const TZ_OFFSET_HOURS = 3;

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("✖ MONGODB_URI is not set. Create .env.local (see .env.example).");
  process.exit(1);
}

const { ObjectId } = mongoose.Types;

/**
 * Returns a UTC Date for `hh:mm` Nairobi time, `daysFromToday` working days (Mon–Fri) away.
 * Negative values go into the past.
 */
function nairobiSlot(daysFromToday, hh, mm = 0) {
  const step = Math.sign(daysFromToday) || 1;
  let remaining = Math.abs(daysFromToday);
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  while (remaining > 0) {
    d.setUTCDate(d.getUTCDate() + step);
    const day = d.getUTCDay();
    if (day !== 0 && day !== 6) remaining--;
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hh - TZ_OFFSET_HOURS, mm));
}

const addMinutes = (date, minutes) => new Date(date.getTime() + minutes * 60_000);

async function main() {
  await mongoose.connect(uri);
  const db = mongoose.connection.db;
  console.log(`→ Connected to database "${db.databaseName}"`);

  const users = db.collection("users");
  const services = db.collection("services");
  const appointments = db.collection("appointments");

  // ---------- Reset ----------
  await Promise.all([users.deleteMany({}), services.deleteMany({}), appointments.deleteMany({})]);
  console.log("→ Cleared users, services, appointments");

  // ---------- Indexes (§9.5, same as the Mongoose models) ----------
  await users.createIndex({ email: 1 }, { unique: true });
  await users.createIndex({ role: 1, "professionalProfile.category": 1 });
  await services.createIndex({ professionalId: 1, isActive: 1 });
  await appointments.createIndex({ professionalId: 1, startTime: 1 });
  await appointments.createIndex({ clientId: 1, startTime: -1 });

  const now = new Date();
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  // ---------- Users ----------
  const amina = {
    _id: new ObjectId(),
    name: "Amina Wanjiru",
    email: "amina@example.com",
    passwordHash,
    role: "PROFESSIONAL",
    phone: "+254712345678",
    professionalProfile: {
      headline: "Math & Physics Tutor",
      bio: "Secondary-school math and physics tutor with 8 years of experience. I help students prepare for exams with clear explanations and practice plans.",
      category: "tutoring",
      location: "Nairobi, Kenya",
      workingDays: [1, 2, 3, 4, 5],
      workingHoursStart: "09:00",
      workingHoursEnd: "17:00",
      timezone: TIMEZONE,
    },
    createdAt: now,
    updatedAt: now,
  };

  const daniel = {
    _id: new ObjectId(),
    name: "Daniel Otieno",
    email: "daniel@example.com",
    passwordHash,
    role: "PROFESSIONAL",
    phone: "+254798765432",
    professionalProfile: {
      headline: "Career & Life Coach",
      bio: "Certified coach helping young professionals set goals, prepare for interviews and build better habits.",
      category: "coaching",
      location: "Mombasa, Kenya",
      workingDays: [1, 2, 3, 4, 5],
      workingHoursStart: "08:00",
      workingHoursEnd: "16:00",
      timezone: TIMEZONE,
    },
    createdAt: now,
    updatedAt: now,
  };

  const client = {
    _id: new ObjectId(),
    name: "Sofia Client",
    email: "client@example.com",
    passwordHash,
    role: "CLIENT",
    createdAt: now,
    updatedAt: now,
  };

  await users.insertMany([amina, daniel, client]);

  // ---------- Services (price in minor units) ----------
  const svc = (professionalId, title, description, durationMinutes, price, currency = "USD") => ({
    _id: new ObjectId(),
    professionalId,
    title,
    description,
    durationMinutes,
    price,
    currency,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  });

  const mathLesson = svc(amina._id, "Math Lesson", "One-to-one algebra, geometry or calculus lesson.", 60, 2500);
  const examPrep = svc(amina._id, "Physics Exam Prep", "Focused revision session before an exam.", 90, 350000, "KES");
  const careerSession = svc(daniel._id, "Career Coaching Session", "Goal setting and career planning.", 45, 4000);
  const interviewPrep = svc(daniel._id, "Mock Interview", "Practice interview with detailed feedback.", 30, 2000);

  await services.insertMany([mathLesson, examPrep, careerSession, interviewPrep]);

  // ---------- Appointments ----------
  const appt = (service, start, status, extra = {}) => ({
    _id: new ObjectId(),
    professionalId: service.professionalId,
    clientId: client._id,
    serviceId: service._id,
    serviceSnapshot: {
      title: service.title,
      durationMinutes: service.durationMinutes,
      price: service.price,
      currency: service.currency,
    },
    startTime: start,
    endTime: addMinutes(start, service.durationMinutes),
    status,
    createdAt: now,
    updatedAt: now,
    ...extra,
  });

  const appointmentDocs = [
    // Upcoming
    appt(mathLesson, nairobiSlot(2, 10), "CONFIRMED", { notes: "Please focus on quadratic equations." }),
    appt(careerSession, nairobiSlot(5, 14), "CONFIRMED"),
    // Past
    appt(interviewPrep, nairobiSlot(-2, 11), "CONFIRMED"),
    appt(examPrep, nairobiSlot(-6, 9), "COMPLETED"),
    appt(careerSession, nairobiSlot(-10, 13), "COMPLETED"),
    // Cancelled
    appt(mathLesson, nairobiSlot(4, 15), "CANCELLED", {
      cancelledAt: now,
      cancelledBy: client._id,
      cancellationReason: "I have a school trip that day.",
    }),
  ];

  await appointments.insertMany(appointmentDocs);

  // ---------- Summary ----------
  const counts = Object.fromEntries(
    APPOINTMENT_STATUSES.map((s) => [s, appointmentDocs.filter((a) => a.status === s).length]),
  );
  console.log(`✔ Inserted 3 users, 4 services, ${appointmentDocs.length} appointments`, counts);
  console.log("\nDemo logins (password for all: " + DEMO_PASSWORD + ")");
  console.table([
    { role: "PROFESSIONAL", email: amina.email, name: amina.name },
    { role: "PROFESSIONAL", email: daniel.email, name: daniel.name },
    { role: "CLIENT", email: client.email, name: client.name },
  ]);
}

const APPOINTMENT_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED", "CANCELLED"];

main()
  .catch((error) => {
    console.error("✖ Seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
