import type { CodeBlock } from "../../types/blocks";
import { useState, useEffect, useRef, useDeferredValue } from "react";
import { codeToHtml } from "shiki";

interface CodeBlockProps {
  block: CodeBlock;
  updateBlock: (id: string, updateBlock: CodeBlock) => void;
  setActiveBlockID: React.Dispatch<React.SetStateAction<string | null>>;
  moveFocus: (id: string, direction: "up" | "down") => void;
  mergeBlocks: (id: string) => void;
  splitBlock: (id: string, cursor: number) => void;
  setRef: (el: HTMLTextAreaElement | null) => void;
  deleteBlock: (id: string) => void;
}

export function CodeBlock({
  block,
  updateBlock,
  setActiveBlockID,
  moveFocus,
  mergeBlocks,
  splitBlock,
  setRef,
  deleteBlock,
}: CodeBlockProps) {
  const [highlightedCode, setHightlightedCode] = useState<string>("");
  const deferredCode = useDeferredValue(block.data.code);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (block.data.code !== e.target.value) {
      updateBlock(block.id, {
        ...block,
        data: { code: e.target.value },
      });
    }
  };

  const handleOnFocus = () => {
    setActiveBlockID(block.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textArea = e.currentTarget;

    if (e.key == "Tab") {
      e.preventDefault();

      const start = textArea.selectionStart;
      const end = textArea.selectionEnd;

      const value = block.data.code;
      const newValue = value.substring(0, start) + "\t" + value.substring(end);

      updateBlock(block.id, {
        ...block,
        data: { code: newValue },
      });

      requestAnimationFrame(() => {
        textArea.selectionStart = textArea.selectionEnd = start + 1;
      });
    }

    if (e.key == "Enter") {
      const start = textArea.selectionStart;
      const value = block.data.code;

      if (value === "") {
        e.preventDefault();
        splitBlock(block.id, start);
        setTimeout(() => moveFocus(block.id, "down"), 0);
        return;
      }

      e.preventDefault();

      const before = value.substring(0, start);
      const currentLine = before.split("\n").pop() || "";

      const indentMatch = currentLine.match(/^\s*/);
      const indent = indentMatch ? indentMatch[0] : "";

      const newValue =
        value.substring(0, start) + "\n" + indent + value.substring(start);

      updateBlock(block.id, {
        ...block,
        data: { code: newValue },
      });

      requestAnimationFrame(() => {
        const newPosition = start + 1 + indent.length;
        textArea.selectionStart = textArea.selectionEnd = newPosition;
      });
    }

    if (
      e.key === "Backspace" &&
      textArea.selectionStart === 0 &&
      textArea.selectionEnd === 0
    ) {
      e.preventDefault();
      mergeBlocks(block.id);
      setTimeout(() => moveFocus(block.id, "up"), 0);
    }

    if (e.key === "ArrowDown") {
      if (textArea.selectionStart === block.data.code.length) {
        e.preventDefault();
        moveFocus(block.id, "down");
      }
    }

    if (e.key === "ArrowUp") {
      if (textArea.selectionStart === 0) {
        e.preventDefault();
        moveFocus(block.id, "up");
      }
    }
  };

  useEffect(() => {
    if (highlightRef.current && textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
      highlightRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }

    const highlight = async () => {
      const html = await codeToHtml(deferredCode, {
        lang: "typescript",
        theme: "dark-plus",
      });

      setHightlightedCode(html);
    };

    highlight();
  }, [deferredCode]);

  return (
    <div className="group relative flex items-start gap-1 -left-5">
      <div className="flex items-center gap-0.5 pt-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
              {/* Backdrop to close menu */}
              <div
                className="fixed inset-0 z-10"
                onMouseDown={() => setShowMenu(false)}
              />
              <div className="absolute left-0 top-full mt-1 z-20 bg-[#2a2a2a] border border-[#3a3a3a] rounded-md shadow-lg py-1 min-w-[140px]">
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
      <div className="w-full relative overflow-hidden">
        <div
          ref={highlightRef}
          className="absolute inset-0 w-full pointer-events-none [&_pre]:m-0 [&_pre]:p-2 [&_pre]:py-4 [&_pre]:h-full [&_pre]:bg-transparent [&_pre]:font-mono [&_pre]:whitespace-pre [&_pre]:box-border [&_code]:block [&_pre]:text-sm [&_pre]:rounded-md"
          dangerouslySetInnerHTML={{ __html: highlightedCode }}
          style={{ fontFamily: "monospace" }}
        />
        <textarea
          ref={(el) => {
            textAreaRef.current = el;
            setRef(el);
          }}
          value={block.data.code}
          onChange={handleChange}
          onFocus={handleOnFocus}
          onKeyDown={handleKeyDown}
          className="relative w-full font-mono text-sm p-2 py-4 bg-transparent text-transparent caret-white resize-none overflow-hidden outline-none whitespace-pre box-border rounded-md"
          rows={1}
          spellCheck={false}
          id="input"
          style={{ fontFamily: "monospace" }}
        />
      </div>
    </div>
  );
}
