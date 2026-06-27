import { motion, AnimatePresence } from "framer-motion";
import { X, Phone, MessageCircle, Mail, MapPin, Building2, Users, CalendarHeart, Droplet } from "lucide-react";
import { getInitials } from "../../utils/helpers";

const InfoItem = ({ icon: Icon, label, value }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center shrink-0 mt-0.5 text-[#0A2A5E]">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
};

const MemberViewDrawer = ({ isOpen, onClose, member }) => {
  if (!isOpen || !member) return null;

  const whatsappUrl = member.whatsappMobile
    ? `https://wa.me/91${member.whatsappMobile.replace(/\D/g, "")}`
    : member.mobile
    ? `https://wa.me/91${member.mobile.replace(/\D/g, "")}`
    : null;

  const callUrl = member.mobile ? `tel:${member.mobile}` : null;
  const emailUrl = member.email ? `mailto:${member.email}` : null;
  
  const addressQuery = [member.address, member.city, member.district, member.state, member.pincode].filter(Boolean).join(", ");
  const mapsUrl = addressQuery ? `https://maps.google.com/?q=${encodeURIComponent(addressQuery)}` : null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/20 backdrop-blur-sm"
        />

        {/* Drawer */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        >
          {/* Header */}
          <div className="relative h-32 bg-gradient-to-r from-[#071D43] via-[#0A2A5E] to-[#0d3a7e]">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Profile Content */}
          <div className="flex-1 overflow-y-auto pb-8">
            <div className="px-6 relative">
              {/* Avatar */}
              <div className="absolute -top-16 border-4 border-white rounded-3xl bg-white shadow-sm">
                {member.avatar ? (
                  <img
                    src={member.avatar}
                    alt={member.name}
                    className="w-28 h-28 rounded-2xl object-cover"
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#0A2A5E] to-[#1a4080] flex items-center justify-center text-white font-bold text-3xl">
                    {getInitials(member.name)}
                  </div>
                )}
                {/* Status Badge */}
                <div className={`absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 border-white ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
              </div>

              {/* Basic Info */}
              <div className="pt-16 mb-6">
                <h2 className="text-2xl font-bold text-gray-900 font-heading">{member.name}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className="text-sm font-semibold text-[#F4B400]">#{member.memberNumber}</span>
                  {member.clubPosition && (
                    <>
                      <span className="text-gray-300">•</span>
                      <span className="text-xs font-semibold text-[#0A2A5E] bg-[#0A2A5E]/8 px-2 py-0.5 rounded-full">
                        {member.clubPosition} {member.clubPositionYear && `(${member.clubPositionYear})`}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-4 gap-2 mb-8">
                {callUrl && (
                  <a href={callUrl} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-green-50 text-green-700 hover:bg-green-100 transition-colors">
                    <Phone size={20} />
                    <span className="text-[10px] font-bold">Call</span>
                  </a>
                )}
                {whatsappUrl && (
                  <a href={whatsappUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors">
                    <MessageCircle size={20} />
                    <span className="text-[10px] font-bold">WhatsApp</span>
                  </a>
                )}
                {emailUrl && (
                  <a href={emailUrl} className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors">
                    <Mail size={20} />
                    <span className="text-[10px] font-bold">Email</span>
                  </a>
                )}
                {mapsUrl && (
                  <a href={mapsUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-orange-50 text-orange-700 hover:bg-orange-100 transition-colors">
                    <MapPin size={20} />
                    <span className="text-[10px] font-bold">Map</span>
                  </a>
                )}
              </div>

              {/* Detailed Info Sections */}
              <div className="space-y-6">
                
                <section>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                    Personal Details
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                    {member.dateOfBirth && <InfoItem icon={CalendarHeart} label="Date of Birth" value={new Date(member.dateOfBirth).toLocaleDateString('en-GB')} />}
                    {member.weddingDate && <InfoItem icon={CalendarHeart} label="Wedding Date" value={new Date(member.weddingDate).toLocaleDateString('en-GB')} />}
                    <InfoItem icon={Droplet} label="Blood Group" value={member.bloodGroup} />
                    <InfoItem icon={Users} label="Spouse Name" value={member.spouseName} />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                    Professional
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                    <InfoItem icon={Building2} label="Profession" value={member.profession} />
                    <InfoItem icon={Building2} label="Company" value={member.company} />
                  </div>
                </section>

                <section>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-3 pb-2 border-b border-gray-200">
                    Location
                  </h3>
                  <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
                    <InfoItem icon={MapPin} label="Address" value={addressQuery} />
                  </div>
                </section>

              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemberViewDrawer;
