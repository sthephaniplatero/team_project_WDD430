import "server-only";
import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { PROFESSIONAL_PROFILE_DEFAULTS, type AppointmentStatus, type Currency } from "@/lib/constants";
import { Appointment } from "@/models/Appointment";
// Registers the User model so populate() works even if nothing else imported it yet.
import "@/models/User";

/** Statuses that count as "upcoming" when startTime ≥ now (SPECIFICATION.md §6.2). */
const UPCOMING_STATUSES: AppointmentStatus[] = ["PENDING", "CONFIRMED"];

/** Plain, serializable appointment for the dashboard (safe to pass to Client Components). */
export type AppointmentSummary = {
  id: string;
  serviceTitle: string;
  durationMinutes: number;
  price: number;
  currency: Currency;
  startTime: string; // ISO, UTC
  endTime: string; // ISO, UTC
  status: AppointmentStatus;
  /** The other party: the client for a professional, the professional for a client. */
  otherPartyName: string;
  /** Times are shown in the professional's time zone (SPECIFICATION.md §6.1). */
  timezone: string;
};

type PopulatedParty = {
  _id: Types.ObjectId;
  name: string;
  professionalProfile?: { timezone?: string };
};

type PopulatedAppointment = {
  _id: Types.ObjectId;
  serviceSnapshot: { title: string; durationMinutes: number; price: number; currency: Currency };
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  professionalId: PopulatedParty | null;
  clientId: PopulatedParty | null;
};

/**
 * The signed-in user's next upcoming appointments, soonest first.
 * The user always comes from the session, never from an argument, so a caller
 * can't read someone else's appointments.
 */
export async function getUpcomingAppointments(limit = 3): Promise<AppointmentSummary[]> {
  const user = await getCurrentUser();
  const isProfessional = user.role === "PROFESSIONAL";
  const ownerField = isProfessional ? "professionalId" : "clientId";

  await connectDB();
  const docs = await Appointment.find({
    [ownerField]: new Types.ObjectId(user.id),
    status: { $in: UPCOMING_STATUSES },
    startTime: { $gte: new Date() },
  })
    .sort({ startTime: 1 })
    .limit(limit)
    .populate("professionalId", "name professionalProfile.timezone")
    .populate("clientId", "name")
    .lean<PopulatedAppointment[]>();

  return docs.map((doc) => {
    const otherParty = isProfessional ? doc.clientId : doc.professionalId;
    return {
      id: doc._id.toString(),
      serviceTitle: doc.serviceSnapshot.title,
      durationMinutes: doc.serviceSnapshot.durationMinutes,
      price: doc.serviceSnapshot.price,
      currency: doc.serviceSnapshot.currency,
      startTime: doc.startTime.toISOString(),
      endTime: doc.endTime.toISOString(),
      status: doc.status,
      otherPartyName: otherParty?.name ?? "Deleted user",
      timezone:
        doc.professionalId?.professionalProfile?.timezone ?? PROFESSIONAL_PROFILE_DEFAULTS.timezone,
    };
  });
}
