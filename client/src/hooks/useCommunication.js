import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * useCommunication Hook
 * Handles formatting, batching, deduplication, and URL generation for WA and Email.
 */
export const useCommunication = () => {
  const [isBatching, setIsBatching] = useState(false);
  const [batches, setBatches] = useState([]);
  const [batchType, setBatchType] = useState(null); // 'whatsapp' | 'email'
  
  // Format Indian mobile number to 91XXXXXXXXXX
  const formatMobile = (mobile) => {
    if (!mobile) return null;
    let num = mobile.toString().replace(/\D/g, ''); // strip non-digits
    if (num.length === 10) num = '91' + num;
    if (num.length > 10 && num.startsWith('0')) num = '91' + num.substring(1);
    if (num.length > 10 && num.startsWith('91')) return num;
    if (num.length >= 10) return num;
    return null;
  };

  // Extract valid contacts for WhatsApp
  const getValidWaContacts = (members) => {
    const valid = [];
    const invalid = [];
    const duplicate = [];
    const seen = new Set();
    
    members.forEach(m => {
      const formatted = formatMobile(m.mobile || m.whatsappMobile || m.alternateMobile);
      if (!formatted) {
        invalid.push(m);
      } else if (seen.has(formatted)) {
        duplicate.push(m);
      } else {
        seen.add(formatted);
        valid.push({ ...m, formattedMobile: formatted });
      }
    });
    return { valid, invalid, duplicate, missingCount: invalid.length, duplicateCount: duplicate.length, total: members.length };
  };

  // Extract valid contacts for Email
  const getValidEmailContacts = (members) => {
    const valid = [];
    const invalid = [];
    const duplicate = [];
    const seen = new Set();
    
    members.forEach(m => {
      const email = m.email?.trim().toLowerCase();
      if (!email || !email.includes('@')) {
        invalid.push(m);
      } else if (seen.has(email)) {
        duplicate.push(m);
      } else {
        seen.add(email);
        valid.push(m);
      }
    });
    return { valid, invalid, duplicate, missingCount: invalid.length, duplicateCount: duplicate.length, total: members.length };
  };

  // ─── Individual WhatsApp ───────────────────────────────────────────────────
  const sendIndividualWhatsApp = (member, message = "") => {
    const formatted = formatMobile(member.mobile || member.whatsappMobile);
    if (!formatted) {
      toast.error("No valid mobile number available.");
      return;
    }
    const url = `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  // ─── Individual Email ──────────────────────────────────────────────────────
  const sendIndividualEmail = (member, subject = "", body = "") => {
    if (!member.email) {
      toast.error("No email available.");
      return;
    }
    const url = `mailto:${member.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(url, '_blank');
  };

  // ─── Bulk WhatsApp (Batching) ──────────────────────────────────────────────
  // Generates sequence of individual wa.me/<num> URLs for manual sequential sending
  const prepareBulkWhatsApp = (members, message = "") => {
    const { valid, missingCount, duplicateCount } = getValidWaContacts(members);
    if (valid.length === 0) {
      toast.error("No valid mobile numbers in selection.");
      return null;
    }

    const BATCH_SIZE = 50;
    const generatedBatches = [];

    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      const batchMembers = valid.slice(i, i + BATCH_SIZE);
      
      // Each batch now contains a sequence of individual URLs
      const sequence = batchMembers.map(m => {
        return {
          member: m,
          url: `https://wa.me/${m.formattedMobile}?text=${encodeURIComponent(message)}`
        };
      });
      
      generatedBatches.push({
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        sequence,
        totalInBatch: sequence.length
      });
    }

    setBatches(generatedBatches);
    setBatchType('whatsapp');
    setIsBatching(true);
    
    return { type: 'whatsapp', totalValid: valid.length, missing: missingCount, duplicates: duplicateCount };
  };

  // ─── Bulk Email (Batching) ─────────────────────────────────────────────────
  const prepareBulkEmail = (members, subject = "", body = "") => {
    const { valid, missingCount, duplicateCount } = getValidEmailContacts(members);
    if (valid.length === 0) {
      toast.error("No valid emails in selection.");
      return null;
    }

    const BATCH_SIZE = 25; // Safe limit for mailto: BCC
    const generatedBatches = [];

    for (let i = 0; i < valid.length; i += BATCH_SIZE) {
      const batchMembers = valid.slice(i, i + BATCH_SIZE);
      const to = batchMembers.map(m => m.email).join(',');
      
      const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      generatedBatches.push({
        batchNumber: Math.floor(i / BATCH_SIZE) + 1,
        sequence: batchMembers.map(m => ({ member: m, url })),
        totalInBatch: batchMembers.length,
        url
      });
    }

    if (generatedBatches.length === 1) {
      window.open(generatedBatches[0].url, '_self');
      return { type: 'email', totalValid: valid.length, missing: missingCount, duplicates: duplicateCount };
    }

    setBatches(generatedBatches);
    setBatchType('email');
    setIsBatching(true);

    return { type: 'email', totalValid: valid.length, missing: missingCount, duplicates: duplicateCount };
  };

  // ─── Copy Contacts ─────────────────────────────────────────────────────────
  const getCopyText = (members, type = 'mobile', format = 'comma') => {
    let list = [];
    if (type === 'mobile') {
      const { valid } = getValidWaContacts(members);
      list = valid.map(m => m.formattedMobile);
    } else if (type === 'wa-links') {
      const { valid } = getValidWaContacts(members);
      list = valid.map(m => `https://wa.me/${m.formattedMobile}`);
    } else if (type === 'email') {
      const { valid } = getValidEmailContacts(members);
      list = valid.map(m => m.email);
    } else if (type === 'memberNumber') {
      list = members.map(m => m.memberNumber).filter(Boolean);
    } else if (type === 'name') {
      list = members.map(m => m.name).filter(Boolean);
    }

    if (list.length === 0) return null;

    if (format === 'comma') return list.join(', ');
    if (format === 'newline') return list.join('\n');
    if (format === 'csv') return list.join(',');
    return list.join(', ');
  };

  const copyToClipboard = (text, successMsg) => {
    if (!text) {
      toast.error("Nothing to copy.");
      return;
    }
    navigator.clipboard.writeText(text)
      .then(() => toast.success(successMsg))
      .catch(() => toast.error("Failed to copy. Clipboard permission denied."));
  };

  return {
    sendIndividualWhatsApp,
    sendIndividualEmail,
    prepareBulkWhatsApp,
    prepareBulkEmail,
    getCopyText,
    copyToClipboard,
    isBatching,
    setIsBatching,
    batches,
    batchType,
    getValidWaContacts,
    getValidEmailContacts
  };
};
