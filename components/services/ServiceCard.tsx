import { ArrowRight, Clock3, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

type ServiceCardBaseProps = {
  serviceId: string;
  title: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  isActive: boolean;
};

type ServiceCardProps = ServiceCardBaseProps &
  (
    | {
        mode: "public";
        onEdit?: never;
        onDelete?: never;
      }
    | {
        mode: "dashboard";
        onEdit: (serviceId: string) => void;
        onDelete: (serviceId: string) => void;
      }
  );

export function ServiceCard(props: ServiceCardProps) {
  const {
    serviceId,
    title,
    description,
    durationMinutes,
    priceLabel,
    isActive,
  } = props;

  return (
    <Card className="flex h-full flex-col p-5 sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-ink">{title}</h3>
        <Badge variant={isActive ? "active" : "archived"}>
          {isActive ? "Active" : "Archived"}
        </Badge>
      </div>
      <p className="mt-3 line-clamp-3 flex-1 text-body text-muted">
        {description}
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <span className="inline-flex items-center gap-1.5 text-caption font-medium text-slate-600">
          <Clock3 aria-hidden="true" className="size-4 text-muted" />
          {durationMinutes} min
        </span>
        <span className="text-sm font-semibold text-ink">{priceLabel}</span>
      </div>
      {props.mode === "public" ? (
        isActive ? (
          <Link
            href={`?service=${encodeURIComponent(serviceId)}#booking`}
            className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
          >
            Book
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        ) : (
          <span className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
            Not currently available
          </span>
        )
      ) : (
        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => props.onEdit(serviceId)}
          >
            <Pencil aria-hidden="true" className="size-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="outline"
            className="flex-1 border-red-200 text-danger hover:bg-red-50"
            onClick={() => props.onDelete(serviceId)}
          >
            <Trash2 aria-hidden="true" className="size-4" />
            Delete
          </Button>
        </div>
      )}
    </Card>
  );
}
