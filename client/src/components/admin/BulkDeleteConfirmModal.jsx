import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";

const BulkDeleteConfirmModal = ({ isOpen, onClose, onConfirm, count, isDeleting }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={!isDeleting ? onClose : undefined}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertTriangle size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 font-heading mb-2">Delete {count} Members?</h2>
          
          <p className="text-gray-500 mb-8">
            This will permanently delete the selected members, their associated login accounts, and their profile photos. <span className="font-bold text-gray-700">This action cannot be undone.</span>
          </p>

          <div className="flex items-center gap-3 w-full">
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isDeleting ? <Loader2 size={18} className="animate-spin" /> : <AlertTriangle size={18} />}
              {isDeleting ? "Deleting..." : "Delete All"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BulkDeleteConfirmModal;
