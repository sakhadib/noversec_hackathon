"use client";

import { useMemo, useRef } from "react";
import type { Message } from "@/domain/chat";

type Props = {
  message: Message;
};

export function VideoCard({ message }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const video = message.video;

  const statusText = useMemo(() => {
    if (!video) {
      return null;
    }

    if (video.status === "ready") {
      return null;
    }

    return video.stageLabel ?? video.status;
  }, [video]);

  if (!video) {
    return null;
  }

  const openFullscreen = async () => {
    if (!videoRef.current || !video.sourceUrl) {
      return;
    }

    if (videoRef.current.requestFullscreen) {
      await videoRef.current.requestFullscreen();
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-white/15 bg-[#3a3a3a] p-3">
      {video.status !== "ready" ? (
        <div className="text-sm text-[#d7d7d7]">
          <p className="font-semibold">Video pipeline</p>
          <p className="mt-1 capitalize">{statusText}</p>
        </div>
      ) : (
        <div className="space-y-3">
          <video
            ref={videoRef}
            className="h-auto w-full rounded-xl border border-white/10"
            controls
            preload="metadata"
            src={video.sourceUrl}
          />
          <div className="flex flex-wrap gap-2">
            <a
              href={video.downloadUrl}
              download={video.fileName ?? "strugglemap-video.mp4"}
              className="rounded-lg bg-[#4d4d4d] px-3 py-2 text-sm font-medium text-white"
            >
              Download
            </a>
            <button
              type="button"
              onClick={openFullscreen}
              className="rounded-lg border border-white/20 px-3 py-2 text-sm font-medium"
            >
              Fullscreen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
