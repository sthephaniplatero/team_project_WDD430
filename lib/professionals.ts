import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import { Service } from "@/models/Service";
import { User } from "@/models/User";

export type PublicProfessional = {
  id: string;
  name: string;
  image: string | null;
  phone: string | null;
  profile: {
    headline: string;
    bio: string;
    category: string;
    location: string | null;
    workingDays: number[];
    workingHoursStart: string;
    workingHoursEnd: string;
    timezone: string;
  };
  services: {
    serviceId: string;
    title: string;
    description: string;
    durationMinutes: number;
    price: number;
    currency: "USD" | "KES";
    isActive: true;
  }[];
};

export async function getProfessionalProfile(
  id: string,
): Promise<PublicProfessional | null> {
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return null;
  }

  await connectToDatabase();

  const professional = await User.findOne({
    _id: new Types.ObjectId(id),
    role: "PROFESSIONAL",
  })
    .select("name image phone professionalProfile")
    .lean()
    .exec();

  if (!professional?.professionalProfile) {
    return null;
  }

  const services = await Service.find({
    professionalId: professional._id,
    isActive: true,
  })
    .select("title description durationMinutes price currency isActive")
    .lean()
    .exec();

  const profile = professional.professionalProfile;
  return {
    id: professional._id.toString(),
    name: professional.name,
    image: professional.image ?? null,
    phone: professional.phone ?? null,
    profile: {
      headline: profile.headline,
      bio: profile.bio,
      category: profile.category,
      location: profile.location ?? null,
      workingDays: profile.workingDays,
      workingHoursStart: profile.workingHoursStart,
      workingHoursEnd: profile.workingHoursEnd,
      timezone: profile.timezone,
    },
    services: services.map((service) => ({
      serviceId: service._id.toString(),
      title: service.title,
      description: service.description,
      durationMinutes: service.durationMinutes,
      price: service.price,
      currency: service.currency,
      isActive: true,
    })),
  };
}
