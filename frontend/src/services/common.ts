/**
 * Helper to normalize list responses from the API.
 * DRF uses a paginated envelope { count, next, previous, results: [...] }
 * while some endpoints may return the raw array. This helper returns
 * the inner array in either case.
 */
export function unwrapList<T>(payload: any): T[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload as T[];
  if (payload && Array.isArray(payload.results)) return payload.results as T[];
  return [];
}
