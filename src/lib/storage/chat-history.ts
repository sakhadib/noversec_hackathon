import { openDB } from "idb";
import type { ChatSession } from "@/domain/chat";

const DB_NAME = "strugglemap-db";
const STORE_NAME = "chat-sessions";
const META_KEY = "strugglemap-chat-index";

let dbPromise: ReturnType<typeof openDB> | null = null;

function getDbPromise() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: "id" });
        }
      },
    });
  }

  return dbPromise;
}

export async function saveSession(session: ChatSession): Promise<void> {
  const dbRef = getDbPromise();
  if (!dbRef) {
    return;
  }

  const db = await dbRef;
  await db.put(STORE_NAME, session);
}

export async function loadSession(id: string): Promise<ChatSession | null> {
  const dbRef = getDbPromise();
  if (!dbRef) {
    return null;
  }

  const db = await dbRef;
  return (await db.get(STORE_NAME, id)) ?? null;
}

export async function deleteSession(id: string): Promise<void> {
  const dbRef = getDbPromise();
  if (!dbRef) {
    return;
  }

  const db = await dbRef;
  await db.delete(STORE_NAME, id);
}

export function saveSessionIndex(sessions: ChatSession[]): void {
  if (typeof window === "undefined") {
    return;
  }

  const minimal = sessions.map((session) => ({
    id: session.id,
    title: session.title,
    createdAt: session.createdAt,
    updatedAt: session.updatedAt,
  }));
  localStorage.setItem(META_KEY, JSON.stringify(minimal));
}

export function loadSessionIndex(): Array<
  Pick<ChatSession, "id" | "title" | "createdAt" | "updatedAt">
> {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = localStorage.getItem(META_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
