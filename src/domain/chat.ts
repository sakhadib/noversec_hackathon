export type Role = "user" | "assistant";

export type VideoStatus =
  | "idle"
  | "processing"
  | "making_video"
  | "rendering"
  | "accumulating"
  | "copying_to_output"
  | "ready"
  | "failed";

export type Message = {
  id: string;
  chatId: string;
  role: Role;
  content: string;
  createdAt: string;
  video?: {
    status: VideoStatus;
    stageLabel?: string;
    sourceUrl?: string;
    downloadUrl?: string;
    fileName?: string;
    error?: string;
  };
};

export type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  createdAt: string;
  messages: Message[];
};

export type QueryAnalysis = {
  shouldSuggestVideo: boolean;
  confidence: number;
};

export type PendingVideoConfirmation = {
  chatId: string;
  userMessageId: string;
  assistantMessageId: string;
  userQuestion: string;
};
