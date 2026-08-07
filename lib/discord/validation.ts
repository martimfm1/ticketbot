export function isValidDiscordId(
  value: unknown,
): value is string {
  return (
    typeof value === "string" &&
    /^\d{17,20}$/.test(value)
  );
}