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
    const getNotes = async () => {
      const res = await apiClient.get("/api/notes");
      if (res.status === 200) {
        setNotes(res.data);
      }
      console.log(notes);
    };

    getNotes();
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

  const handleNoteClick = async (note: userNote) => {
    let content = note.content;
    try {
      if (typeof content === "string" && content.startsWith('"')) {
        content = JSON.parse(content);
      }
    } catch (e) {
      console.log("Error parsing content:", e);
    }
    setActiveNote(note);
    const blocks = await ParseMarkdown(content, apiClient);
    setBlocks(blocks);
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation(); // prevent triggering handleNoteClick
    try {
      await apiClient.delete("/api/notes", { data: { id: noteId } });
      if (activeNote?.id === noteId) {
        setActiveNote(null);
        setBlocks(emptyBlocks());
      }
      await handleGetNotes();
    } catch (err) {
      console.log("Error deleting note:", err);
    }
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
            <div key={note.id} className="relative group/note">
              <button
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

              <button
                onClick={(e) => handleDeleteNote(e, note.id)}
                className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/note:opacity-100 transition-opacity p-1 rounded text-neutral-600 hover:text-red-400 hover:bg-neutral-800"
                aria-label="Delete note"
              >
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 14 14"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  <path d="M2 3.5h10M5.5 3.5V2.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1M5 3.5l.5 7.5h3l.5-7.5" />
                </svg>
              </button>
            </div>
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
