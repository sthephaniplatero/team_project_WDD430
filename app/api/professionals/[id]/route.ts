import { notFound, ok } from "@/lib/api-response";
import { getProfessionalProfile } from "@/lib/professionals";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;
  const professional = await getProfessionalProfile(id);

  if (!professional) {
    return notFound("Professional not found.");
  }

  return ok(professional);
}
