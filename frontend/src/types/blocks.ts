export type BlockType = "paragraph" | "code" | "image" | "link";

export interface BaseBlock {
  id: string;
  type: BlockType;
}

export interface CodeBlock extends BaseBlock {
  type: "code";
  data: {
    code: string;
  };
}

export interface ImageBlock extends BaseBlock {
  type: "image";
  data: {
    url: string;
    alt?: string;
  };
}

export interface ParagraphBlock extends BaseBlock {
  type: "paragraph";
  data: {
    text: string;
  };
}

export interface LinkBlock extends BaseBlock {
  type: "link";
  data: {
    url: string;
    title?: string;
    description?: string;
    previewImage?: string;
  };
}

export type Block = ParagraphBlock | LinkBlock | CodeBlock | ImageBlock;
