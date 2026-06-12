import { useEffect, useRef } from "react";
import type { Block, ParagraphBlock } from "../../types/blocks";
import React from "react";

interface ParagraphBlockProps {
  block: ParagraphBlock;
  updateBlock: (id: string, updatedBlock: Block) => void;
  splitBlock: (blockId: string, cursor: number) => void;
  mergeBlocks: (blockId: string) => void;
  setActiveBlockID: React.Dispatch<React.SetStateAction<string | null>>;
  isActive: boolean;
  moveFocus: (currentBlockID: string, direction: "up" | "down") => void;
  setRef: (el: HTMLElement | null) => void;
  deleteBlock: (id: string) => void;
  replaceBlock: (id: string, newBlock: Block) => void;
}

export function ParagraphBlock({
  block,
  updateBlock,
  splitBlock,
  mergeBlocks,
  setActiveBlockID,
  isActive,
  moveFocus,
  setRef,
  deleteBlock,
  replaceBlock,
}: ParagraphBlockProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isActive) {
      const id = requestAnimationFrame(() => {
        textAreaRef.current?.focus();
      });
      return () => cancelAnimationFrame(id);
    }
  }, [isActive]);

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "auto";
      textAreaRef.current.style.height =
        textAreaRef.current.scrollHeight + "px";
    }
  }, [block.data.text]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value === "```") {
      replaceBlock(block.id, {
        id: block.id,
        type: "code",
        data: {
          code: "",
          language: "javascript",
        },
      });
      setActiveBlockID(block.id);
      return;
    }
    if (block.data.text !== e.target.value) {
      updateBlock(block.id, {
        ...block,
        data: { text: e.target.value },
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == "Enter") {
      e.preventDefault();
      const cursor = e.currentTarget.selectionStart;
      // console.log("cursor position:", cursor);
      splitBlock(block.id, cursor);
    }

    if (e.key == "Backspace" && e.currentTarget.selectionStart == 0) {
      e.preventDefault();
      if (block.data.text.trim() == "") {
        deleteBlock(block.id);
      } else {
        mergeBlocks(block.id);
      }
      setTimeout(() => {
        moveFocus(block.id, "up");
      }, 0);
    }

    if (e.key == "ArrowUp") {
      if (e.currentTarget.selectionStart === 0) {
        e.preventDefault();
        moveFocus(block.id, "up");
      }
    }

    if (e.key == "ArrowDown") {
      const ta = e.currentTarget;
      const { selectionStart, selectionEnd, value } = ta;

      const before = value.slice(0, selectionStart);
      const currentLineIndex = before.split("\n").length - 1;

      const lines = value.split("\n");
      const isLastLine = currentLineIndex === lines.length - 1;
      const isEndOfLine =
        selectionStart === value.length || value[selectionStart] === "\n";
      const isCollapsed = selectionStart === selectionEnd;

      if (isCollapsed && isLastLine && isEndOfLine) {
        e.preventDefault();
        moveFocus(block.id, "down");
      }
    }
  };

  return (
    <textarea
      value={block.data.text}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onFocus={() => setActiveBlockID(block.id)}
      rows={1}
      id="input"
      className="w-full resize-none outline-none py-2 px-2 focus:bg-[#232323] hover:bg-[#232323] leading-tight overflow-hidden rounded-md"
      ref={(el) => {
        textAreaRef.current = el;
        setRef(el);
      }}
    />
  );
}
