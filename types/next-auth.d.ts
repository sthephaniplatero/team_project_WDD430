import type { DefaultSession } from "next-auth";
import type { Role } from "@/lib/constants";

declare module "next-auth" {
  interface User {
    role: Role;
  }

  interface Session {
    user: {
      id: string;
      role: Role;
    } & DefaultSession["user"];
  }
}

// next-auth/jwt only re-exports @auth/core/jwt, so the augmentation must target the original module.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}
