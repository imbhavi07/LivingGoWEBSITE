export function getPagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 12, 1), 100);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
