import React from "react";
import { motion } from "framer-motion";
import { Phone, Award, Shield, Gift, Heart, User } from "lucide-react";

// Helper to get name initials, skipping honorifics like "Ln." or "Lion"
const getInitials = (name) => {
  if (!name) return "M";
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "M";
  
  let first = parts[0];
  let second = parts[1];

  // Skip "Ln." or "Lion" prefix if there are more parts
  if (/^(ln\.?|lion)$/i.test(first) && parts.length > 1) {
    first = parts[1];
    second = parts[2];
  }

  const initials = (first ? first.charAt(0) : "") + (second ? second.charAt(0) : "");
  return initials.toUpperCase() || "M";
};

// Deterministic avatar color based on member name hash
const getAvatarColorClass = (name) => {
  const colors = [
    "bg-[#0A2A5E]/10 text-[#0A2A5E] border-[#0A2A5E]/20",
    "bg-[#F4B400]/10 text-[#B58500] border-[#F4B400]/20",
    "bg-indigo-50 text-indigo-700 border-indigo-100",
    "bg-emerald-50 text-emerald-700 border-emerald-100",
    "bg-rose-50 text-rose-700 border-rose-100",
  ];
  if (!name) return colors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
};

const isToday = (dateString) => {
  if (!dateString) return false;
  const d = new Date(dateString);
  const today = new Date();
  return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
};

const MemberCard = ({ member, onViewProfile }) => {
  const avatarClass = getAvatarColorClass(member.name);
  const hasBirthdayToday = isToday(member.dateOfBirth);
  const hasAnniversaryToday = isToday(member.weddingDate);

  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between h-full relative overflow-hidden"
    >
      {/* Background patterns */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gray-50 to-transparent rounded-bl-full pointer-events-none" />

      <div className="space-y-4">
        {/* Header Block: Avatar & Name/Designation */}
        <div className="flex items-start gap-4">
          <div className="shrink-0">
            {member.avatar ? (
              <div className="h-16 w-16 rounded-2xl overflow-hidden border border-gray-100">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : (
              <div className={`h-16 w-16 rounded-2xl border flex items-center justify-center font-bold text-xl font-heading tracking-wide ${avatarClass}`}>
                {getInitials(member.name)}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900 truncate font-heading hover:text-[#0A2A5E] transition-colors" title={member.name}>
                {member.name}
              </h3>
              
              {/* Active / Inactive Badge */}
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border ${
                member.status === "active" 
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                  : "bg-gray-50 text-gray-500 border-gray-200"
              }`}>
                {member.status || "Active"}
              </span>
            </div>
            
            <p className="text-xs text-[#F4B400] font-semibold mt-0.5 tracking-wide">
              No: {member.memberNumber}
            </p>
            
            {/* Club Position */}
            <div className="flex items-center gap-1.5 mt-1.5 text-gray-600">
              <Shield size={13} className="text-gray-400 shrink-0" />
              <span className="text-xs font-medium truncate">
                {member.clubPosition || "Member"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Birthday & Anniversary Badges */}
        {(hasBirthdayToday || hasAnniversaryToday) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {hasBirthdayToday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-bounce">
                <Gift size={12} className="text-[#D69E00]" />
                🎂 Birthday Today!
              </span>
            )}
            {hasAnniversaryToday && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                <Heart size={12} className="text-[#0A2A5E]" />
                💍 Anniversary Today!
              </span>
            )}
          </div>
        )}

        {/* Contact/Summary Section */}
        <div className="pt-2 border-t border-gray-50 space-y-2">
          {member.mobile && (
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
              <Phone size={13} className="shrink-0" />
              <a href={`tel:${member.mobile}`} className="text-xs font-medium">
                {member.mobile}
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Card CTA Footer */}
      <div className="mt-5 pt-3 border-t border-gray-50">
        <button
          onClick={() => onViewProfile(member)}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-50 hover:bg-[#0A2A5E] text-gray-700 hover:text-white border border-gray-100 rounded-xl text-xs font-semibold transition-all shadow-sm cursor-pointer"
        >
          <User size={13} />
          View Profile
        </button>
      </div>
    </motion.div>
  );
};

export default React.memo(MemberCard);
