import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Polangui HQ Jarvis · NexaCart Intelligence Room',
  description: 'Interactive 3D Polangui HQ Jarvis with live cursor parallax and real-time commerce intelligence.',
};

export default async function IntelligenceRoomPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = (await searchParams) || {};
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(sp)) {
    if (typeof v === 'string') params.set(k, v);
    else if (Array.isArray(v) && v[0]) params.set(k, v[0]);
  }
  const qs = params.toString();
  const iframeSrc = qs ? `/intelligence-room/index.html?${qs}` : '/intelligence-room/index.html';

  return (
    <main className="fixed inset-0 w-screen h-screen overflow-hidden bg-[#0c1115]">
      <iframe
        src={iframeSrc}
        className="w-full h-full border-0 block"
        style={{ width: '100vw', height: '100vh', border: 0 }}
        title="NexaCart Polangui HQ Jarvis"
        allow="autoplay; fullscreen; gamepad"
      />
    </main>
  );
}
