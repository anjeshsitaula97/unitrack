export async function fetchStudents(params: { perPage?: number } = {}, signal?: AbortSignal) {
  const query = new URLSearchParams();
  if (params.perPage) query.set("perPage", String(params.perPage));
  const res = await fetch(`/api/students?${query.toString()}`, { signal });
  if (!res.ok) return null;
  const json = await res.json();
  return json.data ?? null;
}
