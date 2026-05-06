import * as motion from "motion/react-client";

interface Note {
  id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
}

type NoteCardProps = {
  note: Note;
  onClick: () => void;
};

export type { Note };

export const NoteCard = ({ note, onClick }: NoteCardProps) => {
  return (
    <motion.div
      className="p-5 flex flex-col gap-3 bg-[#1f1f1d] border border-neutral-600/40 cursor-pointer hover:border-orange-300/40"
      whileHover={{
        boxShadow: "0px 10px 30px rgba(0,0,0,0.4)",
      }}
      onClick={onClick}
    >
      <p className="text-zinc-200 text-xl font-semibold truncate">
        {note.title || "Untitled"}
      </p>
      <p className="text-zinc-400 text-sm line-clamp-5">{note.content}</p>
    </motion.div>
  );
};
