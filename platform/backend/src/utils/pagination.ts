/** Shared pagination query parsing — response shape stays { success, data }; meta is additive */

export type PageParams = { page: number; limit: number; skip: number };

export function parsePagination(query: Record<string, unknown>, defaults = { page: 1, limit: 20 }): PageParams {
  const page = Math.max(1, Number(query.page) || defaults.page);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || defaults.limit));
  return { page, limit, skip: (page - 1) * limit };
}

export function pageMeta(total: number, page: number, limit: number) {
  return {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    hasMore: page * limit < total,
  };
}

/**
 * API versioning strategy (non-breaking):
 * - Current routes remain at /api/*
 * - Future breaking changes ship under /api/v2/*
 * - Clients may send Accept: application/vnd.svlive.v1+json (informational)
 */
export const API_VERSION = '1.0.0';
