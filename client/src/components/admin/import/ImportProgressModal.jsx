import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const ImportProgressModal = ({ isOpen, previewId, onComplete, onError }) => {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState('initializing');
  const [message, setMessage] = useState('Preparing import...');
  const [isDone, setIsDone] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!isOpen || !previewId) return;

    setProgress(0);
    setStep('initializing');
    setMessage('Connecting to server...');
    setIsDone(false);
    setHasError(false);

    const eventSource = new EventSource(`/api/admin/import/preview/${previewId}/progress`);

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.progress !== undefined) setProgress(data.progress);
        if (data.step) setStep(data.step);
        if (data.message) setMessage(data.message);

        if (data.step === 'completed') {
          setIsDone(true);
          eventSource.close();
          // Give it a brief moment to show 100% before triggering onComplete
          setTimeout(() => onComplete(), 1500);
        } else if (data.step === 'error') {
          setHasError(true);
          eventSource.close();
          setTimeout(() => onError(data.message), 1500);
        }
      } catch (err) {
        console.error("SSE parse error", err);
      }
    };

    eventSource.onerror = (err) => {
      console.error("SSE connection error", err);
      // Depending on setup, an error might just mean connection closed.
      // We don't forcefully close it unless we explicitly get an error step.
    };

    return () => {
      eventSource.close();
    };
  }, [isOpen, previewId, onComplete, onError]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        role="dialog"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white dark:bg-[#1E293B] rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center"
        >
          {hasError ? (
            <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle size={40} />
            </div>
          ) : isDone ? (
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} />
            </div>
          ) : (
            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-[#0A2A5E] dark:text-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 size={40} className="animate-spin" />
            </div>
          )}

          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
            {hasError ? "Import Failed" : isDone ? "Completed!" : "Importing..."}
          </h2>
          <p className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-8 min-h-[20px]">
            {message}
          </p>

          <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <motion.div 
              className={`absolute top-0 left-0 h-full rounded-full transition-colors ${hasError ? 'bg-red-500' : isDone ? 'bg-green-500' : 'bg-[#0A2A5E] dark:bg-blue-500'}`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            />
          </div>
          <div className="mt-2 text-right">
            <span className="text-xs font-black text-gray-400 dark:text-gray-500">{progress}%</span>
          </div>

        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImportProgressModal;
