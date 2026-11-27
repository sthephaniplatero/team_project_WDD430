import { Clock3, MapPin, Phone } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import type { PublicProfessional } from "@/lib/professionals";

const dayLabels = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type ProfileHeaderProps = {
  professional: PublicProfessional;
};

export function ProfileHeader({ professional }: ProfileHeaderProps) {
  const { profile } = professional;
  const workingDays = profile.workingDays
    .filter((day) => dayLabels[day] !== undefined)
    .map((day) => dayLabels[day])
    .join(", ");

  return (
    <section className="rounded-xl border border-outline-variant bg-card p-6 shadow-sm sm:p-9">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        <Avatar
          name={professional.name}
          src={professional.image}
          size="lg"
          className="size-20 text-xl"
        />
        <div className="min-w-0 flex-1">
          <p className="text-caption font-semibold uppercase tracking-wider text-brand">
            {profile.category}
          </p>
          <h1 className="mt-1 text-ink">{professional.name}</h1>
          {profile.headline && (
            <p className="mt-2 text-lg font-medium text-muted">{profile.headline}</p>
          )}
          {profile.bio && (
            <p className="mt-4 whitespace-pre-line text-body text-muted">
              {profile.bio}
            </p>
          )}
        </div>
      </div>
      <dl className="mt-7 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        {professional.phone && (
          <div className="flex items-start gap-2.5">
            <Phone aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-caption font-semibold text-ink">Phone</dt>
              <dd>
                <a
                  href={`tel:${professional.phone}`}
                  className="text-sm text-muted hover:text-brand"
                >
                  {professional.phone}
                </a>
              </dd>
            </div>
          </div>
        )}
        {profile.location && (
          <div className="flex items-start gap-2.5">
            <MapPin aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-caption font-semibold text-ink">Location</dt>
              <dd className="text-sm text-muted">{profile.location}</dd>
            </div>
          </div>
        )}
        {(workingDays || profile.workingHoursStart || profile.workingHoursEnd) && (
          <div className="flex items-start gap-2.5 sm:col-span-2">
            <Clock3 aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-brand" />
            <div>
              <dt className="text-caption font-semibold text-ink">Working hours</dt>
              <dd className="text-sm text-muted">
                {workingDays && <span>{workingDays} · </span>}
                {profile.workingHoursStart}–{profile.workingHoursEnd}
                <span> ({profile.timezone})</span>
              </dd>
            </div>
          </div>
        )}
      </dl>
    </section>
  );
}
