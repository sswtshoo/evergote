import { useState, useRef } from "react";
import type { LinkBlock } from "../../types/blocks";

interface LinkBlockProps {
  block: LinkBlock;
  updateBlock: (id: string, block: LinkBlock) => void;
  setActiveBlockID: React.Dispatch<React.SetStateAction<string | null>>;
  setRef: (el: HTMLElement | null) => void;
  moveFocus: (blockID: string, direction: "up" | "down") => void;
  insertBlock: (afterID: string) => string;
  deleteBlock: (id: string) => void;
}

export function LinkBlock({
  block,
  updateBlock,
  setActiveBlockID,
  setRef,
  moveFocus,
  insertBlock,
  deleteBlock,
}: LinkBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [rawText, setRawText] = useState("");
  const isClickRef = useRef(false);

  const normalizeUrl = (url: string) => {
    if (!url) return "";
    return /^https?:\/\//i.test(url) ? url : `https://${url}`;
  };

  const parseMarkdownLink = (text: string) => {
    const match = text.match(/^\[(.*)]\((.*)\)$/);
    if (match) return { title: match[1], url: match[2] };
    return null;
  };

  const toMarkdownLink = (title: string, url: string) => {
    return `[${title || url}](${url})`;
  };

  const enterEditing = () => {
    const display = toMarkdownLink(block.data.title || "", block.data.url);
    setRawText(display);
    setIsEditing(true);
    setActiveBlockID(block.id);
  };

  const commitEditing = () => {
    const parsed = parseMarkdownLink(rawText);
    if (parsed) {
      updateBlock(block.id, {
        ...block,
        data: { url: parsed.url, title: parsed.title },
      });
    } else if (rawText) {
      updateBlock(block.id, {
        ...block,
        data: { url: rawText, title: "" },
      });
    }
    setIsEditing(false);
  };

  const handleOnFocus = () => {
    if (isClickRef.current) {
      isClickRef.current = false;
      return;
    }
    enterEditing();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (e.key === "Enter") {
      e.preventDefault();
      commitEditing();
      const newID = insertBlock(block.id);
      moveFocus(newID, "down");
    }
    if (e.key === "ArrowDown" && input.selectionStart === input.value.length) {
      e.preventDefault();
      commitEditing();
      moveFocus(block.id, "down");
    }
    if (e.key === "ArrowUp" && input.selectionStart === 0) {
      e.preventDefault();
      commitEditing();
      moveFocus(block.id, "up");
    }
    if (e.key === "Escape") {
      commitEditing();
    }
  };

  return (
    <div className="group relative flex items-start gap-1 -left-5">
      <div className="flex items-center gap-0.5 pt-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <div className="relative">
          <button
            onMouseDown={(e) => {
              e.preventDefault();
              setShowMenu((prev) => !prev);
            }}
            className="p-0.5 rounded text-gray-500 hover:text-gray-300 hover:bg-[#323232]"
            aria-label="Block menu"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
              <circle cx="7" cy="2.5" r="1.2" />
              <circle cx="7" cy="7" r="1.2" />
              <circle cx="7" cy="11.5" r="1.2" />
            </svg>
          </button>
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onMouseDown={() => setShowMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-20 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md shadow-lg py-1 min-w-[140px]">
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowMenu(false);
                    enterEditing();
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-gray-300 hover:bg-[#323232] transition-colors"
                >
                  Edit
                </button>
                <button
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setShowMenu(false);
                    deleteBlock(block.id);
                  }}
                  className="w-full text-left px-3 py-1.5 text-sm text-red-400 hover:bg-[#323232] transition-colors"
                >
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Block content */}
      <div className="flex flex-col w-full">
        {isEditing ? (
          <input
            type="text"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            onBlur={commitEditing}
            onKeyDown={handleKeyDown}
            placeholder="[title](url) or just a url"
            className="bg-transparent border text-zinc-400 border-zinc-700/25 rounded px-2 py-1 text-sm outline-none font-mono"
            ref={setRef}
            autoFocus
          />
        ) : block.data.url ? (
          <a
            href={normalizeUrl(block.data.url)}
            target="_blank"
            rel="noopener noreferrer"
            onFocus={handleOnFocus}
            onMouseDown={() => {
              isClickRef.current = true;
              enterEditing();
            }}
            className="text-blue-400 hover:underline w-fit"
          >
            {block.data.title || block.data.url}
          </a>
        ) : (
          <span
            className="text-zinc-600 text-sm cursor-text"
            onClick={enterEditing}
          >
            Empty link — click to edit
          </span>
        )}
      </div>
    </div>
  );
}
