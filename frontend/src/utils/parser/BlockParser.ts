import {
  type CodeBlock,
  type ParagraphBlock,
  type ImageBlock,
  type LinkBlock,
} from "../../types/blocks";
import { v4 as uuid } from "uuid";

const parseCode = (
  lines: string[],
  startIndex: number,
): { block: CodeBlock; nextIndex: number } => {
  let codeLines: string[] = [];
  let index = startIndex + 1;

  while (index < lines.length && !lines[index].trim().startsWith("```")) {
    codeLines.push(lines[index]);
    index++;
  }

  let nextIndex = index < lines.length ? index + 1 : index;
  if (nextIndex < lines.length && lines[nextIndex].trim() === "") {
    nextIndex += 1;
  }

  return {
    block: {
      id: uuid(),
      type: "code",
      data: {
        code: codeLines.join("\n"),
      },
    },
    nextIndex,
  };
};

const parseParagraph = (
  lines: string[],
  startIndex: number,
): { block: ParagraphBlock; nextIndex: number } => {
  let paragraphLines: string[] = [];
  let i = startIndex;

  while (i < lines.length) {
    const line = lines[i];

    if (
      line.trim() === "" ||
      line.trim().startsWith("```") ||
      parseImage(line) ||
      parseLink(line)
    ) {
      break;
    }
    paragraphLines.push(line);
    i++;
  }

  return {
    block: {
      id: uuid(),
      type: "paragraph",
      data: {
        text: paragraphLines.join("\n"),
      },
    },
    nextIndex: i,
  };
};

const parseLink = (line: string): LinkBlock | null => {
  const match = line.match(/^\[(.*?)\]\((.*?)\)$/);
  if (!match) return null;
  return {
    id: uuid(),
    type: "link",
    data: {
      title: match[1],
      url: match[2],
    },
  };
};

const parseImage = (line: string): ImageBlock | null => {
  const match = line.match(/^!\[(.*?)\]\((.*?)\)$/);
  if (!match) return null;
  return {
    id: uuid(),
    type: "image",
    data: {
      alt: match[1],
      url: match[2],
    },
  };
};

export { parseCode, parseImage, parseLink, parseParagraph };
