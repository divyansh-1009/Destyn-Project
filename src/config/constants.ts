/**
 * Application-wide constants.
 *
 * Centralising these prevents drift between the three places
 * (NextAuth, check-domain, landing-page) that previously each
 * maintained their own copy of ALLOWED_DOMAINS, and the 22+ routes
 * that each hard-coded the database name.
 */

// ---------------------------------------------------------------------------
// Database
// ---------------------------------------------------------------------------

/** Canonical MongoDB database name used by every API route. */
export const DB_NAME = process.env.DB_NAME || "datingapp";

// ---------------------------------------------------------------------------
// Auth / Domain Allowlist
// ---------------------------------------------------------------------------

/**
 * College email domains permitted to create accounts.
 * Extend this list (or move it to an env variable) to on-board new colleges.
 *
 * NOTE: Only domain suffixes should appear here (no full email addresses).
 *       Admin/developer access should be controlled via ADMIN_EMAILS below.
 */
export const ALLOWED_DOMAINS: readonly string[] = process.env.ALLOWED_DOMAINS
  ? process.env.ALLOWED_DOMAINS.split(",").map(d => d.trim()).filter(Boolean)
  : [
      "iitj.ac.in",
      "nlujodhpur.ac.in",
      "mbm.ac.in",
      "nift.ac.in",
      "jietjodhpur.ac.in",
      "aiimsjodhpur.edu.in",
    ];

/**
 * Optional, env-controlled list of admin/developer email addresses that bypass
 * the domain allowlist.  Set ADMIN_EMAILS as a comma-separated string in your
 * environment (e.g.  "admin@example.com,dev@example.com").
 *
 * Defaults to an empty set — no backdoors are open by default.
 */
export const ADMIN_EMAILS: ReadonlySet<string> = new Set(
  (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
);

/**
 * Returns true if the given email is allowed to access the platform.
 * Checks both the domain allowlist and the admin email set.
 */
export function isEmailAllowed(email: string): boolean {
  const lower = email.toLowerCase();
  const domain = lower.split("@")[1];
  if (!domain) return false;
  return (
    (ALLOWED_DOMAINS as string[]).includes(domain) ||
    ADMIN_EMAILS.has(lower)
  );
}

// ---------------------------------------------------------------------------
// Confession Groups
// ---------------------------------------------------------------------------

/** Valid group identifiers for the anonymous confessions feed. */
export type ConfessionGroup =
  | "b22"
  | "b23"
  | "b24"
  | "b25"
  | "other-iitj"
  | "nlujodhpur"
  | "mbm"
  | "nift"
  | "jietjodhpur"
  | "aiimsjodhpur"
  | "other"
  | "all";
