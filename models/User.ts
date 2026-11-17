import { Schema, model, models, type InferSchemaType, type Model, type HydratedDocument } from "mongoose";
import { CATEGORIES, PROFESSIONAL_PROFILE_DEFAULTS as D, ROLES, TIME_HHMM_REGEX } from "@/lib/constants";

/** Embedded profile, present only when role = 'PROFESSIONAL' (§9.1). */
const ProfessionalProfileSchema = new Schema(
  {
    headline: { type: String, trim: true, maxlength: 80, default: D.headline },
    bio: { type: String, trim: true, maxlength: 1000, default: D.bio },
    category: { type: String, enum: CATEGORIES, required: true, default: D.category },
    location: { type: String, trim: true, maxlength: 120 },
    workingDays: {
      type: [{ type: Number, min: 0, max: 6 }],
      default: () => [...D.workingDays],
    },
    workingHoursStart: { type: String, match: TIME_HHMM_REGEX, required: true, default: D.workingHoursStart },
    workingHoursEnd: {
      type: String,
      match: TIME_HHMM_REGEX,
      required: true,
      default: D.workingHoursEnd,
      validate: {
        // "HH:mm" strings compare correctly as text
        validator(this: { workingHoursStart?: string }, end: string) {
          return !this.workingHoursStart || end > this.workingHoursStart;
        },
        message: "workingHoursEnd must be after workingHoursStart",
      },
    },
    timezone: { type: String, required: true, default: D.timezone },
  },
  { _id: false },
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    image: { type: String, trim: true },
    phone: { type: String, trim: true, match: /^\+[1-9]\d{6,14}$/ },
    professionalProfile: { type: ProfessionalProfileSchema, required: false },
  },
  { timestamps: true },
);

// §9.5 — unique email is declared on the field; browse index:
UserSchema.index({ role: 1, "professionalProfile.category": 1 });

export type UserDoc = InferSchemaType<typeof UserSchema>;
export type ProfessionalProfile = InferSchemaType<typeof ProfessionalProfileSchema>;
export type UserDocument = HydratedDocument<UserDoc>;

export const User: Model<UserDoc> = (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);

export default User;
