import type { IChatService, IVideoService } from "@/domain/contracts";
import { MockChatService } from "@/services/mock/mock-chat-service";
import { MathExplainerVideoService } from "@/services/real/math-explainer-video-service";

const chatService: IChatService = new MockChatService();
const videoService: IVideoService = new MathExplainerVideoService();

export const services = {
  chatService,
  videoService,
};
