import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import { User } from "@/models/User";
import { registerSchema } from "@/lib/validations/auth";
import { ApiError, created, handleApiError } from "@/lib/api-response";
import { PROFESSIONAL_PROFILE_DEFAULTS } from "@/lib/constants";

const SALT_ROUNDS = 10;
const EMAIL_TAKEN = "An account with this email already exists";

/**
 * POST /api/auth/register — public
 * Body: { name, email, password, role }
 * 201 { data: { id, name, email, role } } | 400 validation | 409 email taken
 */
export async function POST(request: Request) {
  try {
    const input = registerSchema.parse(await request.json());

    await connectDB();

    if (await User.exists({ email: input.email })) {
      throw new ApiError("CONFLICT", EMAIL_TAKEN, { email: EMAIL_TAKEN });
    }

    const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

    const user = await User.create({
      name: input.name,
      email: input.email,
      passwordHash,
      role: input.role,
      // Professionals get a working profile right away (§9.1)
      ...(input.role === "PROFESSIONAL" && {
        professionalProfile: {
          ...PROFESSIONAL_PROFILE_DEFAULTS,
          workingDays: [...PROFESSIONAL_PROFILE_DEFAULTS.workingDays],
        },
      }),
    });

    return created({
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    // Two simultaneous sign-ups with the same email: the unique index wins.
    if (isDuplicateKeyError(error)) {
      return handleApiError(new ApiError("CONFLICT", EMAIL_TAKEN, { email: EMAIL_TAKEN }));
    }
    return handleApiError(error);
  }
}

function isDuplicateKeyError(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === 11000;
}
