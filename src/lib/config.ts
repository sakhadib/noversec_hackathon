export const APP_CONFIG = {
  videoProgressStages: [
    "processing",
    "making video",
    "rendering",
    "accumulating",
    "copying to output",
  ] as const,
  suggestionConfidenceThreshold: 0.65,
} as const;

export type VideoProgressStageLabel =
  (typeof APP_CONFIG.videoProgressStages)[number];
