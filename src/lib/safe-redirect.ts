/**
 * Sanitize a callbackUrl to prevent open redirect attacks.
 * Only allows relative paths starting with "/".
 */
export function safeRedirectUrl(callbackUrl: string | null, fallback = "/"): string {
  if (!callbackUrl) return fallback;

  // Reject absolute URLs, protocol-relative URLs, and data/javascript URIs
  if (
    callbackUrl.startsWith("//") ||
    callbackUrl.includes("://") ||
    callbackUrl.startsWith("data:") ||
    callbackUrl.startsWith("javascript:")
  ) {
    return fallback;
  }

  // Must start with "/" to be a valid relative path
  if (!callbackUrl.startsWith("/")) return fallback;

  return callbackUrl;
}
