import type { Block } from "../../types/blocks";

export function BlocksToMarkdown(blocks: Block[]): string {
  const parts: string[] = [];
  blocks.forEach((block) => {
    switch (block.type) {
      case "image":
        parts.push(`![${block.data.alt || ""}](${block.data.url})`);
        break;
      case "link":
        parts.push(`[${block.data.title || ""}](${block.data.url})`);
        break;
      case "code":
        const code = block.data.code.trim();
        parts.push("```\n" + code + "\n```");
        break;
      case "paragraph": {
        const text = block.data.text.trim();
        if (text.length > 0) {
          parts.push(text);
        }
        break;
      }
      default:
        break;
    }
  });
  const markdown = parts.filter(Boolean).join("\n\n");
  return markdown.replace(/\n{3,}/g, "\n\n");
}
