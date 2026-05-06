import type { ImageBlock } from "../../types/blocks";
import { useState } from "react";

interface ImageBlockProps {
  block: ImageBlock;
  updateBlock: (id: string, block: ImageBlock) => void;
  setActiveBlockID: React.Dispatch<React.SetStateAction<string | null>>;
  setRef: (el: HTMLInputElement | null) => void;
  moveFocus: (id: string, direction: "up" | "down") => void;
  insertBlock: (afterID: string) => string;
  deleteBlock: (id: string) => void;
}

export function ImageBlock({
  block,
  updateBlock,
  setActiveBlockID,
  setRef,
  moveFocus,
  insertBlock,
  deleteBlock,
}: ImageBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const handleOnFocus = () => {
    setActiveBlockID(block.id);
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, {
      ...block,
      data: { url: e.target.value },
    });
  };

  const handleAltChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateBlock(block.id, {
      ...block,
      data: { ...block.data, alt: e.target.value },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;

    if (e.key === "ArrowDown") {
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        moveFocus(block.id, "down");
      }
    }

    if (e.key === "ArrowUp") {
      if (input.selectionStart === 0) {
        e.preventDefault();
        moveFocus(block.id, "up");
      }
    }

    if (e.key === "Enter") {
      if (input.selectionStart === input.value.length) {
        e.preventDefault();
        const newID = insertBlock(block.id);
        moveFocus(newID, "down");
      }
    }
  };

  return (
    <div
      className="group relative flex items-start gap-1 -left-5"
      onFocus={handleOnFocus}
      id="input"
    >
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
                    setIsEditing(true);
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

      {/* Existing block content */}
      <div className="flex flex-col gap-y-2 w-full">
        {isEditing && (
          <div className="flex flex-col">
            <input
              type="text"
              value={block.data.url}
              placeholder="image url"
              onChange={handleUrlChange}
              className="bg-transparent border text-zinc-400 border-zinc-700/25 rounded px-2 py-1 text-sm outline-none"
              ref={setRef}
              onKeyDown={handleKeyDown}
            />
            <input
              type="text"
              value={block.data.alt || ""}
              onChange={handleAltChange}
              placeholder="alt text"
              className="bg-transparent border text-zinc-400 border-zinc-700/25 rounded px-2 py-1 text-sm outline-none"
              ref={setRef}
              onKeyDown={handleKeyDown}
            />
          </div>
        )}
        {block.data.url && !isEditing && (
          <img
            src={block.data.url}
            alt={block.data.alt || ""}
            className="rounded-md max-h-72 object-contain self-baseline"
            onClick={() => {
              setIsEditing(true);
              setTimeout(() => setActiveBlockID(block.id), 0);
            }}
          />
        )}
      </div>
    </div>
  );
}
