"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSafeCallbackUrl } from "@/lib/auth-utils";
import {
  loginSchema,
  type LoginInput,
} from "@/lib/validations/auth";

type LoginFormProps = {
  callbackUrl: string;
};

export function LoginForm({ callbackUrl }: LoginFormProps) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });

      if (!result || result.error) {
        setValue("password", "");
        setError("root.server", {
          message: "Invalid email or password",
        });
        return;
      }

      router.replace(getSafeCallbackUrl(callbackUrl));
      router.refresh();
    } catch {
      setValue("password", "");
      setError("root.server", {
        message: "Invalid email or password",
      });
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {errors.root?.server && (
        <p className="rounded-md bg-danger-container p-3 text-sm text-danger" role="alert">
          {errors.root.server.message}
        </p>
      )}
      <div>
        <label htmlFor="login-email" className="mb-1.5 block text-sm font-semibold text-ink">
          Email
        </label>
        <Input
          id="login-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "login-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="login-email-error" className="mt-1 text-sm text-danger">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="login-password" className="mb-1.5 block text-sm font-semibold text-ink">
          Password
        </label>
        <Input
          id="login-password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "login-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="login-password-error" className="mt-1 text-sm text-danger">
            {errors.password.message}
          </p>
        )}
      </div>
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Log in
      </Button>
      <p className="text-center text-sm text-muted">
        New to Viable?{" "}
        <Link href="/register" className="font-semibold text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  );
}
