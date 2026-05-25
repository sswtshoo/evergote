import {
  parseCode,
  parseImage,
  parseParagraph,
  parseLink,
} from "./BlockParser";
import { v4 as uuid } from "uuid";
import type { AxiosInstance } from "axios";

import type { Block, ParagraphBlock } from "../../types/blocks";

export const ParseMarkdown = async (
  markdown: string,
  apiClient: AxiosInstance,
): Promise<Block[]> => {
  const blocks: Block[] = [];
  let emptyLineStreak = 0;

  let normalized = markdown.replace(/\r\n/g, "\n");
  const lines = normalized.split("\n");

  if (normalized[normalized.length - 1] !== "\n") {
    normalized += "\n";
  }
  let index = 0;
  while (index < lines.length) {
    const prevIndex = index;
    const line = lines[index].trim();

    if (line === "") {
      emptyLineStreak++;

      if (emptyLineStreak > 1) {
        const emptyBlock: ParagraphBlock = {
          id: uuid(),
          type: "paragraph",
          data: {
            text: "",
          },
        };
        blocks.push(emptyBlock);
        emptyLineStreak = 0;
      }

      index++;
      continue;
    }

    if (line.startsWith("```")) {
      const { block, nextIndex } = parseCode(lines, index);
      blocks.push(block);
      index = nextIndex;
      continue;
    }

    if (line.startsWith("![")) {
      const image = parseImage(line);
      if (image) {
        blocks.push(image);
        index++;
        continue;
      }
    }

    if (line.startsWith("[")) {
      const link = await parseLink(line, apiClient);
      if (link) {
        blocks.push(link);
        index++;
        continue;
      }
    }

    emptyLineStreak = 0;

    const { block, nextIndex } = parseParagraph(lines, index);
    blocks.push(block);
    index = nextIndex;

    if (index === prevIndex) {
      index++;
    }
  }

  return blocks;
};
