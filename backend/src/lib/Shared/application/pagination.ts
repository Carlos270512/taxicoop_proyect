export function parsePagination(page?: unknown, limit?: unknown): { page: number; limit: number } {
  const parsedPage = Number(page ?? 1);
  const parsedLimit = Number(limit ?? 20);

  const safePage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;
  const safeLimit = Number.isFinite(parsedLimit) && parsedLimit > 0 ? Math.min(Math.floor(parsedLimit), 100) : 20;

  return { page: safePage, limit: safeLimit };
}
