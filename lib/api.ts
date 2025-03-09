/**
 * Get the base API URL from environment variables with a fallback
 */
export function getApiUrl(): string {
  return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
}

/**
 * Construct a full API endpoint URL
 * @param path - The API endpoint path (e.g., '/api/auth/login')
 * @returns The full API URL
 */
export function getApiEndpoint(path: string): string {
  const baseUrl = getApiUrl();
  // Ensure path starts with a slash
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${normalizedPath}`;
}
