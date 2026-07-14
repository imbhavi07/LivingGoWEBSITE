export function getPagination(query: Record<string, unknown>) {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 120000, 1), 1000000000);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
