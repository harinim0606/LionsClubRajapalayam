import { motion } from "framer-motion";
import { Phone, MessageCircle, Heart } from "lucide-react";
import { getInitials } from "../../utils/helpers";

const getYearsMarried = (weddingDate) => {
  if (!weddingDate) return null;
  const wed = new Date(weddingDate);
  if (isNaN(wed.getTime())) return null;
  const today = new Date();
  const years = today.getFullYear() - wed.getFullYear();
  return years > 0 ? years : null;
};

const AnniversaryCard = ({ member, index }) => {
  const yearsMarried = getYearsMarried(member.weddingDate);

  const whatsappUrl = member.whatsappMobile
    ? `https://wa.me/91${member.whatsappMobile.replace(/\D/g, "")}`
    : member.mobile
    ? `https://wa.me/91${member.mobile.replace(/\D/g, "")}`
    : null;

  const callUrl = member.mobile ? `tel:${member.mobile}` : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-rose-400 via-red-400 to-pink-400" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar with heart overlay */}
          <div className="relative shrink-0">
            {member.avatar ? (
              <img
                src={member.avatar}
                alt={member.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-rose-100 shadow"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow">
                {getInitials(member.name)}
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 text-lg">💍</span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{member.name}</h3>
            {member.spouseName && (
              <p className="text-xs text-rose-500 font-medium flex items-center gap-1 mt-0.5">
                <Heart size={10} className="fill-current" />
                {member.spouseName}
              </p>
            )}
            {yearsMarried && (
              <div className="mt-1 inline-flex items-center gap-1 bg-rose-50 text-rose-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-rose-100">
                🎉 {yearsMarried} {yearsMarried === 1 ? "Year" : "Years"} Together
              </div>
            )}
            {member.mobile && (
              <p className="text-xs text-gray-500 mt-1.5 truncate">📱 {member.mobile}</p>
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
        </div>
      </div>
    </motion.div>
  );
};

export default AnniversaryCard;
