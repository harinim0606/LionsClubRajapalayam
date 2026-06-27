import { motion } from "framer-motion";
import { Phone, MessageCircle, Mail, Cake } from "lucide-react";
import { getInitials } from "../../utils/helpers";

const BirthdayCard = ({ member, index }) => {
  const whatsappUrl = member.whatsappMobile
    ? `https://wa.me/91${member.whatsappMobile.replace(/\D/g, "")}`
    : member.mobile
    ? `https://wa.me/91${member.mobile.replace(/\D/g, "")}`
    : null;

  const callUrl = member.mobile ? `tel:${member.mobile}` : null;
  const emailUrl = member.email ? `mailto:${member.email}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="relative shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-pink-100 shadow"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center text-white font-bold text-lg shadow">
                {getInitials(member.name)}
              </div>
            )}
            {/* Birthday cake badge */}
            <span className="absolute -bottom-1 -right-1 text-lg">🎂</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h3>
            <p className="text-xs text-gray-500 font-medium">#{member.memberNumber}</p>
            {member.clubPosition && (
              <span className="inline-block mt-1 text-[10px] font-semibold text-[#0A2A5E] bg-[#0A2A5E]/8 px-2 py-0.5 rounded-full">
                {member.clubPosition}
              </span>
            )}
            {member.mobile && (
              <p className="text-xs text-gray-500 mt-1 truncate">📱 {member.mobile}</p>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 mt-3">
          {callUrl && (
            <a
              href={callUrl}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 border border-green-100 transition-colors"
            >
              <Phone size={13} /> Call
            </a>
          )}
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noreferrer"
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-100 transition-colors"
            >
              <MessageCircle size={13} /> WhatsApp
            </a>
          )}
          {emailUrl && (
            <a
              href={emailUrl}
              className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-100 transition-colors"
            >
              <Mail size={13} /> Email
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default BirthdayCard;
