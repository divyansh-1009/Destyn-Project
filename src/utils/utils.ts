/**
 * Cleans a name by removing brackets and their contents
 * Example: "Himkesh Tak (B24CY1009)" -> "Himkesh Tak"
 */
export function cleanName(name: string): string {
  if (!name) return name;
  
  // Remove content within parentheses, brackets, and braces
  // This regex matches: (content), [content], {content}
  return name.replace(/[\(\[\{].*?[\)\]\}]/g, '').trim();
} 