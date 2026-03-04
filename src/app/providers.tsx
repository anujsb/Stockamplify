'use client';

import { SessionProvider } from 'next-auth/react';
import type { Session } from 'next-auth';

export function Providers({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  // Hydrates SessionProvider so useSession() won't fetch on the client
  return <SessionProvider session={session}>{children}</SessionProvider>;
}
