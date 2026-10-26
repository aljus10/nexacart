export async function fetchRestoreSql(table: string): Promise<string> {
  const res = await fetch(`/api/backup?table=${encodeURIComponent(table)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not fetch restore SQL for ${table}.`);
  return res.text();
}
