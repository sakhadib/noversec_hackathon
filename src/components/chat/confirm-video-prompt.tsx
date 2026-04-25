"use client";

type Props = {
  onConfirm: (confirm: boolean) => void;
};

export function ConfirmVideoPrompt({ onConfirm }: Props) {
  return (
    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3">
      <p className="text-sm font-medium text-amber-900">
        This answer can be much clearer with a visual Manim video.
      </p>
      <div className="mt-2 flex gap-2">
        <button
          className="rounded-lg bg-amber-600 px-3 py-2 text-sm font-semibold text-white"
          type="button"
          onClick={() => onConfirm(true)}
        >
          Yes, create video
        </button>
        <button
          className="rounded-lg border border-amber-600 px-3 py-2 text-sm font-semibold text-amber-900"
          type="button"
          onClick={() => onConfirm(false)}
        >
          Continue with text
        </button>
      </div>
    </div>
  );
}
