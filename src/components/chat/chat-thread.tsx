"use client";

import { useEffect, useRef } from "react";
import { MessageBubble } from "@/components/chat/message-bubble";
import { ConfirmVideoPrompt } from "@/components/chat/confirm-video-prompt";
import type { Message, PendingVideoConfirmation } from "@/domain/chat";

type Props = {
  messages: Message[];
  pendingVideoConfirmation: PendingVideoConfirmation | null;
  onConfirmVideo: (confirm: boolean) => void;
};

export function ChatThread({ messages, pendingVideoConfirmation, onConfirmVideo }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, pendingVideoConfirmation]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-5 py-4">
      {messages.length === 0 ? (
        <div className="mx-auto mt-20 max-w-xl text-center text-sm text-[#cfcfcf]">
          Start a chat. If your topic is better explained visually, StruggleMap will ask to generate a video.
        </div>
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
