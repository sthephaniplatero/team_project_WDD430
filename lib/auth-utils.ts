export function getSafeCallbackUrl(value: string | string[] | undefined) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\")
  ) {
    return "/dashboard";
  }

  const callback = new URL(value, "https://viable.invalid");
  if (callback.origin !== "https://viable.invalid") {
    return "/dashboard";
  }

  return `${callback.pathname}${callback.search}${callback.hash}`;
}
