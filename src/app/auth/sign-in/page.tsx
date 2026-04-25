"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuthStore } from "@/store/auth-store";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const signIn = useAuthStore((state) => state.signIn);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (isAuthenticated) {
      router.replace("/");
    }
  }, [hasHydrated, isAuthenticated, router]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    signIn(email.trim());
    router.replace("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(140deg,_#0d1b2a,_#1b263b_50%,_#415a77)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/20 bg-white/90 p-6 backdrop-blur-sm">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-600">{BRAND.platformName}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0d1b2a]">Sign in</h1>
        <p className="mt-2 text-sm text-neutral-600">MVP auth placeholder. Backend auth can plug in later.</p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-black/20 px-3 py-2 outline-none focus:border-[#0056d2]"
          />
          <button className="w-full rounded-xl bg-[#0056d2] px-3 py-2 font-semibold text-white" type="submit">
            Continue
          </button>
        </form>

        <div className="mt-4 flex items-center justify-between text-sm text-neutral-600">
          <Link href="/auth/sign-up">Create account</Link>
          <Link href="/auth/forgot-password">Forgot password</Link>
        </div>
      </div>
    </main>
  );
}
