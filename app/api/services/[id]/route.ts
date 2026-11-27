import { handleApiError, ok } from "@/lib/api-response";
import { requireRole } from "@/lib/auth";
import { findOwnedService, toServiceDTO } from "@/lib/services";
import { serviceSchema } from "@/lib/validations/service";
import { Appointment } from "@/models/Appointment";

/**
 * PUT /api/services/:id — owner professional
 * Body: same as POST, plus optional isActive (to restore an archived service).
 * Existing appointments keep their serviceSnapshot, so their price/title don't change.
 * 200 { data: ServiceDTO } | 400 validation | 401 | 403 not the owner / client | 404
 */
export async function PUT(request: Request, ctx: RouteContext<"/api/services/[id]">) {
  try {
    const user = await requireRole("PROFESSIONAL");
    const { id } = await ctx.params;
    const input = serviceSchema.parse(await request.json());
    const service = await findOwnedService(id, user.id);

    service.set({
      title: input.title,
      description: input.description,
      durationMinutes: input.durationMinutes,
      price: input.price,
      currency: input.currency,
      ...(input.isActive !== undefined && { isActive: input.isActive }),
    });
    await service.save();

    return ok(toServiceDTO(service));
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * DELETE /api/services/:id — owner professional
 * Deletes the service, or archives it (isActive: false) when any appointment
 * references it, so booking history stays intact (SPECIFICATION.md §10, US2).
 * 200 { data: { id, result: "deleted" | "archived" } } | 401 | 403 | 404
 */
export async function DELETE(_request: Request, ctx: RouteContext<"/api/services/[id]">) {
  try {
    const user = await requireRole("PROFESSIONAL");
    const { id } = await ctx.params;
    const service = await findOwnedService(id, user.id);

    if (await Appointment.exists({ serviceId: service._id })) {
      service.isActive = false;
      await service.save();
      return ok({ id, result: "archived" as const });
    }

    await service.deleteOne();
    return ok({ id, result: "deleted" as const });
  } catch (error) {
    return handleApiError(error);
  }
}
