"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowUp, faPlus, faXmark } from "@fortawesome/free-solid-svg-icons";

type Props = {
  isSending: boolean;
  onSend: (text: string, forceVideo: boolean) => void;
  prefill?: {
    text: string;
    forceVideo?: boolean;
    nonce: number;
  } | null;
};

export function ChatComposer({ isSending, onSend, prefill }: Props) {
  const [text, setText] = useState(() => prefill?.text ?? "");
  const [forceVideo, setForceVideo] = useState(() => Boolean(prefill?.forceVideo));
  const [showTools, setShowTools] = useState(false);
  const toolsRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const resizeTextarea = () => {
    const textarea = textareaRef.current;
    if (!textarea) {
      return;
    }

    const minHeight = 62;
    const lineHeight = 26;
    const verticalPadding = 24;
    const maxHeight = lineHeight * 15 + verticalPadding;

    textarea.style.height = "0px";
    const nextHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${nextHeight}px`;
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  useEffect(() => {
    const closeOnOutside = (event: MouseEvent) => {
      if (!showTools) {
        return;
      }

      const root = toolsRef.current;
      if (!root) {
        return;
      }

      const target = event.target as Node;
      if (!root.contains(target)) {
        setShowTools(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutside);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
    };
  }, [showTools]);

  useEffect(() => {
    resizeTextarea();
  }, [text, forceVideo]);

  const sendCurrentMessage = () => {
    if (!text.trim()) {
      return;
    }

    onSend(text, forceVideo);
    setText("");
    setForceVideo(false);
    setShowTools(false);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendCurrentMessage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.ctrlKey && event.key === "Enter") {
      event.preventDefault();
      sendCurrentMessage();
    }
  };

  const floatingButtonStyle = { top: "calc(50% - 5px)", transform: "translateY(-50%)" };

  return (
    <form
      className="border-t border-cyan-200/10 bg-[linear-gradient(180deg,_#1b2432,_#1c2130)] px-5 pb-4 pt-3"
      onSubmit={handleSubmit}
    >
      <div className="relative" ref={toolsRef}>
        <textarea
          ref={textareaRef}
          rows={1}
          className={`min-h-[62px] w-full resize-none rounded-2xl border border-cyan-100/20 bg-[linear-gradient(180deg,_#1d2b3f,_#202635)] pl-[68px] pr-[68px] text-[17px] leading-7 text-[#f3f2ec] outline-none focus:border-[#67e8f9] ${
            forceVideo ? "pb-3 pt-11" : "py-[14px]"
          }`}
          placeholder="Ask anything. Ctrl+Enter to send."
          value={text}
          onChange={(event) => {
            setText(event.target.value);
          }}
          onKeyDown={handleKeyDown}
        />

        {forceVideo ? (
          <div className="pointer-events-none absolute left-14 top-2">
            <div className="pointer-events-auto inline-flex items-center gap-2 rounded-full border border-sky-100/30 bg-[linear-gradient(120deg,_#0e7490,_#2563eb)] px-3 py-1 text-xs text-white">
              <span>Create video</span>
              <button
                type="button"
                onClick={() => setForceVideo(false)}
                className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#6b6b6b]"
                aria-label="Remove video request"
              >
                <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
              </button>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          className="absolute left-[20px] inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-100/30 bg-[linear-gradient(120deg,_#0ea5e9,_#2563eb)] text-[#f3f2ec] leading-none shadow-[0_8px_20px_rgba(37,99,235,0.35)]"
          style={floatingButtonStyle}
          onClick={() => setShowTools((value) => !value)}
          aria-label="Open message tools"
        >
          <FontAwesomeIcon icon={faPlus} className="h-3 w-3" />
        </button>

        {showTools ? (
          <div className="absolute bottom-14 left-[20px] z-20 w-40 rounded-lg border border-cyan-100/20 bg-[#132135] p-1 shadow-lg">
            <button
              type="button"
              onClick={() => {
                setForceVideo(true);
                setShowTools(false);
              }}
              className="block w-full rounded-md px-3 py-2 text-left text-sm text-[#f3f2ec] hover:bg-[#1e3555]"
            >
              Create video
            </button>
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isSending || !text.trim()}
          className="absolute right-[20px] inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-100/30 bg-[linear-gradient(120deg,_#0ea5e9,_#10b981)] text-white leading-none shadow-[0_8px_20px_rgba(16,185,129,0.35)] disabled:cursor-not-allowed disabled:bg-[#6a6a6a]"
          style={floatingButtonStyle}
          aria-label="Send message"
        >
          <FontAwesomeIcon icon={faArrowUp} className="h-3 w-3" />
        </button>
      </div>
    </form>
  );
}
