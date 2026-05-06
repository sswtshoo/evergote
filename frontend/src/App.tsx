import * as motion from "motion/react-client";
import { useEffect, useState } from "react";
import { useApiClient } from "./utils/ApiClient";
import type { Block } from "./types/blocks";
import { Editor } from "./components/editor/Editor";
import { ParseMarkdown } from "./utils/parser/MarkdownParser";
import { BlocksToMarkdown } from "./utils/parser/BlocksToMarkdown";
import { v4 as uuid } from "uuid";

type userNote = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const emptyBlocks = (): Block[] => [
  { id: uuid(), type: "paragraph", data: { text: "" } },
];

function App() {
  const [notes, setNotes] = useState<userNote[]>([]);
  const [blocks, setBlocks] = useState<Block[]>(emptyBlocks());
  const [activeNote, setActiveNote] = useState<userNote | null>(null);
  const apiClient = useApiClient();

  const handleGetNotes = async () => {
    try {
      const res = await apiClient.get("/api/notes");
      if (res.status === 200) setNotes(res.data);
    } catch (err) {
      console.log("error fetching: ", err);
    }
  };

  useEffect(() => {
    handleGetNotes();
  }, []);

  const previewNote = (content: string) => {
    return content
      .replace(/^"|"$/g, "")
      .replace(/\\n|\n/g, " ")
      .trim()
      .slice(0, 30);
  };

  const formatDate = (dateStr: string) => {
    // console.log(dateStr);
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? "" : d.toLocaleDateString();
  };

  const handleNoteClick = (note: userNote) => {
    let content = note.content;
    try {
      if (typeof content === "string" && content.startsWith('"')) {
        content = JSON.parse(content);
      }
    } catch (e) {
      console.log("Error parsing content:", e);
    }
    setActiveNote(note);
    setBlocks(ParseMarkdown(content));
  };

  const handleCreateNote = () => {
    setActiveNote(null);
    setBlocks(emptyBlocks());
  };

  const handleSaveNote = async () => {
    if (blocks.length === 0) return;
    const markdownText = BlocksToMarkdown(blocks);
    try {
      if (activeNote) {
        await apiClient.put("/api/notes", {
          id: activeNote.id,
          content: markdownText,
        });
      } else {
        await apiClient.post("/api/notes", { content: markdownText });
      }
      setActiveNote(null);
      setBlocks(emptyBlocks());
      await handleGetNotes();
    } catch (err) {
      console.log("Error saving note:", err);
    }
  };

  return (
    <div className="h-screen flex bg-[#0f0f0e] overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 shrink-0 flex flex-col border-r border-neutral-800 bg-[#111110]">
        <div className="p-4 border-b border-neutral-800">
          <motion.button
            className="w-full text-left text-sm text-neutral-400 px-3 py-2 rounded-lg border border-neutral-700/50 bg-[#151514] hover:border-neutral-600 transition"
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateNote}
          >
            + New note
          </motion.button>
        </div>

        <div className="flex-1 overflow-y-auto py-2">
          {notes.map((note) => (
            <button
              key={note.id}
              onClick={() => handleNoteClick(note)}
              className={`w-full text-left px-4 py-3 transition hover:bg-neutral-800/50 border-l-2 ${
                activeNote?.id === note.id
                  ? "border-neutral-400 bg-neutral-800/40"
                  : "border-transparent"
              }`}
            >
              <p className="text-neutral-300 text-sm line-clamp-1 leading-snug">
                {previewNote(note.content)}
              </p>
              <p className="text-neutral-600 text-xs mt-1">
                {formatDate(note.updated_at)}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Editor pane */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-2xl mx-auto">
            <Editor
              blocks={blocks}
              setBlocks={setBlocks}
              onClose={handleCreateNote}
            />
          </div>
        </div>

        <div className="px-8 py-4 border-t border-neutral-800 flex justify-end">
          <motion.button
            className="bg-linear-to-br from-zinc-100 to-zinc-300 text-zinc-900 px-5 py-2 rounded-md text-sm font-semibold"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSaveNote}
          >
            {activeNote ? "Save note" : "Create note"}
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default App;
