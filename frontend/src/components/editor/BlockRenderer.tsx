import { CodeBlock } from "../blocks/CodeBlock";
import { ParagraphBlock } from "../blocks/ParagraphBlock";
import { LinkBlock } from "../blocks/LinkBlock";
import { ImageBlock } from "../blocks/ImageBlock";
import type { Block } from "../../types/blocks";
import React from "react";

interface BlockRendererProps {
  block: Block;
  updateBlock: (id: string, updatedBlock: Block) => void;
  splitBlock: (blockId: string, cursor: number) => void;
  mergeBlocks: (blockId: string) => void;
  setActiveBlockID: React.Dispatch<React.SetStateAction<string | null>>;
  activeBlockID: string | null;
  isActive: boolean;
  moveFocus: (currentBlockID: string, direction: "up" | "down") => void;
  setRef: (el: HTMLElement | null) => void;
  deleteBlock: (id: string) => void;
  insertBlock: (afterID: string) => string;
}

const BlockRendererComponent = (props: BlockRendererProps) => {
  switch (props.block.type) {
    case "paragraph":
      return (
        <ParagraphBlock
          block={props.block}
          updateBlock={props.updateBlock}
          mergeBlocks={props.mergeBlocks}
          splitBlock={props.splitBlock}
          setActiveBlockID={props.setActiveBlockID}
          isActive={props.isActive}
          moveFocus={props.moveFocus}
          setRef={props.setRef}
          deleteBlock={props.deleteBlock}
        />
      );
    case "code":
      return (
        <CodeBlock
          block={props.block}
          updateBlock={props.updateBlock}
          setActiveBlockID={props.setActiveBlockID}
          moveFocus={props.moveFocus}
          mergeBlocks={props.mergeBlocks}
          splitBlock={props.splitBlock}
          setRef={props.setRef}
          deleteBlock={props.deleteBlock}
        />
      );
    case "image":
      return (
        <ImageBlock
          block={props.block}
          updateBlock={props.updateBlock}
          setActiveBlockID={props.setActiveBlockID}
          setRef={props.setRef}
          moveFocus={props.moveFocus}
          insertBlock={props.insertBlock}
          deleteBlock={props.deleteBlock}
        />
      );
    case "link":
      return (
        <LinkBlock
          block={props.block}
          updateBlock={props.updateBlock}
          setActiveBlockID={props.setActiveBlockID}
          setRef={props.setRef}
          moveFocus={props.moveFocus}
          insertBlock={props.insertBlock}
          deleteBlock={props.deleteBlock}
        />
      );
    default:
      return null;
  }
};

export const BlockRenderer = React.memo(BlockRendererComponent);
