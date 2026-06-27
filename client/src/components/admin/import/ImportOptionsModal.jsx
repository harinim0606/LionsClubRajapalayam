import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Server, DownloadCloud, AlertTriangle, Key } from 'lucide-react';

const ImportOptionsModal = ({ isOpen, onClose, onConfirm, isImporting, stats, selectedCount }) => {
  const [options, setOptions] = useState({
    conflictResolution: 'skip', // 'skip', 'update', 'replace'
    createUsers: true,
    reports: {
      credentials: true,
      errors: true,
      vcf: true,
      csv: true,
      json: true
    }
  });

  // ESC to close
  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape' && !isImporting) onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, isImporting, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        onClick={(e) => { if (e.target === e.currentTarget && !isImporting) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex flex-col p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 relative">
            <button 
              onClick={onClose} 
              disabled={isImporting}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:bg-white dark:hover:bg-gray-700 rounded-full transition disabled:opacity-50"
            >
              <X size={20} />
            </button>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mb-4">
              <DownloadCloud size={24} />
            </div>
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Confirm Import Options</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
              You are about to import <span className="font-bold text-gray-900 dark:text-white">{selectedCount}</span> selected records.
            </p>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[60vh]">
            
            {/* Conflict Resolution */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Server size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Existing Member Handling</h3>
              </div>
              
              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 transition cursor-pointer ${options.conflictResolution === 'skip' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="conflict" 
                  checked={options.conflictResolution === 'skip'} 
                  onChange={() => setOptions(prev => ({ ...prev, conflictResolution: 'skip' }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Skip Existing Records</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">If a member number already exists in the database, it will be ignored.</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 transition cursor-pointer ${options.conflictResolution === 'update' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="conflict" 
                  checked={options.conflictResolution === 'update'} 
                  onChange={() => setOptions(prev => ({ ...prev, conflictResolution: 'update' }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Update Existing Records</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">If a member number exists, overwrite empty fields with Excel data.</p>
                </div>
              </label>

              <label className={`flex items-start gap-3 p-4 rounded-xl border-2 transition cursor-pointer ${options.conflictResolution === 'replace' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'}`}>
                <input 
                  type="radio" 
                  name="conflict" 
                  checked={options.conflictResolution === 'replace'} 
                  onChange={() => setOptions(prev => ({ ...prev, conflictResolution: 'replace' }))}
                  className="mt-1"
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Replace Existing Records</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Forcefully overwrite all fields for existing members with Excel data.</p>
                </div>
              </label>
              
              {['update', 'replace'].includes(options.conflictResolution) && stats.duplicateDbCount > 0 && (
                <div className="flex gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 rounded-lg text-xs font-medium">
                  <AlertTriangle size={16} className="shrink-0" />
                  <p>You have selected {stats.duplicateDbCount} database duplicates. They will be modified.</p>
                </div>
              )}
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

            {/* User Account Creation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Key size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Account Generation</h3>
              </div>

              <label className="flex items-start gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={options.createUsers} 
                  onChange={(e) => setOptions(prev => ({ ...prev, createUsers: e.target.checked }))}
                  className="mt-1 rounded text-[#0A2A5E] focus:ring-[#0A2A5E]"
                />
                <div>
                  <p className="font-bold text-gray-900 dark:text-white text-sm">Create Login Accounts</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    Automatically create usernames (Member No) and passwords for new members.
                  </p>
                </div>
              </label>
            </div>

            <div className="w-full h-px bg-gray-100 dark:bg-gray-800" />

            {/* Report Generation */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <DownloadCloud size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-900 dark:text-white">Generate Reports</h3>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries({
                  credentials: "Credentials (.xlsx)",
                  errors: "Errors (.xlsx)",
                  vcf: "VCF Contacts",
                  csv: "CSV Export",
                  json: "JSON Export"
                }).map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg cursor-pointer">
                    <input 
                      type="checkbox"
                      checked={options.reports[key]}
                      onChange={(e) => setOptions(prev => ({ ...prev, reports: { ...prev.reports, [key]: e.target.checked } }))}
                      className="rounded text-[#0A2A5E] focus:ring-[#0A2A5E]"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex gap-3">
            <button 
              onClick={onClose}
              disabled={isImporting}
              className="flex-1 py-3 text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-xl transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={() => onConfirm(options)}
              disabled={isImporting || selectedCount === 0}
              className="flex-[2] py-3 text-sm font-bold text-white bg-[#0A2A5E] hover:bg-[#071D43] rounded-xl transition shadow-lg shadow-blue-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {isImporting ? (
                <><span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> Processing...</>
              ) : (
                `Execute Import (${selectedCount})`
              )}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImportOptionsModal;
