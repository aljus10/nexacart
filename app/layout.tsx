import type { Metadata } from 'next';
import './globals.css';
import './entrance.css';
import './map.css';
import './workspace.css';
import { Agentation } from 'agentation';
export const metadata: Metadata = {title:'NexaCart · Commerce Explorer',description:'Explore your commerce data as a connected district. Interactive analytics, schema resilience, and verified answers.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>) {
  return (
    <html lang="en">
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <Agentation endpoint="http://localhost:4747" />}
      </body>
    </html>
  );
}
