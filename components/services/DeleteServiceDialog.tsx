"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import type { ServiceDTO } from "@/lib/services";

type DeleteServiceDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: ServiceDTO | null;
  /** Deletes (or archives) the service. Throw to show an error in the dialog. */
  onConfirm: () => Promise<void>;
};

export function DeleteServiceDialog({ open, onOpenChange, service, onConfirm }: DeleteServiceDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function confirm() {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Modal
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (!next) setError(null);
        onOpenChange(next);
      }}
      title="Delete service?"
      description={service ? `“${service.title}” will be removed from your services.` : undefined}
      footer={
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirm} loading={pending}>
            Delete service
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-3 text-body text-muted">
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </p>
        )}
        <p>
          If any appointment already uses this service, it will be <strong className="text-ink">archived</strong>{" "}
          instead, so your booking history stays intact. Archived services are hidden from your public profile.
        </p>
      </div>
    </Modal>
  );
}
