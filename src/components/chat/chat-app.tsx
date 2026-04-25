"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatThread } from "@/components/chat/chat-thread";
import { ChatComposer } from "@/components/chat/chat-composer";

export function ChatApp() {
  const router = useRouter();
  const [composerPrefill, setComposerPrefill] = useState<{
    text: string;
    forceVideo?: boolean;
    nonce: number;
  } | null>(null);

  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const email = useAuthStore((state) => state.email);
  const hydrateAuth = useAuthStore((state) => state.hydrate);
  const signOut = useAuthStore((state) => state.signOut);

  const sessions = useChatStore((state) => state.sessions);
  const activeChatId = useChatStore((state) => state.activeChatId);
  const isSending = useChatStore((state) => state.isSending);
  const pendingVideoConfirmation = useChatStore((state) => state.pendingVideoConfirmation);
  const bootstrap = useChatStore((state) => state.bootstrap);
  const createSession = useChatStore((state) => state.createSession);
  const selectSession = useChatStore((state) => state.selectSession);
  const renameSession = useChatStore((state) => state.renameSession);
  const removeSession = useChatStore((state) => state.removeSession);
  const sendMessage = useChatStore((state) => state.sendMessage);
  const confirmVideoGeneration = useChatStore((state) => state.confirmVideoGeneration);

  useEffect(() => {
    hydrateAuth();
  }, [hydrateAuth]);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (!isAuthenticated) {
      router.replace("/auth/sign-in");
      return;
    }

    void bootstrap();
  }, [bootstrap, hasHydrated, isAuthenticated, router]);

  const activeSession = useMemo(() => {
    return sessions.find((session) => session.id === activeChatId) ?? null;
  }, [activeChatId, sessions]);

  if (!hasHydrated || !isAuthenticated) {
    return null;
  }

  return (
    <main className="animated-glow-bg h-screen w-screen overflow-hidden text-[#f3f2ec]">
      <div className="grid h-full w-full grid-cols-1 md:grid-cols-[300px_1fr]">
        <ChatSidebar
          brandName={BRAND.platformName}
          email={email}
          sessions={sessions}
          activeChatId={activeChatId}
          onSelect={(id) => void selectSession(id)}
          onCreate={() => void createSession()}
          onDelete={(id) => void removeSession(id)}
          onRename={(id, title) => void renameSession(id, title)}
          onSignOut={() => {
            signOut();
            router.replace("/auth/sign-in");
          }}
        />

        <section className="flex min-h-0 flex-col bg-[linear-gradient(180deg,_#1f2129_0%,_#1b1d24_60%,_#191b22_100%)]">
          <header className="border-b border-cyan-200/10 bg-[#1c1f27]/80 px-5 py-4 backdrop-blur-sm">
            <h1 className="truncate text-lg font-semibold text-[#f3f2ec] md:text-xl">
              {activeSession?.title ?? "New Chat"}
            </h1>
            <div className="mt-2 h-[2px] w-24 rounded-full bg-[linear-gradient(90deg,_#22d3ee,_#60a5fa,_#34d399)]" />
          </header>

          <ChatThread
            messages={activeSession?.messages ?? []}
            email={email}
            pendingVideoConfirmation={pendingVideoConfirmation}
            onConfirmVideo={(confirm) => void confirmVideoGeneration(confirm)}
            onUsePrompt={(payload) => {
              setComposerPrefill({
                text: payload.text,
                forceVideo: payload.forceVideo,
                nonce: Date.now(),
              });
            }}
          />

          <ChatComposer
            key={composerPrefill?.nonce ?? 0}
            isSending={isSending}
            onSend={(text, forceVideo) => void sendMessage(text, forceVideo)}
            prefill={composerPrefill}
          />
        </section>
      </div>
    </main>
  );
}
