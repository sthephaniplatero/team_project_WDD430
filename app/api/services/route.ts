import { created, handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { listServicesByProfessional, toServiceDTO } from "@/lib/services";
import { serviceSchema } from "@/lib/validations/service";
import { Service } from "@/models/Service";

/**
 * GET /api/services — professional
 * 200 { data: ServiceDTO[] } — their own services, active and archived
 * 401 signed out | 403 client
 */
export async function GET() {
  try {
    const user = await requireRole("PROFESSIONAL");
    return ok(await listServicesByProfessional(user.id));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/services — professional
 * Body: { title, description?, durationMinutes, price (minor units), currency? }
 * 201 { data: ServiceDTO } | 400 validation | 401 signed out | 403 client
 */
export async function POST(request: Request) {
  try {
    const user = await requireRole("PROFESSIONAL");
    const input = serviceSchema.parse(await request.json());

    await connectDB();
    const service = await Service.create({
      title: input.title,
      description: input.description,
      durationMinutes: input.durationMinutes,
      price: input.price,
      currency: input.currency,
      // The owner always comes from the session, never from the body.
      professionalId: user.id,
      isActive: true,
    });

    return created(toServiceDTO(service));
  } catch (error) {
    return handleApiError(error);
  }
}
