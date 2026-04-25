import type { IVideoService, VideoProgressEvent } from "@/domain/contracts";
import type { VideoStatus } from "@/domain/chat";
import { MATH_EXPLAINER_API } from "@/lib/api";

type ExplainSubmitResponse = {
  job_id?: string;
  jobId?: string;
  status?: string;
  message?: string;
};

type BackendJobStatus =
  | "pending"
  | "breaking_down"
  | "generating_scripts"
  | "generating_code"
  | "rendering"
  | "merging"
  | "done"
  | "failed";

type JobStatusResponse = {
  job_id?: string;
  jobId?: string;
  status?: BackendJobStatus | string;
  message?: string;
  error?: string;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const backendStatusMap: Record<BackendJobStatus, VideoProgressEvent | null> = {
  pending: { status: "processing", stageLabel: "processing" },
  breaking_down: { status: "processing", stageLabel: "processing" },
  generating_scripts: { status: "making_video", stageLabel: "making video" },
  generating_code: { status: "accumulating", stageLabel: "accumulating" },
  rendering: { status: "rendering", stageLabel: "rendering" },
  merging: { status: "copying_to_output", stageLabel: "copying to output" },
  done: null,
  failed: null,
};

function getJobId(data: ExplainSubmitResponse | JobStatusResponse): string {
  const jobId = data.job_id ?? data.jobId;
  if (!jobId) {
    throw new Error("Backend did not return a job_id");
  }

  return jobId;
}

function isBackendJobStatus(status: string): status is BackendJobStatus {
  return [
    "pending",
    "breaking_down",
    "generating_scripts",
    "generating_code",
    "rendering",
    "merging",
    "done",
    "failed",
  ].includes(status);
}

function toVideoStatus(status: BackendJobStatus): VideoStatus {
  const mapped = backendStatusMap[status];
  return mapped?.status ?? "ready";
}

export class MathExplainerVideoService implements IVideoService {
  async generateVideo(
    input: string,
    onProgress: (event: VideoProgressEvent) => void,
  ): Promise<{ sourceUrl: string; downloadUrl: string; fileName: string }> {
    if (!MATH_EXPLAINER_API.hasBaseUrl) {
      throw new Error("Math Explainer API base URL is not configured");
    }

    const submitResponse = await fetch(MATH_EXPLAINER_API.endpoints.explain, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic: input }),
    });

    if (!submitResponse.ok) {
      throw new Error(`Failed to submit explain job: ${submitResponse.status}`);
    }

    const submitted = (await submitResponse.json()) as ExplainSubmitResponse;
    const jobId = getJobId(submitted);

    let lastEmittedStatus: VideoStatus | null = null;
    let lastEmittedLabel = "";

    for (let attempt = 0; attempt < MATH_EXPLAINER_API.maxPollingAttempts; attempt += 1) {
      const statusResponse = await fetch(MATH_EXPLAINER_API.endpoints.job(jobId), {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!statusResponse.ok) {
        throw new Error(`Failed to fetch job status: ${statusResponse.status}`);
      }

      const statusBody = (await statusResponse.json()) as JobStatusResponse;
      const rawStatus = `${statusBody.status ?? "pending"}`;

      if (!isBackendJobStatus(rawStatus)) {
        throw new Error(`Unknown backend status: ${rawStatus}`);
      }

      if (rawStatus === "failed") {
        throw new Error(statusBody.error ?? statusBody.message ?? "Video generation failed");
      }

      if (rawStatus === "done") {
        const videoUrl = MATH_EXPLAINER_API.endpoints.video(jobId);
        return {
          sourceUrl: videoUrl,
          downloadUrl: videoUrl,
          fileName: `${jobId}.mp4`,
        };
      }

      const mappedProgress = backendStatusMap[rawStatus];
      if (
        mappedProgress &&
        (mappedProgress.status !== lastEmittedStatus || mappedProgress.stageLabel !== lastEmittedLabel)
      ) {
        onProgress(mappedProgress);
        lastEmittedStatus = toVideoStatus(rawStatus);
        lastEmittedLabel = mappedProgress.stageLabel;
      }

      await delay(MATH_EXPLAINER_API.pollingIntervalMs);
    }

    throw new Error("Video generation timed out while polling job status");
  }
}
