import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Mail, Copy, X, ChevronDown, Download, FileSpreadsheet, FileText, Phone } from 'lucide-react';
import { useCommunication } from '../../hooks/useCommunication';

const BulkToolbar = ({ 
  selectedCount, 
  members, 
  onClear, 
  onBulkWhatsApp, 
  onBulkEmail,
  onExport 
}) => {
  const [copyMenuOpen, setCopyMenuOpen] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const comm = useCommunication();

  const waStats = comm.getValidWaContacts(members);
  const emailStats = comm.getValidEmailContacts(members);

  const toolbarContent = (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      {/* Left: Info Grid */}
      <div className="flex items-center gap-4 text-white w-full md:w-auto">
        <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs w-full md:w-auto">
          <p className="font-bold text-gray-200">Selected: <span className="text-white">{selectedCount}</span></p>
          <p className={waStats.valid.length === 0 ? "text-red-400" : "text-green-400 font-bold"}>WA Ready: {waStats.valid.length}</p>
          <p className={emailStats.valid.length === 0 ? "text-red-400" : "text-blue-400 font-bold"}>Email Ready: {emailStats.valid.length}</p>
          
          <p className="text-gray-400">Missing Mobile: {waStats.missingCount}</p>
          <p className="text-gray-400">Missing Email: {emailStats.missingCount}</p>
          <p className="text-orange-400">Duplicates: {Math.max(waStats.duplicateCount, emailStats.duplicateCount)}</p>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-center md:justify-end">
        <button 
          onClick={onBulkWhatsApp}
          disabled={waStats.valid.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
          title={waStats.missingCount > 0 ? `${waStats.missingCount} members missing mobile will be skipped` : undefined}
        >
          <MessageCircle size={16} /> Bulk WA
        </button>
        
        <button 
          onClick={onBulkEmail}
          disabled={emailStats.valid.length === 0}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-bold rounded-xl transition"
          title={emailStats.missingCount > 0 ? `${emailStats.missingCount} members missing email will be skipped` : undefined}
        >
          <Mail size={16} /> Bulk Email
        </button>

        {/* Copy Menu */}
        <div className="relative">
          <button 
            onClick={() => setCopyMenuOpen(!copyMenuOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-sm font-bold rounded-xl transition"
          >
            <Copy size={16} /> Copy <ChevronDown size={14} className={copyMenuOpen ? "rotate-180 transition" : "transition"}/>
          </button>

          <AnimatePresence>
            {copyMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                <div className="p-2 text-xs font-bold text-gray-500 uppercase">Mobile Numbers</div>
                <button onClick={() => { comm.copyToClipboard(comm.getCopyText(members, 'mobile', 'comma'), 'Numbers copied'); setCopyMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><Phone size={14} /> Comma Separated</button>
                <button onClick={() => { comm.copyToClipboard(comm.getCopyText(members, 'mobile', 'newline'), 'Numbers copied'); setCopyMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><Phone size={14} /> New-Line Separated</button>
                <div className="p-2 text-xs font-bold text-gray-500 uppercase border-t border-gray-100 dark:border-gray-700">WhatsApp Links</div>
                <button onClick={() => { comm.copyToClipboard(comm.getCopyText(members, 'wa-links', 'newline'), 'WhatsApp Links copied'); setCopyMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><MessageCircle size={14} className="text-green-500" /> Copy wa.me Links</button>
                <div className="p-2 text-xs font-bold text-gray-500 uppercase border-t border-gray-100 dark:border-gray-700">Email Addresses</div>
                <button onClick={() => { comm.copyToClipboard(comm.getCopyText(members, 'email', 'comma'), 'Emails copied'); setCopyMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><Mail size={14} className="text-blue-500" /> Comma Separated</button>
                <button onClick={() => { comm.copyToClipboard(comm.getCopyText(members, 'email', 'newline'), 'Emails copied'); setCopyMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><Mail size={14} className="text-blue-500" /> New-Line Separated</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Export Menu */}
        <div className="relative">
          <button 
            onClick={() => setExportMenuOpen(!exportMenuOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white text-sm font-bold rounded-xl transition"
          >
            <Download size={16} /> Export <ChevronDown size={14} className={exportMenuOpen ? "rotate-180 transition" : "transition"}/>
          </button>

          <AnimatePresence>
            {exportMenuOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full right-0 mb-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                <button onClick={() => { onExport('xlsx'); setExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><FileSpreadsheet size={16} className="text-green-600"/> Excel (.xlsx)</button>
                <button onClick={() => { onExport('csv'); setExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><FileText size={16} className="text-blue-600"/> CSV (.csv)</button>
                <button onClick={() => { onExport('json'); setExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><FileText size={16} className="text-orange-600"/> JSON (.json)</button>
                <button onClick={() => { onExport('vcf'); setExportMenuOpen(false); }} className="w-full text-left px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition flex items-center gap-2"><Phone size={16} className="text-purple-600"/> vCard (.vcf)</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-8 bg-gray-700 mx-1 hidden md:block"></div>

        <button 
          onClick={onClear}
          className="p-2.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-xl transition bg-gray-800/50"
          title="Clear selection"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <>
          {/* Desktop: Fixed bottom bar */}
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[98%] max-w-5xl hidden md:block"
          >
            <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-4 border border-gray-700">
              {toolbarContent}
            </div>
          </motion.div>

          {/* Mobile: Bottom sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
          >
            <div className="bg-gray-900 rounded-t-3xl shadow-2xl p-5 border-t border-gray-700 safe-area-bottom">
              {/* Handle Bar */}
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-4" />
              <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">{selectedCount} Members Selected</p>
              {toolbarContent}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BulkToolbar;
