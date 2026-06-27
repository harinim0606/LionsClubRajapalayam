import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle, Mail, AlertTriangle } from 'lucide-react';
import { useCommunication } from '../../hooks/useCommunication';

const ComposeMessageModal = ({ isOpen, onClose, onSend, type, targetMembers = [] }) => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const comm = useCommunication();

  useEffect(() => {
    if (isOpen) {
      setSubject('');
      setMessage('');
    }
    // ESC to close
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isWa = type === 'whatsapp';
  const Icon = isWa ? MessageCircle : Mail;
  const colorClass = isWa ? 'text-green-500 bg-green-100 dark:bg-green-900/30' : 'text-blue-500 bg-blue-100 dark:bg-blue-900/30';
  const btnClass = isWa ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700';

  const handleSend = () => {
    onSend({ subject, message });
    onClose();
  };

  const isBulk = targetMembers.length > 1;
  const singleTarget = !isBulk && targetMembers.length === 1 ? targetMembers[0] : null;

  // Validation Stats
  const validation = isWa 
    ? comm.getValidWaContacts(targetMembers) 
    : comm.getValidEmailContacts(targetMembers);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="compose-modal-title"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                <Icon size={20} />
              </div>
              <div>
                <h3 id="compose-modal-title" className="font-bold text-gray-900 dark:text-white">
                  Compose {isWa ? 'WhatsApp' : 'Email'}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Type your custom message below
                </p>
              </div>
            </div>
            <button onClick={onClose} aria-label="Close modal" className="p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            
            {/* Dynamic Headers */}
            {isBulk ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Total Recipients</span>
                  <span className="font-bold text-gray-900 dark:text-white">{targetMembers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Ready to Send</span>
                  <span className="font-bold text-green-600 dark:text-green-400">{validation.valid.length}</span>
                </div>
                {validation.missingCount > 0 && (
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                    <AlertTriangle size={14} /> 
                    <span>{validation.missingCount} members missing {isWa ? 'mobile number' : 'email'} will be skipped.</span>
                  </div>
                )}
                {validation.duplicateCount > 0 && (
                  <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 text-xs mt-1">
                    <AlertTriangle size={14} /> 
                    <span>{validation.duplicateCount} duplicate {isWa ? 'mobile numbers' : 'emails'} skipped. Only one message per unique contact.</span>
                  </div>
                )}
              </div>
            ) : singleTarget ? (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden">
                   {singleTarget.avatar ? <img src={singleTarget.avatar} alt="Avatar" className="w-full h-full object-cover"/> : <span className="font-bold text-gray-500">{singleTarget.name.substring(0,2).toUpperCase()}</span>}
                </div>
                <div>
                  <p className="font-bold text-gray-900 dark:text-white">{singleTarget.name}</p>
                  <p className="text-xs text-gray-500">{singleTarget.memberNumber} • {isWa ? singleTarget.mobile : singleTarget.email}</p>
                </div>
              </div>
            ) : null}

            {!isWa && (
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Monthly Meeting Update"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Message</label>
              <textarea
                autoFocus
                rows={6}
                placeholder="Type your message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                aria-label="Message body"
                className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-white transition resize-none"
              />
            </div>
          </div>
          
          {/* Footer */}
          <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/30 flex gap-3">
             <button onClick={onClose} className="flex-1 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition">
               Cancel
             </button>
             <button 
               onClick={handleSend}
               disabled={!message.trim() || (!isWa && !subject.trim()) || validation.valid.length === 0}
               className={`flex-[2] py-2.5 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed ${btnClass}`}
             >
               <Send size={18} /> {isBulk ? 'Create Batches' : `Open ${isWa ? 'WhatsApp' : 'Email'}`}
             </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ComposeMessageModal;
