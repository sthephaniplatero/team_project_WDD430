"use client";

import { BriefcaseBusiness, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { DeleteServiceDialog } from "@/components/services/DeleteServiceDialog";
import { ServiceFormModal } from "@/components/services/ServiceFormModal";
import { ServiceList } from "@/components/services/ServiceList";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ApiErrorBody } from "@/lib/api-response";
import { formatMoney } from "@/lib/money";
import type { ServiceDTO } from "@/lib/services";
import type { ServiceInput } from "@/lib/validations/service";

type Dialog =
  | { kind: "closed" }
  | { kind: "form"; service: ServiceDTO | null }
  | { kind: "delete"; service: ServiceDTO };

const addButtonClass =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2";

/** Reads the API's { error } body (SPECIFICATION.md §7.2). */
async function readError(response: Response): Promise<ApiErrorBody["error"]> {
  try {
    const body = (await response.json()) as ApiErrorBody;
    return body.error;
  } catch {
    return { code: "INTERNAL_ERROR", message: "Something went wrong. Please try again." };
  }
}

/** Services CRUD for /dashboard/services: list + create/edit modal + delete dialog. */
export function ServicesManager({ services }: { services: ServiceDTO[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<Dialog>({ kind: "closed" });
  const [notice, setNotice] = useState<string | null>(null);
  const [isRefreshing, startRefresh] = useTransition();

  const close = () => setDialog({ kind: "closed" });
  // Re-runs the Server Component so the list shows the saved data right away.
  const refresh = () => startRefresh(() => router.refresh());
  const findService = (id: string) => services.find((s) => s.id === id);

  async function saveService(input: ServiceInput, existing: ServiceDTO | null) {
    const response = await fetch(existing ? `/api/services/${existing.id}` : "/api/services", {
      method: existing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) {
      const error = await readError(response);
      if (error.fields) return { fields: error.fields };
      throw new Error(error.message);
    }
    close();
    setNotice(existing ? `“${input.title}” was updated.` : `“${input.title}” was added.`);
    refresh();
  }

  async function deleteService(service: ServiceDTO) {
    const response = await fetch(`/api/services/${service.id}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error((await readError(response)).message);
    }
    const { data } = (await response.json()) as { data: { result: "deleted" | "archived" } };
    close();
    setNotice(
      data.result === "archived"
        ? `“${service.title}” has appointments, so it was archived instead of deleted.`
        : `“${service.title}” was deleted.`,
    );
    refresh();
  }

  const formService = dialog.kind === "form" ? dialog.service : null;
  const deleteTarget = dialog.kind === "delete" ? dialog.service : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-headline-lg-mobile text-ink md:text-headline-lg">Services</h1>
          <p className="text-body text-muted">What clients can book with you.</p>
        </div>
        {services.length > 0 && (
          <button type="button" className={addButtonClass} onClick={() => setDialog({ kind: "form", service: null })}>
            <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
            Add service
          </button>
        )}
      </div>

      <p role="status" aria-live="polite" className={notice ? "rounded-lg bg-teal-50 px-4 py-3 text-sm font-medium text-brand" : "sr-only"}>
        {notice}
      </p>

      <div aria-busy={isRefreshing || undefined} className={isRefreshing ? "opacity-60 transition-opacity" : ""}>
        {services.length === 0 ? (
          <EmptyState
            icon={<BriefcaseBusiness aria-hidden="true" className="size-6" />}
            title="Create your first service"
            description="Add the sessions you offer, with their duration and price, so clients can book them."
            action={
              <button type="button" className={addButtonClass} onClick={() => setDialog({ kind: "form", service: null })}>
                <Plus aria-hidden="true" className="size-4" strokeWidth={2} />
                Add service
              </button>
            }
          />
        ) : (
          <ServiceList
            mode="dashboard"
            services={services.map((s) => ({
              serviceId: s.id,
              title: s.title,
              description: s.description,
              durationMinutes: s.durationMinutes,
              priceLabel: formatMoney(s.price, s.currency),
              isActive: s.isActive,
            }))}
            onEdit={(id) => {
              const service = findService(id);
              if (service) setDialog({ kind: "form", service });
            }}
            onDelete={(id) => {
              const service = findService(id);
              if (service) setDialog({ kind: "delete", service });
            }}
          />
        )}
      </div>

      <ServiceFormModal
        open={dialog.kind === "form"}
        onOpenChange={(open) => !open && close()}
        service={formService}
        onSubmit={(input) => saveService(input, formService)}
      />
      <DeleteServiceDialog
        open={dialog.kind === "delete"}
        onOpenChange={(open) => !open && close()}
        service={deleteTarget}
        onConfirm={() => (deleteTarget ? deleteService(deleteTarget) : Promise.resolve())}
      />
    </div>
  );
}
