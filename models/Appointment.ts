import { Schema, model, models, type InferSchemaType, type Model, type HydratedDocument } from "mongoose";
import { APPOINTMENT_STATUSES, CURRENCIES, DURATIONS } from "@/lib/constants";

/** Copied at booking time so history stays correct if the service changes (§9.3). */
const ServiceSnapshotSchema = new Schema(
  {
    title: { type: String, required: true },
    durationMinutes: { type: Number, enum: DURATIONS, required: true },
    price: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: CURRENCIES, required: true },
  },
  { _id: false },
);

const AppointmentSchema = new Schema(
  {
    professionalId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    clientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: "Service", required: true },
    serviceSnapshot: { type: ServiceSnapshotSchema, required: true },
    startTime: { type: Date, required: true }, // UTC
    endTime: {
      type: Date,
      required: true,
      validate: {
        validator(this: { startTime?: Date }, end: Date) {
          return !this.startTime || end > this.startTime;
        },
        message: "endTime must be after startTime",
      },
    },
    status: { type: String, enum: APPOINTMENT_STATUSES, required: true, default: "CONFIRMED" },
    notes: { type: String, trim: true, maxlength: 500 },
    cancelledAt: { type: Date },
    cancelledBy: { type: Schema.Types.ObjectId, ref: "User" },
    cancellationReason: { type: String, trim: true, maxlength: 300 },
  },
  { timestamps: true },
);

// §9.5 — availability lookups and the client dashboard
AppointmentSchema.index({ professionalId: 1, startTime: 1 });
AppointmentSchema.index({ clientId: 1, startTime: -1 });

export type AppointmentDoc = InferSchemaType<typeof AppointmentSchema>;
export type AppointmentDocument = HydratedDocument<AppointmentDoc>;

export const Appointment: Model<AppointmentDoc> =
  (models.Appointment as Model<AppointmentDoc>) || model<AppointmentDoc>("Appointment", AppointmentSchema);

export default Appointment;
