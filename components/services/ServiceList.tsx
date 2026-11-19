import { EmptyState } from "@/components/ui/EmptyState";
import { ServiceCard } from "@/components/services/ServiceCard";

type ServiceItem = {
  serviceId: string;
  title: string;
  description: string;
  durationMinutes: number;
  priceLabel: string;
  isActive: boolean;
};

type ServiceListProps = {
  services: ServiceItem[];
  mode: "public";
  emptyTitle?: string;
  emptyDescription?: string;
};

type DashboardServiceListProps = {
  services: ServiceItem[];
  mode: "dashboard";
  onEdit: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

export function ServiceList(
  props: ServiceListProps | DashboardServiceListProps,
) {
  const {
    services,
    emptyTitle = "No services yet",
    emptyDescription = "Services will appear here when they are available.",
  } = props;

  if (services.length === 0) {
    return (
      <EmptyState title={emptyTitle} description={emptyDescription} />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) =>
        props.mode === "dashboard" ? (
          <ServiceCard
            key={service.serviceId}
            {...service}
            mode="dashboard"
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        ) : (
          <ServiceCard
            key={service.serviceId}
            {...service}
            mode="public"
          />
        ),
      )}
    </div>
  );
}
