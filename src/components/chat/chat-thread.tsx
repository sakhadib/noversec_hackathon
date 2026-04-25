"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ConfirmVideoPrompt } from "@/components/chat/confirm-video-prompt";
import { PreChatWelcome } from "@/components/chat/pre-chat-welcome";
import type { Message, PendingVideoConfirmation } from "@/domain/chat";

type Props = {
  messages: Message[];
  email: string | null;
  pendingVideoConfirmation: PendingVideoConfirmation | null;
  onConfirmVideo: (confirm: boolean) => void;
  onUsePrompt: (payload: { text: string; forceVideo?: boolean }) => void;
};

export function ChatThread({
  messages,
  email,
  pendingVideoConfirmation,
  onConfirmVideo,
  onUsePrompt,
}: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const isEmpty = messages.length === 0;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pendingVideoConfirmation]);

  return (
    <section
      className={`flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-4 ${
        isEmpty ? "justify-center" : "gap-3"
      }`}
    >
      {isEmpty ? (
        <PreChatWelcome email={email} onUsePrompt={onUsePrompt} />
      ) : (
        messages.map((message) => (
          <div key={message.id} className="space-y-2">
            <MessageBubble message={message} />
            {pendingVideoConfirmation?.assistantMessageId === message.id ? (
              <ConfirmVideoPrompt onConfirm={onConfirmVideo} />
            ) : null}
          </div>
        ))
      )}
      <div ref={endRef} />
    </section>
  );
}
