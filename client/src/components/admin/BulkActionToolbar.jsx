import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Download, X, Loader2, CheckCircle2 } from "lucide-react";

const BulkActionToolbar = ({ 
  selectedCount, 
  totalMatching, 
  visibleCount, 
  onClear, 
  onDelete, 
  onExport, 
  onSelectAllMatching,
  isSelectingAll
}) => {
  // If they've selected everything on the current page, and there are more pages
  const isPageFullySelected = selectedCount > 0 && selectedCount === visibleCount;
  const hasMoreMatching = totalMatching > visibleCount && selectedCount < totalMatching;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: -20, height: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="overflow-hidden"
    >
      <div className="bg-[#0A2A5E] rounded-2xl shadow-lg border border-[#0A2A5E]/20 overflow-hidden flex flex-col">
        
        {/* Banner for "Select All Matching" */}
        <AnimatePresence>
          {isPageFullySelected && hasMoreMatching && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-[#071D43] px-6 py-3 flex items-center justify-center gap-3 border-b border-white/10"
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span className="text-sm font-medium text-blue-100">
                All {visibleCount} members on this page are selected.
              </span>
              <button
                onClick={onSelectAllMatching}
                disabled={isSelectingAll}
                className="text-sm font-bold text-white hover:text-blue-200 underline underline-offset-2 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:no-underline"
              >
                {isSelectingAll && <Loader2 size={14} className="animate-spin" />}
                Select all {totalMatching} matching members
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Toolbar */}
        <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm font-black text-white">{selectedCount}</span>
            </div>
            <span className="text-base font-bold text-white tracking-wide">
              Members Selected
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onDelete}
              className="px-4 py-2 bg-red-500/10 text-red-100 hover:bg-red-500 hover:text-white border border-red-500/20 hover:border-red-500 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <Trash2 size={16} /> Delete Selected
            </button>
            
            <button
              onClick={onExport}
              className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 border border-white/10 hover:border-white/20 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
            >
              <Download size={16} /> Export Selected
            </button>

            <div className="w-px h-6 bg-white/20 mx-1 hidden sm:block" />

            <button
              onClick={onClear}
              className="p-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Clear Selection"
              aria-label="Clear Selection"
            >
              <X size={20} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );
};

export default React.memo(BulkActionToolbar);
