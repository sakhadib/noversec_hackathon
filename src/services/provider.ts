import type { IChatService, IVideoService } from "@/domain/contracts";
import { MATH_EXPLAINER_API } from "@/lib/api";
import { MockChatService } from "@/services/mock/mock-chat-service";
import { MockVideoService } from "@/services/mock/mock-video-service";
import { MathExplainerVideoService } from "@/services/real/math-explainer-video-service";

const chatService: IChatService = new MockChatService();
const videoService: IVideoService = MATH_EXPLAINER_API.useRealVideoApi
  ? new MathExplainerVideoService()
  : new MockVideoService();

export const services = {
  chatService,
  videoService,
};
