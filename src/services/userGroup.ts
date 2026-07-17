/**
 * User group classification for the anonymous confessions feed.
 *
 * Groups are derived from the user's verified college email address.
 * IIT Jodhpur batches are identified by the email prefix (b22/b23/b24/b25).
 * All other colleges are matched by their domain suffix.
 *
 * Admin emails (from ADMIN_EMAILS env var) are mapped to a group via the
 * ADMIN_GROUP_OVERRIDES env var — a comma-separated list of
 * "email:group" pairs, e.g. "admin@example.com:b24,dev@example.com:b23".
 */

import type { ConfessionGroup } from "@/config/constants";

// ---------------------------------------------------------------------------
// Admin group overrides
// Map admin email → group, driven entirely by environment variables so that no
// personal data lives in source code.
// ---------------------------------------------------------------------------
const ADMIN_GROUP_OVERRIDES: Map<string, ConfessionGroup> = new Map(
  (process.env.ADMIN_GROUP_OVERRIDES ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const [email, group] = entry.split(":").map((s) => s.trim());
      return [email?.toLowerCase(), group as ConfessionGroup] as const;
    })
    .filter(([email, group]) => email && group)
);

/**
 * Determines the confession group for a given (already-validated) email.
 *
 * The matching order is important:
 *  1. Admin override map (env-controlled).
 *  2. IIT-Jodhpur batch prefixes (b22–b25).
 *  3. IIT-Jodhpur general domain.
 *  4. Other supported college domains.
 *  5. Falls back to "other".
 */
export function getUserGroup(email: string): ConfessionGroup {
  const lower = email.toLowerCase();

  // 1. Admin/developer override — maps specific emails to groups via env var.
  const adminGroup = ADMIN_GROUP_OVERRIDES.get(lower);
  if (adminGroup) return adminGroup;

  // 2. IIT Jodhpur batch groups.
  if (lower.endsWith("@iitj.ac.in")) {
    if (lower.startsWith("b22")) return "b22";
    if (lower.startsWith("b23")) return "b23";
    if (lower.startsWith("b24")) return "b24";
    if (lower.startsWith("b25")) return "b25";
    return "other-iitj";
  }

  // 3. Other colleges.
  if (lower.endsWith("@nlujodhpur.ac.in")) return "nlujodhpur";
  if (lower.endsWith("@mbm.ac.in")) return "mbm";
  if (lower.endsWith("@nift.ac.in")) return "nift";
  if (lower.endsWith("@jietjodhpur.ac.in")) return "jietjodhpur";
  if (lower.endsWith("@aiimsjodhpur.edu.in")) return "aiimsjodhpur";

  return "other";
}
