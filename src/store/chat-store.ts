"use client";

import { create } from "zustand";
import type {
  ChatSession,
  Message,
  PendingVideoConfirmation,
  VideoStatus,
} from "@/domain/chat";
import { APP_CONFIG } from "@/lib/config";
import { services } from "@/services/provider";
import {
  deleteSession,
  loadSession,
  loadSessionIndex,
  saveSession,
  saveSessionIndex,
} from "@/lib/storage/chat-history";

const generateId = () => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

const nowIso = () => new Date().toISOString();

const createInitialSession = (): ChatSession => {
  const ts = nowIso();
  return {
    id: generateId(),
    title: "New Chat",
    createdAt: ts,
    updatedAt: ts,
    messages: [],
  };
};

type ChatState = {
  sessions: ChatSession[];
  activeChatId: string | null;
  isSending: boolean;
  pendingVideoConfirmation: PendingVideoConfirmation | null;
  bootstrap: () => Promise<void>;
  createSession: () => Promise<void>;
  selectSession: (id: string) => Promise<void>;
  renameSession: (id: string, title: string) => Promise<void>;
  removeSession: (id: string) => Promise<void>;
  sendMessage: (input: string, forceVideo: boolean) => Promise<void>;
  confirmVideoGeneration: (
    confirm: boolean,
    overridePending?: PendingVideoConfirmation,
  ) => Promise<void>;
};

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  activeChatId: null,
  isSending: false,
  pendingVideoConfirmation: null,

  bootstrap: async () => {
    const index = loadSessionIndex();

    if (index.length === 0) {
      const initial = createInitialSession();
      await saveSession(initial);
      saveSessionIndex([initial]);
      set({ sessions: [initial], activeChatId: initial.id });
      return;
    }

    const hydrated: ChatSession[] = [];
    for (const item of index) {
      const full = await loadSession(item.id);
      if (full) {
        hydrated.push(full);
      }
    }

    const sessions = hydrated.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    set({ sessions, activeChatId: sessions[0]?.id ?? null });
  },

  createSession: async () => {
    const session = createInitialSession();
    await saveSession(session);

    set((state) => {
      const sessions = [session, ...state.sessions];
      saveSessionIndex(sessions);
      return { sessions, activeChatId: session.id, pendingVideoConfirmation: null };
    });
  },

  selectSession: async (id) => {
    const loaded = await loadSession(id);
    if (!loaded) {
      return;
    }

    set((state) => {
      const sessions = state.sessions.map((session) => {
        return session.id === id ? loaded : session;
      });

      return { sessions, activeChatId: id, pendingVideoConfirmation: null };
    });
  },

  renameSession: async (id, title) => {
    const trimmed = title.trim();
    if (!trimmed) {
      return;
    }

    const state = get();
    const target = state.sessions.find((session) => session.id === id);
    if (!target) {
      return;
    }

    const updated: ChatSession = { ...target, title: trimmed, updatedAt: nowIso() };
    await saveSession(updated);

    set((current) => {
      const sessions = current.sessions
        .map((session) => (session.id === id ? updated : session))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      saveSessionIndex(sessions);
      return { sessions };
    });
  },

  removeSession: async (id) => {
    await deleteSession(id);

    set((state) => {
      const sessions = state.sessions.filter((session) => session.id !== id);

      if (sessions.length === 0) {
        return { sessions: [], activeChatId: null, pendingVideoConfirmation: null };
      }

      saveSessionIndex(sessions);
      const fallbackId = state.activeChatId === id ? sessions[0].id : state.activeChatId;
      return { sessions, activeChatId: fallbackId, pendingVideoConfirmation: null };
    });
  },

  sendMessage: async (input, forceVideo) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }

    const keywordRequestsVideo = /\bvideo\b/i.test(trimmed);
    const shouldAutoVideo = forceVideo || keywordRequestsVideo;

    const state = get();
    if (state.isSending) {
      return;
    }

    let activeChatId = state.activeChatId;
    let activeSession = activeChatId
      ? state.sessions.find((session) => session.id === activeChatId)
      : null;

    if (!activeSession) {
      const created = createInitialSession();
      await saveSession(created);

      set((current) => {
        const sessions = [created, ...current.sessions];
        saveSessionIndex(sessions);
        return { sessions, activeChatId: created.id, pendingVideoConfirmation: null };
      });

      activeChatId = created.id;
      activeSession = created;
    }

    if (!activeSession) {
      return;
    }

    if (!activeChatId) {
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      chatId: activeChatId,
      role: "user",
      content: trimmed,
      createdAt: nowIso(),
    };

    const assistantMessage: Message = {
      id: generateId(),
      chatId: activeChatId,
      role: "assistant",
      content: "Thinking...",
      createdAt: nowIso(),
    };

    const updatedSession: ChatSession = {
      ...activeSession,
      title: activeSession.messages.length === 0 ? trimmed.slice(0, 36) : activeSession.title,
      updatedAt: nowIso(),
      messages: [...activeSession.messages, userMessage, assistantMessage],
    };

    await saveSession(updatedSession);

    set((current) => {
      const sessions = current.sessions
        .map((session) => (session.id === activeChatId ? updatedSession : session))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      saveSessionIndex(sessions);
      return { sessions, isSending: true, pendingVideoConfirmation: null };
    });

    const analysis = shouldAutoVideo
      ? { shouldSuggestVideo: true, confidence: 1 }
      : await services.chatService.analyzeQuery(trimmed);

    if (!shouldAutoVideo && analysis.shouldSuggestVideo) {
      const promptSession: ChatSession = {
        ...updatedSession,
        updatedAt: nowIso(),
        messages: updatedSession.messages.map((message) => {
          if (message.id !== assistantMessage.id) {
            return message;
          }

          return {
            ...message,
            content: "This question is better explained visually. Do you want me to generate a video?",
          };
        }),
      };

      await saveSession(promptSession);

      set((current) => {
        const sessions = current.sessions.map((session) => {
          return session.id === activeChatId ? promptSession : session;
        });
        saveSessionIndex(sessions);
        return {
          sessions,
          isSending: false,
          pendingVideoConfirmation: {
            chatId: activeChatId,
            userMessageId: userMessage.id,
            assistantMessageId: assistantMessage.id,
            userQuestion: trimmed,
          },
        };
      });
      return;
    }

    if (shouldAutoVideo) {
      const withIntro: ChatSession = {
        ...updatedSession,
        messages: updatedSession.messages.map((message) => {
          if (message.id !== assistantMessage.id) {
            return message;
          }

          return {
            ...message,
            content: "Creating your visual explanation now.",
            video: { status: "processing", stageLabel: APP_CONFIG.videoProgressStages[0] },
          };
        }),
      };

      await saveSession(withIntro);
      set((current) => {
        const sessions = current.sessions.map((session) => {
          return session.id === activeChatId ? withIntro : session;
        });
        saveSessionIndex(sessions);
        return { sessions, isSending: false };
      });

      await get().confirmVideoGeneration(true, {
        chatId: activeChatId,
        userMessageId: userMessage.id,
        assistantMessageId: assistantMessage.id,
        userQuestion: trimmed,
      });
      return;
    }

    const textResponse = await services.chatService.generateTextReply(trimmed);
    const finalSession: ChatSession = {
      ...updatedSession,
      updatedAt: nowIso(),
      messages: updatedSession.messages.map((message) => {
        if (message.id !== assistantMessage.id) {
          return message;
        }

        return { ...message, content: textResponse };
      }),
    };

    await saveSession(finalSession);

    set((current) => {
      const sessions = current.sessions
        .map((session) => (session.id === activeChatId ? finalSession : session))
        .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
      saveSessionIndex(sessions);
      return { sessions, isSending: false };
    });
  },

  confirmVideoGeneration: async (confirm, overridePending) => {
    const state = get();
    const pending = overridePending ?? state.pendingVideoConfirmation;
    if (!pending) {
      return;
    }

    const activeSession = state.sessions.find((session) => session.id === pending.chatId);
    if (!activeSession) {
      return;
    }

    if (!confirm) {
      const declined: ChatSession = {
        ...activeSession,
        updatedAt: nowIso(),
        messages: activeSession.messages.map((message) => {
          if (message.id !== pending.assistantMessageId) {
            return message;
          }

          return {
            ...message,
            content:
              "No problem. I can continue with text explanation. Ask if you want video later.",
            video: undefined,
          };
        }),
      };

      await saveSession(declined);
      set((current) => {
        const sessions = current.sessions.map((session) => {
          return session.id === declined.id ? declined : session;
        });
        saveSessionIndex(sessions);
        return { sessions, pendingVideoConfirmation: null };
      });
      return;
    }

    const prepared: ChatSession = {
      ...activeSession,
      updatedAt: nowIso(),
      messages: activeSession.messages.map((message) => {
        if (message.id !== pending.assistantMessageId) {
          return message;
        }

        return {
          ...message,
          content: "Generating video steps...",
          video: { status: "processing", stageLabel: APP_CONFIG.videoProgressStages[0] },
        };
      }),
    };

    await saveSession(prepared);
    set((current) => {
      const sessions = current.sessions.map((session) => {
        return session.id === prepared.id ? prepared : session;
      });
      saveSessionIndex(sessions);
      return { sessions, pendingVideoConfirmation: null };
    });

    const applyProgress = async (stageLabel: string, status: VideoStatus) => {
      const latest = get().sessions.find((session) => session.id === pending.chatId);
      if (!latest) {
        return;
      }

      const progressed: ChatSession = {
        ...latest,
        updatedAt: nowIso(),
        messages: latest.messages.map((message) => {
          if (message.id !== pending.assistantMessageId) {
            return message;
          }

          return {
            ...message,
            video: {
              ...(message.video ?? { status: "processing" }),
              status,
              stageLabel,
            },
          };
        }),
      };

      await saveSession(progressed);
      set((current) => {
        const sessions = current.sessions.map((session) => {
          return session.id === progressed.id ? progressed : session;
        });
        saveSessionIndex(sessions);
        return { sessions };
      });
    };

    try {
      const result = await services.videoService.generateVideo(pending.userQuestion, (event) => {
        void applyProgress(event.stageLabel, event.status);
      });

      const latest = get().sessions.find((session) => session.id === pending.chatId);
      if (!latest) {
        return;
      }

      const done: ChatSession = {
        ...latest,
        updatedAt: nowIso(),
        messages: latest.messages.map((message) => {
          if (message.id !== pending.assistantMessageId) {
            return message;
          }

          return {
            ...message,
            content: "Video is ready.",
            video: {
              status: "ready",
              stageLabel: "completed",
              sourceUrl: result.sourceUrl,
              downloadUrl: result.downloadUrl,
              fileName: result.fileName,
            },
          };
        }),
      };

      await saveSession(done);
      set((current) => {
        const sessions = current.sessions.map((session) => {
          return session.id === done.id ? done : session;
        });
        saveSessionIndex(sessions);
        return { sessions };
      });
    } catch (error) {
      const latest = get().sessions.find((session) => session.id === pending.chatId);
      if (!latest) {
        return;
      }

      const errorMessage =
        error instanceof Error && error.message
          ? error.message
          : "Video generation failed";

      const failed: ChatSession = {
        ...latest,
        updatedAt: nowIso(),
        messages: latest.messages.map((message) => {
          if (message.id !== pending.assistantMessageId) {
            return message;
          }

          return {
            ...message,
            content: "Video generation failed. Please retry.",
            video: {
              status: "failed",
              stageLabel: "failed",
              error: errorMessage,
            },
          };
        }),
      };

      await saveSession(failed);
      set((current) => {
        const sessions = current.sessions.map((session) => {
          return session.id === failed.id ? failed : session;
        });
        saveSessionIndex(sessions);
        return { sessions };
      });
    }
  },
}));
