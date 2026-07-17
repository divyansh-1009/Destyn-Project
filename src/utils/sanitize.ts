/**
 * Input Sanitization Utilities
 *
 * User-supplied text (confessions, comments, bios) was previously stored
 * verbatim with no sanitization. These utilities strip HTML tags to prevent
 * stored XSS, and enforce length limits before data reaches MongoDB.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Max length for free-text confessions. */
export const MAX_CONFESSION_LENGTH = 2000;
/** Max length for comments. */
export const MAX_COMMENT_LENGTH = 500;
/** Max length for user bios. */
export const MAX_BIO_LENGTH = 300;

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------

/**
 * Strips HTML tags from a string.
 *
 * We use a simple regex approach rather than a DOM parser because this runs
 * server-side (no DOM available). For a production system that needs to allow
 * some HTML, replace this with a library like `sanitize-html`.
 */
export function stripHtml(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Trims whitespace and strips HTML from a user-supplied string.
 * Returns an empty string for nullish input.
 */
export function sanitizeText(input: unknown): string {
  if (typeof input !== "string") return "";
  return stripHtml(input).trim();
}

/**
 * Sanitizes text and enforces a maximum character length.
 * Truncation is a safety net; validation at the API layer should
 * reject over-length input with a 400 before reaching this.
 */
export function sanitizeAndLimit(input: unknown, maxLength: number): string {
  return sanitizeText(input).slice(0, maxLength);
}

/**
 * Returns true if the sanitized text is non-empty and within the length limit.
 * Use this for validation before writing to the database.
 */
export function isValidText(
  input: unknown,
  maxLength: number,
  minLength = 1
): boolean {
  const text = sanitizeText(input);
  return text.length >= minLength && text.length <= maxLength;
}
