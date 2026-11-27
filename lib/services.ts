import "server-only";
import { Types } from "mongoose";
import { ApiError } from "@/lib/api-response";
import type { Currency, DurationMinutes } from "@/lib/constants";
import { connectDB } from "@/lib/db";
import { Service, type ServiceDocument } from "@/models/Service";

/** Plain, serializable service (safe to return from the API or pass to Client Components). */
export type ServiceDTO = {
  id: string;
  title: string;
  description: string;
  durationMinutes: DurationMinutes;
  price: number; // minor units
  currency: Currency;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type ServiceLike = {
  _id: Types.ObjectId;
  title: string;
  description?: string | null;
  durationMinutes: number;
  price: number;
  currency: string;
  isActive?: boolean | null;
  createdAt: Date;
  updatedAt: Date;
};

export function toServiceDTO(service: ServiceLike): ServiceDTO {
  return {
    id: service._id.toString(),
    title: service.title,
    description: service.description ?? "",
    durationMinutes: service.durationMinutes as DurationMinutes,
    price: service.price,
    currency: service.currency as Currency,
    isActive: service.isActive ?? true,
    createdAt: service.createdAt.toISOString(),
    updatedAt: service.updatedAt.toISOString(),
  };
}

/** All of a professional's services, active and archived, active first then newest first. */
export async function listServicesByProfessional(professionalId: string): Promise<ServiceDTO[]> {
  await connectDB();
  const services = await Service.find({ professionalId: new Types.ObjectId(professionalId) })
    .sort({ isActive: -1, createdAt: -1 })
    .lean<ServiceLike[]>();
  return services.map(toServiceDTO);
}

/**
 * Loads a service the signed-in professional is about to change.
 * 404 when the id is malformed or doesn't exist, 403 when someone else owns it
 * (SPECIFICATION.md §6.3, US2).
 */
export async function findOwnedService(id: string, professionalId: string): Promise<ServiceDocument> {
  if (!Types.ObjectId.isValid(id)) {
    throw new ApiError("NOT_FOUND", "Service not found");
  }
  await connectDB();
  const service = await Service.findById(id);
  if (!service) {
    throw new ApiError("NOT_FOUND", "Service not found");
  }
  if (!service.professionalId.equals(professionalId)) {
    throw new ApiError("FORBIDDEN", "You can only change your own services");
  }
  return service;
}
