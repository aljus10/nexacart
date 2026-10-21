export async function fetchRestoreSql(table: string): Promise<string> {
  const fileName = table === 'all' ? 'restore_all.sql' : `restore_${table}.sql`;
  try {
    const staticRes = await fetch(`/backups/${fileName}`, { cache: 'no-store' });
    if (staticRes.ok) return staticRes.text();
  } catch {
    // Fall back to dynamic API route
  }
  const res = await fetch(`/api/backup?table=${encodeURIComponent(table)}`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Could not fetch restore SQL for ${table}.`);
  return res.text();
}
