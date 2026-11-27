"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RoleSelector } from "@/components/auth/RoleSelector";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getSafeCallbackUrl } from "@/lib/auth-utils";
import {
  registerSchema,
  type RegisterInput,
} from "@/lib/validations/auth";

type RegisterFormProps = {
  callbackUrl: string;
};

function getApiErrorMessage(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "object" &&
    value.error !== null &&
    "message" in value.error &&
    typeof value.error.message === "string"
  ) {
    return value.error.message;
  }

  return null;
}

export function RegisterForm({ callbackUrl }: RegisterFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "CLIENT",
    },
  });

  async function onSubmit(values: RegisterInput) {
    setServerError("");
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        setValue("password", "");
        if (response.status === 409) {
          setError("email", {
            message: "An account with this email already exists.",
          });
        } else {
          const errorBody: unknown = await response.json().catch(() => null);
          setServerError(
            getApiErrorMessage(errorBody) ??
              "We couldn't create your account. Please try again.",
          );
        }
        return;
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
      });

      if (!result || result.error) {
        setValue("password", "");
        setServerError(
          "Your account was created, but we couldn't sign you in. Please log in.",
        );
        return;
      }

      router.replace(getSafeCallbackUrl(callbackUrl));
      router.refresh();
    } catch {
      setValue("password", "");
      setServerError("We couldn't connect to Viable. Please try again.");
    }
  }

  const role = useWatch({ control, name: "role" });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
      {serverError && (
        <p className="rounded-md bg-danger-container p-3 text-sm text-danger" role="alert">
          {serverError}
        </p>
      )}
      <div>
        <label htmlFor="register-name" className="mb-1.5 block text-sm font-semibold text-ink">
          Full name
        </label>
        <Input
          id="register-name"
          autoComplete="name"
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "register-name-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <p id="register-name-error" className="mt-1 text-sm text-danger">
            {errors.name.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-email" className="mb-1.5 block text-sm font-semibold text-ink">
          Email
        </label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "register-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <p id="register-email-error" className="mt-1 text-sm text-danger">
            {errors.email.message}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="register-password" className="mb-1.5 block text-sm font-semibold text-ink">
          Password
        </label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          aria-describedby={errors.password ? "register-password-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <p id="register-password-error" className="mt-1 text-sm text-danger">
            {errors.password.message}
          </p>
        )}
      </div>
      <RoleSelector
        value={role}
        onChange={(nextRole) =>
          setValue("role", nextRole, { shouldValidate: true })
        }
        error={errors.role?.message}
      />
      <Button type="submit" className="w-full" loading={isSubmitting}>
        Create account
      </Button>
      <p className="text-center text-sm text-muted">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
