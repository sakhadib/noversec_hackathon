import { APP_CONFIG } from "@/lib/config";
import type { IVideoService } from "@/domain/contracts";
import type { VideoStatus } from "@/domain/chat";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const stageToStatus: Record<string, VideoStatus> = {
  processing: "processing",
  "making video": "making_video",
  rendering: "rendering",
  accumulating: "accumulating",
  "copying to output": "copying_to_output",
};

const SAMPLE_VIDEO = "/dump/MathScene.mp4";

export class MockVideoService implements IVideoService {
  async generateVideo(
    _input: string,
    onProgress: (event: { status: VideoStatus; stageLabel: string }) => void,
  ): Promise<{ sourceUrl: string; downloadUrl: string; fileName: string }> {
    for (const stageLabel of APP_CONFIG.videoProgressStages) {
      onProgress({
        status: stageToStatus[stageLabel],
        stageLabel,
      });
      await delay(1100);
    }

    return {
      sourceUrl: SAMPLE_VIDEO,
      downloadUrl: SAMPLE_VIDEO,
      fileName: "MathScene.mp4",
    };
  }
}
