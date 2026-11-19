import Image from "next/image";

type AvatarSize = "sm" | "md" | "lg";

type AvatarProps = {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  className?: string;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-14 text-base",
};

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
}

export function Avatar({
  name,
  src,
  size = "md",
  className = "",
}: AvatarProps) {
  return (
    <span
      aria-label={name}
      role="img"
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-50 font-semibold text-brand ring-1 ring-teal-100 ${sizeClasses[size]} ${className}`}
    >
      {src ? (
        <Image
          src={src}
          alt=""
          fill
          sizes={size === "lg" ? "56px" : size === "md" ? "40px" : "32px"}
          unoptimized
          className="object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </span>
  );
}
