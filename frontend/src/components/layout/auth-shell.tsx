import type { ReactNode } from "react";
import Link from "next/link";

import { Logo } from "@/components/brand/logo";

/** Centered card layout for login, registration, and onboarding steps (mobile-first). */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="px-4 py-5 sm:px-6">
        <Link href="/" aria-label="ElSakka home">
          <Logo />
        </Link>
      </header>
      <main className="flex flex-1 items-start justify-center px-4 pb-12 sm:items-center sm:px-6">
        <div className="w-full max-w-md">{children}</div>
      </main>
    </div>
  );
}
