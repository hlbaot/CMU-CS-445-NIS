const BASE_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export async function fetchReport({ page = 1, pageSize = 10 } = {}) {
  const url = `${BASE_URL}/api/report?page=${page}&page_size=${pageSize}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}
