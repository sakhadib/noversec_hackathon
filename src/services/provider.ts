import type { IChatService, IVideoService } from "@/domain/contracts";
import { MockChatService } from "@/services/mock/mock-chat-service";
import { MockVideoService } from "@/services/mock/mock-video-service";

const chatService: IChatService = new MockChatService();
const videoService: IVideoService = new MockVideoService();

export const services = {
  chatService,
  videoService,
};
