import type { UserRole } from "@/lib/validations/auth";

type RoleSelectorProps = {
  value: UserRole;
  onChange: (value: UserRole) => void;
  error?: string;
};

const roles: { value: UserRole; title: string; description: string }[] = [
  {
    value: "CLIENT",
    title: "I'm looking for a professional",
    description: "Discover services and book appointments.",
  },
  {
    value: "PROFESSIONAL",
    title: "I'm a professional",
    description: "Share your services and manage bookings.",
  },
];

export function RoleSelector({ value, onChange, error }: RoleSelectorProps) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold text-ink">
        How will you use Viable?
      </legend>
      <div className="grid gap-3 sm:grid-cols-2">
        {roles.map((role) => (
          <label
            key={role.value}
            className={`flex cursor-pointer gap-3 rounded-md border p-4 transition-colors ${
              value === role.value
                ? "border-brand bg-teal-50"
                : "border-outline-variant bg-card hover:border-brand"
            }`}
          >
            <input
              type="radio"
              name="role"
              value={role.value}
              checked={value === role.value}
              onChange={() => onChange(role.value)}
              className="mt-1 accent-brand"
            />
            <span>
              <span className="block text-sm font-semibold text-ink">
                {role.title}
              </span>
              <span className="mt-1 block text-caption text-muted">
                {role.description}
              </span>
            </span>
          </label>
        ))}
      </div>
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </fieldset>
  );
}
