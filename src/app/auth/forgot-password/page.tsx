import Link from "next/link";
import { BRAND } from "@/lib/brand";

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[linear-gradient(140deg,_#3c096c,_#5a189a_45%,_#7b2cbf)] p-4">
      <div className="w-full max-w-md rounded-2xl border border-white/25 bg-white/95 p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">{BRAND.platformName}</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#31114b]">Reset password</h1>
        <p className="mt-3 text-sm text-neutral-600">
          Placeholder screen. Backend team can later connect reset token APIs here.
        </p>
        <Link
          href="/auth/sign-in"
          className="mt-5 inline-flex rounded-lg bg-[#5a189a] px-3 py-2 text-sm font-semibold text-white"
        >
          Back to sign in
        </Link>
      </div>
    </main>
  );
}
