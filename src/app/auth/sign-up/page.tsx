"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuthStore } from "@/store/auth-store";

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");

  const signIn = useAuthStore((state) => state.signIn);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    signIn(email.trim());
    router.replace("/");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(150deg,_#132a13,_#31572c_45%,_#4f772d)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/95 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{BRAND.platformName}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#1f3b1f]">Create account</h1>
        <p className="mt-2 text-sm text-neutral-600">Placeholder signup flow for frontend-first development.</p>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-xl border border-black/20 px-3 py-2 outline-none focus:border-[#2e7d32]"
          />
          <button className="w-full rounded-xl bg-[#2e7d32] px-3 py-2 font-semibold text-white" type="submit">
            Create and continue
          </button>
        </form>

        <p className="mt-4 text-sm text-neutral-600">
          Already have an account? <Link href="/auth/sign-in">Sign in</Link>
        </p>
      </div>
    </main>
  );
}
