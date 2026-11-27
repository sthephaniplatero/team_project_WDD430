import { hash } from "bcryptjs";
import { connectToDatabase } from "@/lib/db";
import {
  apiError,
  badRequest,
  conflict,
  created,
  zodFieldErrors,
} from "@/lib/api-response";
import { registerSchema } from "@/lib/validations/auth";
import { PROFESSIONAL_PROFILE_DEFAULTS } from "@/lib/constants";
import { User } from "@/models/User";

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return badRequest("Please check your details.", zodFieldErrors(parsed.error));
  }

  try {
    await connectToDatabase();
    if (await User.exists({ email: parsed.data.email })) {
      const message = "An account with this email already exists.";
      return conflict(message, { email: message });
    }
  } catch (error) {
    console.error("Registration database lookup failed:", error);
    return apiError(
      "DATABASE_UNAVAILABLE",
      "Registration is temporarily unavailable because the database could not be reached.",
    );
  }

  const passwordHash = await hash(parsed.data.password, 10);
  try {
    const user = await User.create({
      ...parsed.data,
      passwordHash,
      ...(parsed.data.role === "PROFESSIONAL"
        ? {
            professionalProfile: {
              ...PROFESSIONAL_PROFILE_DEFAULTS,
              workingDays: [...PROFESSIONAL_PROFILE_DEFAULTS.workingDays],
            },
          }
        : {}),
    });

    return created({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      const message = "An account with this email already exists.";
      return conflict(message, { email: message });
    }

    console.error("Registration database write failed:", error);
    return apiError(
      "DATABASE_UNAVAILABLE",
      "Registration is temporarily unavailable because the database could not be reached.",
    );
  }
}
