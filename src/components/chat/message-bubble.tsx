"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRobot } from "@fortawesome/free-solid-svg-icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import type { Message } from "@/domain/chat";
import { VideoCard } from "@/components/chat/video-card";

type Props = {
  message: Message;
};

export function MessageBubble({ message }: Props) {
  const fromUser = message.role === "user";

  return (
    <div className={`flex ${fromUser ? "justify-end" : "justify-start"}`}>
      {!fromUser ? (
        <div className="mr-3 mt-1 h-8 w-8 shrink-0 text-[#d8d8d8]">
          <FontAwesomeIcon icon={faRobot} className="h-full w-full" />
        </div>
      ) : null}
      <div
        className={`max-w-[90%] px-1 py-1 md:max-w-[72%] ${
          fromUser
            ? "rounded-2xl bg-[#4d4d4d] px-4 py-3 text-white"
            : "text-[#f3f2ec]"
        }`}
      >
        {fromUser ? (
          <p className="whitespace-pre-wrap text-[16px] leading-relaxed">{message.content}</p>
        ) : (
          <div className="space-y-3 text-[16px] leading-8">
            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({ children }) => <h1 className="text-2xl font-bold leading-tight">{children}</h1>,
                h2: ({ children }) => <h2 className="text-xl font-semibold leading-tight">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-semibold leading-tight">{children}</h3>,
                p: ({ children }) => <p className="leading-8">{children}</p>,
                ul: ({ children }) => <ul className="list-disc space-y-1 pl-6">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal space-y-1 pl-6">{children}</ol>,
                li: ({ children }) => <li>{children}</li>,
                code: ({ children }) => (
                  <code className="rounded bg-[#454545] px-1.5 py-0.5 font-mono text-[0.9em]">{children}</code>
                ),
                pre: ({ children }) => (
                  <pre className="overflow-x-auto rounded-lg bg-[#3d3d3d] p-3 text-sm">{children}</pre>
                ),
                strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                hr: () => <hr className="border-white/20" />,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}
        <VideoCard message={message} />
      </div>
    </div>
  );
}
