"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import { CURRENCIES, DURATIONS } from "@/lib/constants";
import { fromMinorUnits, toMinorUnits } from "@/lib/money";
import type { ServiceDTO } from "@/lib/services";
import {
  serviceFormSchema,
  type ServiceFormValues,
  type ServiceInput,
} from "@/lib/validations/service";

type ServiceFormModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The service to edit; omit it to create a new one. */
  service?: ServiceDTO | null;
  /**
   * Saves the service. Resolve with field errors from the API to show them
   * under the inputs, or throw to show a general error.
   */
  onSubmit: (input: ServiceInput) => Promise<{ fields?: Record<string, string> } | void>;
};

const EMPTY_VALUES: ServiceFormValues = {
  title: "",
  description: "",
  durationMinutes: "60",
  price: "",
  currency: "USD",
  isActive: true,
};

function toFormValues(service: ServiceDTO): ServiceFormValues {
  return {
    title: service.title,
    description: service.description,
    durationMinutes: String(service.durationMinutes),
    price: fromMinorUnits(service.price, service.currency).toFixed(2),
    currency: service.currency,
    isActive: service.isActive,
  };
}

/** Form values → API body. The decimal price becomes minor units (25.50 → 2550). */
function toServiceInput(values: ServiceFormValues): ServiceInput {
  return {
    title: values.title,
    description: values.description,
    durationMinutes: Number(values.durationMinutes) as ServiceInput["durationMinutes"],
    price: toMinorUnits(values.price, values.currency),
    currency: values.currency,
    isActive: values.isActive,
  };
}

const FORM_FIELDS = ["title", "description", "durationMinutes", "price", "currency"] as const;

export function ServiceFormModal({ open, onOpenChange, service, onSubmit }: ServiceFormModalProps) {
  const isEdit = Boolean(service);
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit service" : "Add a service"}
      description={
        isEdit
          ? "Changes apply to new bookings. Existing appointments keep their original price."
          : "Clients will see this service on your public profile."
      }
    >
      {/* Modal content unmounts when closed, so the form starts fresh on every open. */}
      <ServiceForm service={service ?? null} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} />
    </Modal>
  );
}

type ServiceFormProps = {
  service: ServiceDTO | null;
  onSubmit: ServiceFormModalProps["onSubmit"];
  onCancel: () => void;
};

function ServiceForm({ service, onSubmit, onCancel }: ServiceFormProps) {
  const isEdit = Boolean(service);
  const formId = useId();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: service ? toFormValues(service) : EMPTY_VALUES,
  });

  const submit = handleSubmit(async (values) => {
    setFormError(null);
    try {
      const result = await onSubmit(toServiceInput(values));
      if (result?.fields) {
        for (const [name, message] of Object.entries(result.fields)) {
          if ((FORM_FIELDS as readonly string[]).includes(name)) {
            setError(name as (typeof FORM_FIELDS)[number], { message });
          } else {
            setFormError(message);
          }
        }
      }
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    }
  });

  const field = (name: keyof ServiceFormValues) => ({
    id: `${formId}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${formId}-${name}-error` : undefined,
    className: errors[name] ? "border-danger focus:border-danger focus:ring-red-50" : "",
  });

  const errorText = (name: keyof ServiceFormValues) =>
    errors[name]?.message && (
      <p id={`${formId}-${name}-error`} className="text-caption font-medium text-danger">
        {errors[name]?.message}
      </p>
    );

  return (
    <form id={formId} onSubmit={submit} noValidate className="flex flex-col gap-5">
      {formError && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {formError}
        </p>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-title`} className="text-sm font-semibold text-ink">
          Title
        </label>
        <Input {...register("title")} {...field("title")} placeholder="e.g. Math lesson" />
        {errorText("title")}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-durationMinutes`} className="text-sm font-semibold text-ink">
            Duration
          </label>
          <Select {...register("durationMinutes")} {...field("durationMinutes")}>
            {DURATIONS.map((d) => (
              <option key={d} value={String(d)}>
                {d} minutes
              </option>
            ))}
          </Select>
          {errorText("durationMinutes")}
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${formId}-price`} className="text-sm font-semibold text-ink">
            Price
          </label>
          <div className="flex gap-2">
            <Select
              {...register("currency")}
              {...field("currency")}
              aria-label="Currency"
              className={`w-24 shrink-0 ${field("currency").className}`}
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
            <Input
              {...register("price")}
              {...field("price")}
              inputMode="decimal"
              placeholder="25.00"
            />
          </div>
          {errorText("price")}
          {errorText("currency")}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${formId}-description`} className="text-sm font-semibold text-ink">
          Description <span className="font-normal text-muted">(optional)</span>
        </label>
        <Textarea
          {...register("description")}
          {...field("description")}
          maxLength={500}
          placeholder="What clients can expect from this session"
        />
        {errorText("description")}
      </div>

      {isEdit && (
        <label className="flex items-start gap-3 rounded-lg border border-slate-200 p-4">
          <input
            type="checkbox"
            {...register("isActive")}
            className="mt-1 size-4 accent-brand"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold text-ink">Active</span>
            <span className="text-caption text-muted">
              Archived services are hidden from your public profile and can&apos;t be booked.
            </span>
          </span>
        </label>
      )}

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-4 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <button
          type="submit"
          disabled={isSubmitting}
          aria-busy={isSubmitting || undefined}
          className="inline-flex min-h-12 items-center justify-center rounded-md bg-accent px-5 py-2 text-sm font-semibold text-ink transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 disabled:opacity-55"
        >
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add service"}
        </button>
      </div>
    </form>
  );
}
