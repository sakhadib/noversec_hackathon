"use client";

import { useEffect, useRef, useState } from "react";
import type { ChatSession } from "@/domain/chat";

type Props = {
  brandName: string;
  email: string | null;
  sessions: ChatSession[];
  activeChatId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
  onSignOut: () => void;
};

export function ChatSidebar({
  brandName,
  email,
  sessions,
  activeChatId,
  onSelect,
  onCreate,
  onDelete,
  onRename,
  onSignOut,
}: Props) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{ id: string; title: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const sidebarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!openMenuId) {
        return;
      }

      const target = event.target as Node;
      const sidebar = sidebarRef.current;
      if (!sidebar) {
        return;
      }

      const menuRoot = (event.target as HTMLElement).closest("[data-menu-root='true']");
      if (!menuRoot || !sidebar.contains(target)) {
        setOpenMenuId(null);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setRenameTarget(null);
        setDeleteTarget(null);
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openMenuId]);

  const closeModals = () => {
    setRenameTarget(null);
    setDeleteTarget(null);
  };

  const submitRename = () => {
    if (!renameTarget) {
      return;
    }

    const trimmed = renameValue.trim();
    if (!trimmed) {
      return;
    }

    onRename(renameTarget.id, trimmed);
    setRenameTarget(null);
  };

  const confirmDelete = () => {
    if (!deleteTarget) {
      return;
    }

    onDelete(deleteTarget.id);
    setDeleteTarget(null);
  };

  return (
    <aside
      ref={sidebarRef}
      className="flex h-full min-h-0 flex-col border-r border-white/10 bg-[#2a2a2a] text-[#f3f2ec]"
    >
      <div className="border-b border-white/10 p-4">
        <p className="bg-[linear-gradient(120deg,_#ffffff,_#b6c7ff)] bg-clip-text text-2xl font-black tracking-wide text-transparent">
          {brandName}
        </p>
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 w-full rounded-md bg-[#4d4d4d] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5f5f5f]"
        >
          + New Chat
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-2">
        {sessions.map((session) => {
          const active = session.id === activeChatId;

          return (
            <div
              key={session.id}
              className={`group mb-1 flex items-center gap-1 rounded-md px-2 py-2 ${
                active ? "bg-[#3b3b3b]" : "hover:bg-[#343434]"
              }`}
            >
              <button
                type="button"
                onClick={() => onSelect(session.id)}
                className="min-w-0 flex-1 text-left"
              >
                <p className="truncate text-sm font-medium text-[#f3f2ec]">{session.title}</p>
              </button>

              <div className="relative" data-menu-root="true">
                <button
                  type="button"
                  onClick={() => {
                    setOpenMenuId((current) => (current === session.id ? null : session.id));
                  }}
                  className="rounded p-1 text-[#c4c4c4] hover:bg-[#434343]"
                  aria-label="Open chat options"
                >
                  ...
                </button>

                {openMenuId === session.id ? (
                  <div className="absolute right-0 top-7 z-20 w-28 rounded-md border border-white/15 bg-[#232323] p-1 shadow-lg">
                    <button
                      type="button"
                      className="block w-full rounded px-2 py-1 text-left text-xs hover:bg-[#3a3a3a]"
                      onClick={() => {
                        setRenameTarget({ id: session.id, title: session.title });
                        setRenameValue(session.title);
                        setOpenMenuId(null);
                      }}
                    >
                      Rename
                    </button>
                    <button
                      type="button"
                      className="mt-1 block w-full rounded px-2 py-1 text-left text-xs text-[#ff9da1] hover:bg-[#4a2d33]"
                      onClick={() => {
                        setDeleteTarget({ id: session.id, title: session.title });
                        setOpenMenuId(null);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-white/10 p-3">
        {email ? <p className="truncate text-xs text-[#c5c5c5]">{email}</p> : null}
        <button
          type="button"
          onClick={onSignOut}
          className="mt-2 w-full rounded-md border border-white/20 px-2 py-2 text-xs font-medium hover:bg-[#3b3b3b]"
        >
          Sign out
        </button>
      </div>

      {renameTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/15 bg-[#252525] p-4 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Rename chat</h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">Update the chat title.</p>
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(event) => setRenameValue(event.target.value)}
              className="mt-4 w-full rounded-md border border-white/20 bg-[#333333] px-3 py-2 text-sm text-white outline-none focus:border-[#9cb0e8]"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-md border border-white/20 px-3 py-2 text-sm text-[#d3d3d3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitRename}
                className="rounded-md bg-[#4d4d4d] px-3 py-2 text-sm font-medium text-white"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {deleteTarget ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-xl border border-white/15 bg-[#252525] p-4 shadow-xl">
            <h2 className="text-lg font-semibold text-white">Delete chat?</h2>
            <p className="mt-1 text-sm text-[#c7c7c7]">
              This will remove <span className="font-medium text-white">{deleteTarget.title}</span>.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={closeModals}
                className="rounded-md border border-white/20 px-3 py-2 text-sm text-[#d3d3d3]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-md bg-[#7a2f34] px-3 py-2 text-sm font-medium text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
