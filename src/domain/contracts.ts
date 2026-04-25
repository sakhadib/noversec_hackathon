import type { QueryAnalysis, VideoStatus } from "@/domain/chat";

export type VideoProgressEvent = {
  status: VideoStatus;
  stageLabel: string;
};

export interface IChatService {
  analyzeQuery(input: string): Promise<QueryAnalysis>;
  generateTextReply(input: string): Promise<string>;
}

export interface IVideoService {
  generateVideo(
    input: string,
    onProgress: (event: VideoProgressEvent) => void,
  ): Promise<{
    sourceUrl: string;
    downloadUrl: string;
    fileName: string;
  }>;
}
