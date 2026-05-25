import * as motion from "motion/react-client";
import { useEffect, useState, useRef } from "react";
import { apiClient } from "./utils/ApiClient";
import type { Block } from "./types/blocks";
import { Editor, type EditorHandle } from "./components/editor/Editor";
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
  const [isSaving, setIsSaving] = useState(false);
  const editorRef = useRef<EditorHandle>(null);

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
      if (res.status === 200) setNotes(res.data);
    };
    getNotes();
  }, []);

  const previewNote = (content: string) => {
    return content
      .replace(/^"|"$/g, "")
      .replace(/\\n|\n/g, " ")
      .trim()
      .slice(0, 40);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const wordCount = blocks.reduce((acc, b) => {
    if (b.type === "paragraph") {
      return acc + b.data.text.trim().split(/\s+/).filter(Boolean).length;
    }
    return acc;
  }, 0);

  const handleNoteClick = async (note: userNote) => {
    let content = note.content;
    try {
      if (typeof content === "string" && content.startsWith('"'))
        content = JSON.parse(content);
    } catch (e) {
      console.log("Error parsing content:", e);
    }
    setActiveNote(note);
    const blocks = await ParseMarkdown(content, apiClient);
    setBlocks(blocks);
    setTimeout(() => editorRef.current?.focusFirstBlock(), 0);
  };

  const handleDeleteNote = async (e: React.MouseEvent, noteId: string) => {
    e.stopPropagation();
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
    setTimeout(() => editorRef.current?.focusFirstBlock(), 0);
  };

  const handleSaveNote = async () => {
    if (blocks.length === 0) return;
    setIsSaving(true);
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
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="h-screen flex bg-[#0e0d0c] overflow-hidden font-['Geist_Mono']">
      {/* Sidebar */}
      <aside className="w-52 shrink-0 flex flex-col border-r border-neutral-900 bg-[#0b0a09] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#1a1917]">
          <span className="font-['Geist_Mono'] text-[10px] tracking-[0.2em] uppercase text-neutral-700">
            notes
          </span>
          <motion.button
            onClick={handleCreateNote}
            className="w-6 h-6 flex items-center justify-center rounded-md border border-neutral-800 text-neutral-600 hover:text-amber-700 hover:border-neutral-700 hover:bg-[#1a1816] transition-colors duration-150 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="New note"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </motion.button>
        </div>

        {/* Notes count */}
        {notes.length > 0 && (
          <p className="font-['Geist_Mono'] text-[10px] tracking-wide uppercase text-neutral-800 px-4 pt-3 pb-1.5">
            {notes.length} note{notes.length !== 1 ? "s" : ""}
          </p>
        )}

        {/* Note list */}
        <div className="flex-1 overflow-y-auto py-1 px-2 scrollbar-thin">
          {notes.length === 0 ? (
            <div className="px-2 py-6 text-center">
              <p className="font-['Geist_Mono'] text-[11px] text-neutral-800">
                No notes yet
              </p>
            </div>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className="relative group/note flex items-center"
              >
                <motion.button
                  onClick={() => handleNoteClick(note)}
                  className={`flex-1 min-w-0 text-left px-2.5 py-2 rounded-md transition-colors duration-150 ${
                    activeNote?.id === note.id
                      ? "bg-[#161412]"
                      : "hover:bg-[#141210]"
                  }`}
                  whileHover={{ x: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  <p
                    className={`text-[13px] truncate leading-snug font-['Satoshi-Variable'] ${
                      activeNote?.id === note.id
                        ? "text-amber-700"
                        : "text-neutral-600"
                    }`}
                  >
                    {previewNote(note.content)}
                  </p>
                  <p className="font-['Geist_Mono'] text-[10px] text-neutral-800 mt-0.5">
                    {formatDate(note.updated_at)}
                  </p>
                </motion.button>

                <motion.button
                  onClick={(e) => handleDeleteNote(e, note.id)}
                  className="opacity-0 group-hover/note:opacity-100 shrink-0 w-5 h-5 flex items-center justify-center rounded text-neutral-700 hover:text-red-400/70 hover:bg-[#1e1511] transition-all duration-150 mr-1 cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Delete note"
                >
                  <svg
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M10 2L9 3H3v2h1.109l1.783 15.256C6.024 21.25 6.88 22 7.875 22h8.248c.995 0 1.85-.75 1.982-1.744L19.89 5H21V3h-6l-1-1h-4zM6.125 5h11.75l-1.752 15H7.875L6.125 5z" />
                  </svg>
                </motion.button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Editor panel */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="px-12 pt-5 shrink-0">
          <span className="font-['Geist_Mono'] text-[10px] tracking-[0.12em] uppercase text-neutral-800">
            {activeNote ? "Editing" : "New note"}
          </span>
        </div>

        {/* Scroll area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="max-w-2xl mx-auto px-12 pt-8">
            <Editor
              ref={editorRef}
              blocks={blocks}
              setBlocks={setBlocks}
              onClose={handleCreateNote}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 flex items-center justify-between px-12 py-3.5 border-t border-[#161412] bg-[#0b0a09]">
          <span className="font-['Geist_Mono'] text-[11px] text-neutral-800">
            {wordCount} {wordCount === 1 ? "word" : "words"}
          </span>
          <motion.button
            onClick={handleSaveNote}
            disabled={isSaving}
            className="font-['Geist_Mono'] text-[11px] font-medium tracking-[0.12em] uppercase text-amber-700 px-5 py-2 rounded-lg border border-neutral-800 bg-transparent hover:bg-[#1a1612] hover:border-amber-900 transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            {isSaving ? "Saving…" : activeNote ? "Save" : "Create note"}
          </motion.button>
        </div>
      </main>
    </div>
  );
}

export default App;
