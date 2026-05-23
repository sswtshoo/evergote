import {
  useState,
  useCallback,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import type { Block, ParagraphBlock } from "../../types/blocks";
import { v4 as uuid } from "uuid";
import { BlockRenderer } from "./BlockRenderer";

type EditorProps = {
  blocks: Block[];
  setBlocks: React.Dispatch<React.SetStateAction<Block[]>>;
  onClose: () => void;
};

export type EditorHandle = {
  focusFirstBlock: () => void;
};

export const Editor = forwardRef<EditorHandle, EditorProps>(
  ({ blocks, setBlocks }, ref) => {
    const [activeBlockID, setActiveBlockID] = useState<string | null>(null);
    const blockRefs = useRef<Record<string, HTMLElement | null>>({});
    const pendingFocusRef = useRef<string | null>(null);

    useImperativeHandle(ref, () => ({
      focusFirstBlock: () => {
        const firstBlock = blocks[0];
        if (!firstBlock) return;
        pendingFocusRef.current = firstBlock.id;
        const el = blockRefs.current[firstBlock.id];
        if (el) el.focus();
      },
    }));

    const updateBlock = useCallback(
      (id: string, updatedBlock: Block): void => {
        setBlocks((prev) =>
          prev.map((block) => (block.id === id ? updatedBlock : block)),
        );
      },
      [setBlocks],
    );

    const insertBlock = (afterID: string): string => {
      const newBlock: ParagraphBlock = {
        id: uuid(),
        type: "paragraph",
        data: {
          text: "",
        },
      };
      setBlocks((prev) => {
        const index = prev.findIndex((block) => block.id === afterID);
        if (index === -1) return prev;
        return [
          ...prev.slice(0, index + 1),
          newBlock,
          ...prev.slice(index + 1),
        ];
      });
      return newBlock.id;
    };

    const deleteBlock = (id: string) => {
      setBlocks((prevBlocks) => prevBlocks.filter((block) => block.id !== id));
    };

    // const replaceBlock = (id: string, newBlock: Block) => {
    //   setBlocks((prevBlocks) => {
    //     return prevBlocks.map((block) => (block.id === id ? newBlock : block));
    //   });
    // };

    const splitBlock = (blockId: string, cursor: number): void => {
      let newBlockID: string | null = null;
      setBlocks((prev) => {
        const index = prev.findIndex((block) => block.id === blockId);

        if (index === -1) return prev;

        const block = prev[index];
        if (block.type != "paragraph") return prev;

        const text = block.data.text;

        const before = text.slice(0, cursor);
        const after = text.slice(cursor);

        const newBlock: ParagraphBlock = {
          id: uuid(),
          type: "paragraph",
          data: {
            text: after,
          },
        };

        newBlockID = newBlock.id;

        const updated = [...prev];
        updated[index] = {
          ...block,
          data: { text: before },
        };

        updated.splice(index + 1, 0, newBlock);
        setTimeout(() => setActiveBlockID(newBlock.id), 0);

        return updated;
      });

      if (newBlockID) {
        pendingFocusRef.current = newBlockID;
        setActiveBlockID(newBlockID);
      }
    };

    const mergeBlocks = (blockId: string): void => {
      setBlocks((prev) => {
        const index = prev.findIndex((block) => block.id === blockId);
        if (index === -1 || index === 0) return prev;

        const currentBlock = prev[index];
        const prevBlock = prev[index - 1];

        if (currentBlock.type != "paragraph" || prevBlock.type != "paragraph")
          return prev;

        const mergedText = prevBlock.data.text + currentBlock.data.text;
        const updated = [...prev];
        updated[index - 1] = {
          ...prevBlock,
          data: { text: mergedText },
        };

        updated.splice(index, 1);
        return updated;
      });
    };

    const moveFocus = (currentBlockID: string, direction: "up" | "down") => {
      const index = blocks.findIndex((block) => block.id === currentBlockID);

      if (index === -1) return;

      if (direction === "down" && index < blocks.length - 1) {
        setActiveBlockID(blocks[index + 1].id);
      }
      if (direction === "up" && index > 0) {
        setActiveBlockID(blocks[index - 1].id);
      }
    };

    return (
      <div className="flex flex-col gap-y-4 text-white">
        {blocks.map((block) => (
          <BlockRenderer
            key={block.id}
            block={block}
            setActiveBlockID={setActiveBlockID}
            mergeBlocks={mergeBlocks}
            splitBlock={splitBlock}
            updateBlock={updateBlock}
            activeBlockID={activeBlockID}
            isActive={activeBlockID === block.id}
            moveFocus={moveFocus}
            deleteBlock={deleteBlock}
            insertBlock={insertBlock}
            setRef={(el) => {
              blockRefs.current[block.id] = el;
              if (el && pendingFocusRef.current === block.id) {
                el.focus();
                pendingFocusRef.current = null;
              }
            }}
          />
        ))}
      </div>
    );
  },
);
