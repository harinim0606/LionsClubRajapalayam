import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, MessageCircle, ChevronRight, CheckCircle2 } from 'lucide-react';

const BatchModal = ({ isOpen, onClose, batches, type }) => {
  const [activeBatchIndex, setActiveBatchIndex] = useState(0);
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [batchOpened, setBatchOpened] = useState([]);  // track which email batches were opened

  // Reset state when modal opens; ESC closes
  useEffect(() => {
    if (isOpen) {
      setActiveBatchIndex(0);
      setSequenceIndex(0);
      setBatchOpened([]);
    }
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWa = type === 'whatsapp';
  const Icon = isWa ? MessageCircle : Mail;
  const colorClass = isWa ? 'text-green-500 bg-green-100 dark:bg-green-900/30' : 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
  
  const activeBatch = batches[activeBatchIndex];
  const isSequenceFinished = isWa 
    ? (activeBatch && sequenceIndex >= activeBatch.sequence.length)
    : (activeBatch && batchOpened.includes(activeBatchIndex));

  const handleNextBatch = () => {
    if (activeBatchIndex < batches.length - 1) {
      setActiveBatchIndex(activeBatchIndex + 1);
      setSequenceIndex(0);
    } else {
      onClose();
    }
  };

  const handleOpenChat = () => {
    if (!activeBatch) return;
    if (isWa) {
      const currentMsg = activeBatch.sequence[sequenceIndex];
      if (currentMsg) {
        window.open(currentMsg.url, '_blank');
        // Auto advance sequenceIndex after a short delay so the button still says Next
        setSequenceIndex(prev => prev + 1);
      }
    } else {
      // Email: open BCC batch
      window.open(activeBatch.url, '_self');
      setBatchOpened(prev => [...prev, activeBatchIndex]);
    }
  };

  // Batch range label e.g. "Members 1–50"
  const getBatchRangeLabel = (batchIdx) => {
    const batchSize = batches[batchIdx]?.sequence?.length || batches[batchIdx]?.totalInBatch || 0;
    const start = batchIdx * batchSize + 1;
    const end = start + batchSize - 1;
    return `Members ${start}–${end}`;
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">
                  Send Bulk {isWa ? 'WhatsApp' : 'Email'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Batch {activeBatchIndex + 1} of {batches.length}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 flex-1 overflow-y-auto">
            {/* Batch Selector - only show if multiple batches and not yet started */}
            {batches.length > 1 && (
              <div className="mb-6">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Batches</p>
                <div className="grid grid-cols-1 gap-2">
                  {batches.map((batch, i) => {
                    const batchSize = batch?.sequence?.length || batch?.totalInBatch || 0;
                    const rangeStart = i * batchSize + 1;
                    const rangeEnd = rangeStart + batchSize - 1;
                    const isActive = i === activeBatchIndex;
                    const isEmailOpened = !isWa && batchOpened.includes(i);
                    const isWaDone = isWa && i < activeBatchIndex;
                    const isDone = isEmailOpened || isWaDone;

                    return (
                      <button
                        key={i}
                        onClick={() => { setActiveBatchIndex(i); setSequenceIndex(0); }}
                        className={`flex items-center justify-between p-3 rounded-xl border transition text-left ${
                          isActive 
                            ? 'border-blue-400 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                            : isDone
                            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10 opacity-70'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        <div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white">Batch {batch.batchNumber}</p>
                          <p className="text-xs text-gray-500">Members {rangeStart}–{rangeEnd} · {batchSize} Recipients</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                          isDone ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' :
                          isActive ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-500'
                        }`}>
                          {isDone ? '✓ Done' : isActive ? 'Active' : 'Ready'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WhatsApp Sequential Player */}
            {isWa && activeBatch && (
              <div className="text-center">
                {isSequenceFinished ? (
                  <div className="py-8">
                    <CheckCircle2 size={48} className="text-green-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Batch {activeBatchIndex + 1} Complete!</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">All {activeBatch.sequence.length} messages opened.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-xl text-xs text-left mb-6 leading-relaxed">
                      <strong>Why sequence?</strong> WhatsApp doesn't support bulk messaging. Click "Open WhatsApp" for each contact individually.
                    </div>
                    <div className="mb-6 flex flex-col items-center">
                      <div className="text-sm font-black text-gray-500 uppercase tracking-widest mb-4">
                        {sequenceIndex + 1} / {activeBatch.sequence.length}
                      </div>
                      <div className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                        {activeBatch.sequence[sequenceIndex]?.member.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mb-8">
                        <span className="text-xl">📱</span> {activeBatch.sequence[sequenceIndex]?.member.formattedMobile}
                      </div>
                      <button
                        onClick={handleOpenChat}
                        autoFocus
                        className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-green-600/20 mb-6"
                      >
                        <MessageCircle size={18} />
                        Open WhatsApp
                      </button>
                      <div className="text-xs text-gray-400 mb-6">↓ Send your message in WhatsApp, then click Next ↓</div>
                      <button
                        onClick={() => {
                          if (sequenceIndex < activeBatch.sequence.length - 1) {
                            setSequenceIndex(prev => prev + 1);
                          } else {
                            setSequenceIndex(activeBatch.sequence.length);
                          }
                        }}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition flex items-center justify-center gap-2"
                      >
                        Next <ChevronRight size={16} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Email Batch Player */}
            {!isWa && activeBatch && (
              <div className="text-center">
                {isSequenceFinished ? (
                  <div className="py-8">
                    <CheckCircle2 size={48} className="text-blue-500 mx-auto mb-4" />
                    <h4 className="text-lg font-bold text-gray-900 dark:text-white">Batch {activeBatchIndex + 1} Complete!</h4>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">{activeBatch.totalInBatch} recipients sent via BCC.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 p-3 rounded-xl text-xs text-left mb-6 leading-relaxed">
                      <strong>How it works:</strong> Clicking "Open Mail Client" will open your default email app with all {activeBatch.totalInBatch} recipients pre-filled as BCC. Send the email, then come back.
                    </div>
                    <div className="mb-6 flex flex-col items-center">
                      <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        Batch {activeBatch.batchNumber}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-8">
                        ✉️ {activeBatch.totalInBatch} Recipients (BCC)
                      </div>
                      <button
                        onClick={handleOpenChat}
                        autoFocus
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/20 mb-6"
                      >
                        <Mail size={18} />
                        Open Mail Client
                      </button>
                      <div className="text-xs text-gray-400">↓ Send your email, then click Next Batch ↓</div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
          
          {/* Footer */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
              {isSequenceFinished && activeBatchIndex === batches.length - 1 ? 'Finish' : 'Close'}
            </button>
            {isSequenceFinished && activeBatchIndex < batches.length - 1 && (
              <button 
                onClick={handleNextBatch} 
                className={`flex-[2] py-2.5 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                  isWa ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Next Batch <ChevronRight size={18} />
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BatchModal;
