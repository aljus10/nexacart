import fs from 'node:fs/promises';
import path from 'node:path';

export const dynamic = 'force-dynamic';

const ALLOWED = ['dim_seller', 'dim_customer', 'dim_product', 'dim_payment', 'dim_shipping', 'fact_order_items', 'all'];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const table = searchParams.get('table') || 'all';

  if (!ALLOWED.includes(table)) {
    return new Response('Invalid table requested.', { status: 400 });
  }

  const fileName = table === 'all' ? 'restore_all.sql' : `restore_${table}.sql`;
  const filePath = path.join(process.cwd(), 'database/backups', fileName);

  try {
    const content = await fs.readFile(filePath, 'utf8');
    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-store'
      }
    });
  } catch {
    return new Response('Backup file not found.', { status: 404 });
  }
}
