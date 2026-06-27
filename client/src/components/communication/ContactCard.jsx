import React from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MessageCircle, Gift, Heart } from 'lucide-react';

const ContactCard = ({ member, type = 'contact', onOpenCompose }) => {
  const isBirthday = type === 'birthday';
  const isAnniversary = type === 'anniversary';

  // Format date helper
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  };

  const calculateAge = (dob) => {
    if (!dob) return '';
    return Math.floor((Date.now() - new Date(dob)) / 31557600000);
  };

  const getInitials = (name) => name?.substring(0, 2).toUpperCase() || 'M';

  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="premium-card p-5 relative overflow-hidden group"
    >
      {/* Background Decor */}
      {isBirthday && <div className="absolute -top-10 -right-10 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl" />}
      {isAnniversary && <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl" />}

      <div className="flex items-center gap-4 relative z-10">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0A2A5E] to-[#071D43] shrink-0 border-2 border-white dark:border-gray-800 shadow-md flex items-center justify-center overflow-hidden text-white font-bold text-xl">
          {member.avatar ? (
            <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
          ) : getInitials(member.name)}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{member.name}</h3>
            {isBirthday && <Gift size={14} className="text-pink-500 shrink-0" />}
            {isAnniversary && <Heart size={14} className="text-purple-500 shrink-0" />}
          </div>
          <p className="text-xs text-[#0A2A5E] dark:text-[#F4B400] font-bold mt-0.5">{member.memberNumber}</p>
          
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
            {isBirthday && member.dateOfBirth && (
              <span>Turns {calculateAge(member.dateOfBirth)} today</span>
            )}
            {isAnniversary && member.weddingDate && (
              <span>Anniversary ({formatDate(member.weddingDate)})</span>
            )}
            {type === 'contact' && <span>{member.city || 'No City'}</span>}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mt-5 relative z-10">
        
        {(!member.mobile && !member.whatsappMobile) ? (
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-bold text-center leading-tight">No Mobile Number</span>
          </div>
        ) : (
          <button
            onClick={() => onOpenCompose('whatsapp', [member])}
            className="flex flex-col items-center justify-center gap-1.5 p-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition"
            title="Send WhatsApp"
          >
            <MessageCircle size={18} />
            <span className="text-[10px] font-bold">WhatsApp</span>
          </button>
        )}

        {!member.email ? (
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-bold text-center leading-tight">No Email Address</span>
          </div>
        ) : (
          <button
            onClick={() => onOpenCompose('email', [member])}
            className="flex flex-col items-center justify-center gap-1.5 p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
            title="Send Email"
          >
            <Mail size={18} />
            <span className="text-[10px] font-bold">Email</span>
          </button>
        )}

        {!member.mobile ? (
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-bold text-center leading-tight">No Mobile Number</span>
          </div>
        ) : (
          <a
            href={`tel:${member.mobile}`}
            className="flex flex-col items-center justify-center gap-1.5 p-2 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Call Phone"
          >
            <Phone size={18} />
            <span className="text-[10px] font-bold">Call</span>
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(ContactCard);
