import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";

const STAGES = [
  { id: "prepare", label: "Preparing Data", icon: "📋", description: "Fetching member records from database..." },
  { id: "generate", label: "Generating Workbook", icon: "⚙️", description: "Building Excel sheets and structure..." },
  { id: "format", label: "Formatting Sheets", icon: "🎨", description: "Applying professional styling and borders..." },
  { id: "download", label: "Downloading", icon: "⬇️", description: "Sending file to your browser..." },
];

const ExportProgressModal = ({ isOpen, stage, exportType, totalRows, onClose, hasError, errorMessage }) => {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStageIndex(0);
      setCompleted(false);
      return;
    }

    // Simulate stage progression for better UX
    const idx = STAGES.findIndex(s => s.id === stage);
    if (idx !== -1) setCurrentStageIndex(idx);
    if (stage === "done") setCompleted(true);
  }, [isOpen, stage]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white dark:bg-[#1E293B] rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#071D43] to-[#0A2A5E] p-6 text-white">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F4B400]/20 flex items-center justify-center">
                <FileSpreadsheet size={24} className="text-[#F4B400]" />
              </div>
              <div>
                <h2 className="text-xl font-bold font-heading">Exporting to Excel</h2>
                <p className="text-blue-200 text-sm capitalize">{exportType} Export{totalRows ? ` · ${totalRows.toLocaleString()} rows` : ""}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {hasError ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                  <XCircle size={32} className="text-red-500" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Export Failed</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{errorMessage || "An unexpected error occurred."}</p>
                </div>
                <button onClick={onClose} className="px-6 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                  Close
                </button>
              </div>
            ) : completed ? (
              <div className="flex flex-col items-center gap-4 py-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                >
                  <CheckCircle2 size={32} className="text-green-500" />
                </motion.div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 dark:text-white text-lg">Export Complete!</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your file has been downloaded successfully.</p>
                </div>
                <button onClick={onClose} className="px-6 py-2.5 bg-[#0A2A5E] dark:bg-[#F4B400] text-white dark:text-black rounded-xl font-bold hover:opacity-90 transition">
                  Done
                </button>
              </div>
            ) : (
              <>
                {/* Stage Progress */}
                <div className="space-y-3 mb-5">
                  {STAGES.map((s, idx) => {
                    const isDone = idx < currentStageIndex;
                    const isCurrent = idx === currentStageIndex;
                    const isPending = idx > currentStageIndex;
                    return (
                      <motion.div
                        key={s.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition ${
                          isCurrent ? "bg-[#0A2A5E]/8 dark:bg-[#F4B400]/10" : ""
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition ${
                          isDone ? "bg-green-100 dark:bg-green-900/30" :
                          isCurrent ? "bg-[#0A2A5E] dark:bg-[#F4B400]" :
                          "bg-gray-100 dark:bg-gray-800"
                        }`}>
                          {isDone ? (
                            <CheckCircle2 size={16} className="text-green-500" />
                          ) : isCurrent ? (
                            <div className="w-4 h-4 border-2 border-white/30 dark:border-black/30 border-t-white dark:border-t-black rounded-full animate-spin" />
                          ) : (
                            <span className="text-xs">{s.icon}</span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-bold ${
                            isDone ? "text-green-600 dark:text-green-400" :
                            isCurrent ? "text-[#0A2A5E] dark:text-[#F4B400]" :
                            "text-gray-400 dark:text-gray-600"
                          }`}>{s.label}</p>
                          {isCurrent && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{s.description}</p>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {/* Progress Bar */}
                <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#0A2A5E] to-[#F4B400] rounded-full"
                    initial={{ width: "5%" }}
                    animate={{ width: `${Math.max(5, ((currentStageIndex + 0.5) / STAGES.length) * 100)}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Step {currentStageIndex + 1} of {STAGES.length}
                </p>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ExportProgressModal;
