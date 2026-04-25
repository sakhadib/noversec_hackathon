"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { BRAND } from "@/lib/brand";
import { useAuthStore } from "@/store/auth-store";
import { useChatStore } from "@/store/chat-store";
import { ChatSidebar } from "@/components/chat/chat-sidebar";
import { ChatThread } from "@/components/chat/chat-thread";
import { ChatComposer } from "@/components/chat/chat-composer";

export function ChatApp() {
  const router = useRouter();

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
    <main className="h-screen w-screen overflow-hidden bg-[#303030] text-[#f3f2ec]">
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

        <section className="flex min-h-0 flex-col bg-[#303030]">
          <header className="border-b border-white/10 px-5 py-4">
            <h1 className="truncate text-lg font-semibold text-[#f3f2ec] md:text-xl">
              {activeSession?.title ?? "New Chat"}
            </h1>
          </header>

          <ChatThread
            messages={activeSession?.messages ?? []}
            pendingVideoConfirmation={pendingVideoConfirmation}
            onConfirmVideo={(confirm) => void confirmVideoGeneration(confirm)}
          />

          <ChatComposer
            isSending={isSending}
            onSend={(text, forceVideo) => void sendMessage(text, forceVideo)}
          />
        </section>
      </div>
    </main>
  );
}
