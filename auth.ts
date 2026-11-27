import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "@/auth.config";
import { User } from "@/models/User";
import { connectToDatabase } from "@/lib/db";
import { loginSchema } from "@/lib/validations/auth";
import { compare } from "bcryptjs";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        await connectToDatabase();
        const user = await User.findOne({ email: parsed.data.email })
          .select("+passwordHash")
          .exec();

        if (!user || !(await compare(parsed.data.password, user.passwordHash))) {
          return null;
        }

        return {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
});
