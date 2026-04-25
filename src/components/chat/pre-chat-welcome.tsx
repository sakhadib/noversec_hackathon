"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBookOpen,
  faBolt,
  faCalculator,
  faFilm,
  faWandMagicSparkles,
} from "@fortawesome/free-solid-svg-icons";

type StarterPrompt = {
  title: string;
  text: string;
  forceVideo?: boolean;
};

type Props = {
  email: string | null;
  onUsePrompt: (payload: { text: string; forceVideo?: boolean }) => void;
};

const starterPrompts: StarterPrompt[] = [
  {
    title: "Explain parabola intuitively",
    text: "Explain parabola intuitively with one practical real-world example.",
  },
  {
    title: "Visualize derivatives",
    text: "Create a video explaining derivatives in calculus with geometric intuition.",
    forceVideo: true,
  },
  {
    title: "Matrix multiplication",
    text: "Explain matrix multiplication with a simple 2x2 worked example.",
  },
  {
    title: "Chain rule visual",
    text: "Create video for chain rule with step-by-step animation-friendly explanation.",
    forceVideo: true,
  },
];

function getDisplayName(email: string | null): string {
  if (!email) {
    return "there";
  }

  const prefix = email.split("@")[0] ?? "there";
  return prefix.replace(/[._-]+/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export function PreChatWelcome({ email, onUsePrompt }: Props) {
  const name = getDisplayName(email);

  return (
    <section className="mx-auto w-full max-w-5xl px-2 py-2 md:px-3 md:py-3">
      <div className="rounded-3xl border border-cyan-200/15 bg-[linear-gradient(140deg,_#10233a,_#1e293b_42%,_#2b1e3f)] p-4 md:p-5 shadow-[0_18px_48px_rgba(34,211,238,0.08)]">
        <div className="flex flex-wrap items-center gap-3 text-[#9ae6ff]">
          <FontAwesomeIcon icon={faWandMagicSparkles} className="h-4 w-4" />
          <p className="text-sm tracking-wide">Welcome to StruggleMap</p>
        </div>

        <h2 className="mt-2 text-2xl font-bold leading-tight text-[#f0f9ff] md:text-3xl">
          Hi {name}, ready to turn math struggle into clarity?
        </h2>
        <p className="mt-2 max-w-3xl text-[15px] leading-6 text-[#d5ddf1]">
          Ask any concept, get clear explanations, and generate visual Manim videos when needed.
        </p>

        <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-[#d6d6d6] md:grid-cols-2">
          <div className="rounded-xl border border-cyan-200/20 bg-[#17344a] px-3 py-2 text-[#d4f2ff]">
            <FontAwesomeIcon icon={faBookOpen} className="mr-2" />
            Explain concepts in simple language
          </div>
          <div className="rounded-xl border border-blue-200/20 bg-[#1f3155] px-3 py-2 text-[#deebff]">
            <FontAwesomeIcon icon={faFilm} className="mr-2" />
            Generate visual Manim explainers
          </div>
          <div className="rounded-xl border border-emerald-200/20 bg-[#163d38] px-3 py-2 text-[#d5fff0]">
            <FontAwesomeIcon icon={faCalculator} className="mr-2" />
            Render equations and math notation
          </div>
          <div className="rounded-xl border border-amber-200/20 bg-[#453214] px-3 py-2 text-[#ffecc7]">
            <FontAwesomeIcon icon={faBolt} className="mr-2" />
            Continue from saved chat history
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => {
              onUsePrompt({
                text: "Help me understand quadratic equations from basics.",
              });
            }}
            className="rounded-full border border-cyan-100/30 bg-[linear-gradient(120deg,_#0891b2,_#2563eb)] px-3 py-1.5 text-sm font-medium text-white hover:brightness-110"
          >
            Start with text explanation
          </button>
          <button
            type="button"
            onClick={() => {
              onUsePrompt({
                text: "Create video explaining what a parabola means visually.",
                forceVideo: true,
              });
            }}
            className="rounded-full border border-emerald-200/35 bg-[linear-gradient(120deg,_#059669,_#0ea5e9)] px-3 py-1.5 text-sm font-medium text-[#ecfeff] hover:brightness-110"
          >
            Create visual explainer
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
        {starterPrompts.map((prompt) => (
          <button
            key={prompt.title}
            type="button"
            onClick={() => {
              onUsePrompt({ text: prompt.text, forceVideo: prompt.forceVideo });
            }}
            className="flex items-center justify-between rounded-xl border border-white/15 bg-[linear-gradient(120deg,_#1f2533,_#242c3d)] px-3 py-2 text-left transition hover:border-cyan-100/40 hover:bg-[linear-gradient(120deg,_#243249,_#2d3c5c)]"
          >
            <p className="truncate pr-2 text-sm font-semibold text-[#f4f7ff]">{prompt.title}</p>
            {prompt.forceVideo ? (
              <span className="inline-flex shrink-0 rounded-full border border-sky-200/50 bg-[#254169] px-2 py-0.5 text-[11px] text-[#dbe6ff]">
                Video
              </span>
            ) : null}
          </button>
        ))}
      </div>

      <p className="mt-2 text-xs text-[#9ea5b5]">
        Tip: press Ctrl+Enter to send quickly once your prompt is ready.
      </p>
    </section>
  );
}
