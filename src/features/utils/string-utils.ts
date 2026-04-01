/**
 * Converts kebab-case or snake_case strings to Title Case
 * Example: "pure-club-bangers" → "Pure Club Bangers"
 * Example: "audio-loops" → "Audio Loops"
 */
export const toTitleCase = (str: string): string => {
  if (!str) return "";

  return str
    .replace(/[-_]/g, " ") // Convert kebab and snake to spaces
    .replace(/\b\w/g, (char) => char.toUpperCase()) // Capitalize first letter of each word
    .trim();
};
