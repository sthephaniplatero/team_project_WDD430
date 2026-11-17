import { Schema, model, models, type InferSchemaType, type Model, type HydratedDocument } from "mongoose";
import { CURRENCIES, DURATIONS } from "@/lib/constants";

const ServiceSchema = new Schema(
  {
    professionalId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, minlength: 3, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    durationMinutes: { type: Number, enum: DURATIONS, required: true },
    // Minor unit (cents): 2500 = 25.00
    price: {
      type: Number,
      required: true,
      min: 0,
      validate: { validator: Number.isInteger, message: "price must be an integer (minor unit)" },
    },
    currency: { type: String, enum: CURRENCIES, required: true, default: "USD" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// §9.5
ServiceSchema.index({ professionalId: 1, isActive: 1 });

export type ServiceDoc = InferSchemaType<typeof ServiceSchema>;
export type ServiceDocument = HydratedDocument<ServiceDoc>;

export const Service: Model<ServiceDoc> =
  (models.Service as Model<ServiceDoc>) || model<ServiceDoc>("Service", ServiceSchema);

export default Service;
