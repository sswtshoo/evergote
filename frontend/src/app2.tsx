// import * as motion from "motion/react-client";
// import { useEffect, useState } from "react";
// import { useApiClient } from "./utils/ApiClient";
// import { AnimatePresence } from "motion/react";
// // import { NoteCard } from "./components/Card";
// import type { Block } from "./types/blocks";
// import { Editor } from "./components/editor/Editor";
// import { ParseMarkdown } from "./utils/parser/MarkdownParser";

// type userNote = {
//   id: string;
//   content: string;
//   created_at: string;
//   updated_at: string;
// };

// function App() {
//   const [activeBlockID, setActiveBlockID] = useState<string | null>(null);
//   const apiClient = useApiClient();
//   const [blocks, setBlocks] = useState<Block[]>([]);
//   const [isTakingNote, setIsTakingNote] = useState(false);
//   const [activeNote, setActiveNote] = useState<userNote | null>(null);
//   // const [blockContent, setBlockContent] = useState<string>("");

//   const handleGetNotes = async () => {
//     const res = await apiClient.get("/api/notes");

//     if (res.status == 200) {
//       // setNotes(res.data);
//     }
//   };

//   // const handleBlockContentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   //   const blocks = ParseMarkdown(e.target.value);
//   //   setBlockContent(e.target.value);
//   // };

//   const handleSaveNote = async () => {
//     if (blocks.length === 0) {
//       setIsTakingNote(false);
//       return;
//     }

//     // const rawMarkdownString = blocks.map(block => block.data).join('\n\n');
//     try {
//       if (activeNote) {
//         console.log("Updating note:", activeNote);
//         await apiClient.put("/api/notes", {
//           id: activeNote.id,
//           ...data,
//         });
//         setActiveNote(null);
//         await handleGetNotes();
//       } else {
//         await apiClient.post("/api/notes", data);
//         await handleGetNotes();
//       }

//       setIsTakingNote(false);
//       setActiveNote(null);
//     } catch (err) {
//       console.log(err);
//     }
//   };

//   useEffect(() => {
//     handleGetNotes();
//   }, []);

//   return (
//     <div className="min-h-screen bg-[#0f0f0e]">
//       <div className="flex flex-col items-center p-12 gap-8 relative">
//         <AnimatePresence>
//           {isTakingNote && (
//             <motion.div
//               className="fixed inset-0 z-50 flex items-center justify-center"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               layoutId="note"
//             >
//               <motion.div
//                 className="fixed inset-0 bg-black/60 backdrop-blur-sm z-10"
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 exit={{ opacity: 0 }}
//                 onClick={() => setIsTakingNote(false)}
//               />
//               <motion.div
//                 className="w-2/3 h-[70vh] flex flex-col border border-gray-100/10 bg-[#121211] shadow-2xl rounded-2xl p-6 absolute z-20"
//                 initial={{ opacity: 0, scale: 0.96 }}
//                 animate={{ opacity: 1, scale: 1 }}
//                 exit={{ opacity: 0, scale: 0.96 }}
//               >
//                 <Editor
//                   initialBlocks={[]}
//                   onSave={handleSaveNote}
//                   onClose={() => setIsTakingNote(false)}
//                 />
//                 <div className="mt-6 flex justify-end">
//                   <motion.button
//                     className="bg-linear-to-br from-zinc-100 to-zinc-300 text-zinc-900 px-5 py-2 rounded-md text-sm font-semibold hover:shadow-lg"
//                     whileHover={{ scale: 1.03 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={handleSaveNote}
//                   >
//                     {activeNote ? "Save note" : "Create note"}
//                   </motion.button>
//                 </div>
//               </motion.div>
//             </motion.div>
//           )}
//         </AnimatePresence>
//         {!isTakingNote && (
//           <motion.div
//             className="w-full max-w-xl"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             layoutId="note"
//           >
//             <motion.input
//               type="text"
//               placeholder="Create a new note…"
//               className="w-full text-neutral-300 text-md font-medium p-3 rounded-xl border border-neutral-600/40 bg-[#151514] focus:outline-none transition"
//               onClick={() => setIsTakingNote(true)}
//             />
//           </motion.div>
//         )}
//       </div>
//     </div>
//   );
// }

// export default App;
