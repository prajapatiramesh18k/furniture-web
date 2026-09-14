/** "rohan kumar" -> "Rohan Kumar". Display-only normalization; stored data untouched. */
export function toTitleCase(str: string): string {
  return String(str || '')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
