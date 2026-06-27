import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, CheckCircle } from 'lucide-react';

const ImportOverrideModal = ({ isOpen, onClose, onConfirm, row, isSubmitting }) => {
  const [reason, setReason] = useState("");

  // Reset state when opening
  useEffect(() => {
    if (isOpen) setReason("");
  }, [isOpen]);

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && !isSubmitting) onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen || !row) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col p-6 border-b border-gray-100 dark:border-gray-800 bg-orange-50 dark:bg-orange-900/10 relative">
            <button 
              onClick={onClose} 
              disabled={isSubmitting}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-white dark:hover:bg-gray-800 rounded-full transition disabled:opacity-50"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-2xl flex items-center justify-center mb-4">
              <ShieldAlert size={24} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Validation Override</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              You are forcefully validating Row #{row.rowNum} ({row.memberNumber || 'Unknown'}).
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4">
            
            {row.errors?.length > 0 && (
              <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                <p className="text-xs font-bold text-red-800 dark:text-red-400 uppercase tracking-wider mb-2">Original Errors</p>
                <ul className="list-disc pl-4 space-y-1">
                  {row.errors.map((err, i) => (
                    <li key={i} className="text-sm text-red-700 dark:text-red-300">{err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                Override Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why it is safe to bypass validation for this row..."
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 outline-none transition-all dark:text-white min-h-[100px] resize-y"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                This reason will be permanently recorded in the override audit log along with your admin details.
              </p>
            </div>
            
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(row.rowNum, reason)}
              disabled={isSubmitting || !reason.trim()}
              className="flex-1 py-3 text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition shadow-lg shadow-orange-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Overriding...</>
              ) : (
                <><CheckCircle size={18} /> Confirm Override</>
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImportOverrideModal;
