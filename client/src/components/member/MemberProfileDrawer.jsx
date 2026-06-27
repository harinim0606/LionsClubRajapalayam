import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Phone, Mail, MessageSquare, MapPin, 
  Calendar, Shield, Award, User, Briefcase, Heart 
} from "lucide-react";

// Helper to format dates to standard Indian format
const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Calculate active years of service
const calculateServiceYears = (joiningYear) => {
  if (!joiningYear) return "N/A";
  const currentYear = new Date().getFullYear();
  const diff = currentYear - joiningYear;
  return diff > 0 ? `${diff} Year${diff > 1 ? "s" : ""}` : "New Member (Joined this year)";
};

const MemberProfileDrawer = ({ isOpen, onClose, member }) => {
  if (!member) return null;

  const serviceYears = calculateServiceYears(member.joiningYear);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
          />

          {/* Drawer Panel Container */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="relative w-full max-w-lg bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header: Sticky Close button */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white shrink-0">
              <span className="font-heading font-bold text-gray-900 text-lg">Member Profile Details</span>
              <button
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors border-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-32">
              {/* Profile Avatar Card Hero */}
              <div className="flex flex-col items-center text-center p-6 bg-gradient-to-br from-[#0A2A5E]/5 to-[#F4B400]/5 rounded-3xl border border-gray-100/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-[#F4B400]/10 rounded-full blur-2xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-[#0A2A5E]/5 rounded-full blur-2xl pointer-events-none" />
                
                {member.avatar ? (
                  <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-white shadow-md relative z-10">
                    <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
                  </div>
                ) : (
                  <div className="h-28 w-28 rounded-full bg-gradient-to-br from-[#0A2A5E] to-[#071D43] text-white flex items-center justify-center font-bold text-3xl font-heading shadow-md relative z-10 border-4 border-white">
                    {member.name ? member.name.charAt(0).toUpperCase() : "M"}
                  </div>
                )}

                <div className="mt-4 relative z-10">
                  <h2 className="text-xl font-extrabold text-gray-900 font-heading tracking-tight">{member.name}</h2>
                  <p className="text-xs text-[#0A2A5E] font-bold mt-1 tracking-wider uppercase bg-[#0A2A5E]/5 px-3 py-1 rounded-full border border-[#0A2A5E]/10 inline-block">
                    {member.clubPosition || "Member"}
                  </p>
                  <p className="text-xs text-gray-500 font-semibold mt-1">Member ID: {member.memberNumber}</p>
                </div>
              </div>

              {/* 1. Personal Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <User size={13} className="text-[#F4B400]" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Gender</span>
                    <p className="text-sm font-medium text-gray-800">{member.gender || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Date of Birth</span>
                    <p className="text-sm font-medium text-gray-800">{formatDate(member.dateOfBirth)}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Occupation / Company</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 mt-0.5">
                      <Briefcase size={14} className="text-gray-400" />
                      <span>{member.profession ? `${member.profession} ${member.company ? `at ${member.company}` : ''}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Contact Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Mail size={13} className="text-[#F4B400]" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Mobile Number</span>
                    <p className="text-sm font-medium text-gray-800">{member.mobile || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Alt / WhatsApp Mobile</span>
                    <p className="text-sm font-medium text-gray-800">{member.alternateMobile || member.whatsappMobile || "N/A"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Email Address</span>
                    <p className="text-sm font-medium text-gray-800 truncate">{member.email || "N/A"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Residential Address</span>
                    <div className="flex items-start gap-1.5 text-sm font-medium text-gray-800 mt-1">
                      <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
                      <span>{member.address ? `${member.address}, ${member.city || ''} - ${member.pincode || ''}` : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Lions Membership Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Shield size={13} className="text-[#F4B400]" />
                  Lions Membership Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Lions Joined Year</span>
                    <p className="text-sm font-medium text-gray-800">{member.joiningYear || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Lions Designation Year</span>
                    <p className="text-sm font-medium text-gray-800">{member.clubPositionYear || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Blood Group</span>
                    <p className="text-sm font-semibold text-[#0A2A5E]">{member.bloodGroup || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Membership Type</span>
                    <p className="text-sm font-medium text-gray-800">{member.membershipType || "Regular"}</p>
                  </div>
                </div>
              </div>

              {/* 4. Family Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Heart size={13} className="text-[#F4B400]" />
                  Family Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Spouse Name</span>
                    <p className="text-sm font-medium text-gray-800">{member.spouseName || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Spouse Member ID</span>
                    <p className="text-sm font-medium text-gray-800">{member.spouseMemberId || "N/A"}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Wedding Anniversary</span>
                    <div className="flex items-center gap-1.5 text-sm font-medium text-gray-800 mt-0.5">
                      <Calendar size={14} className="text-gray-400" />
                      <span>{formatDate(member.weddingDate)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 5. Service & Awards */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Award size={13} className="text-[#F4B400]" />
                  Service & Awards
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gray-50/50 p-4 rounded-2xl border border-gray-50">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Years of Service</span>
                    <p className="text-sm font-semibold text-[#0A2A5E]">{serviceYears}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-semibold">Honors / Awards</span>
                    <p className="text-sm font-medium text-gray-800">{member.clubPosition && member.clubPosition !== "Member" ? "Club Officer Award" : "Active Member Recognition"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Actions Footer: Communication Options */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100 bg-white flex items-center gap-3 shrink-0 z-20 shadow-lg">
              {member.mobile && (
                <a
                  href={`tel:${member.mobile}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#0A2A5E] hover:bg-[#071D43] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0A2A5E]/20 transition-all cursor-pointer border-0"
                >
                  <Phone size={14} />
                  Call
                </a>
              )}
              {member.mobile && (
                <a
                  href={`https://wa.me/${member.whatsappMobile || member.mobile}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-xs font-bold shadow-md shadow-[#25D366]/20 transition-all cursor-pointer border-0"
                >
                  <MessageSquare size={14} />
                  WhatsApp
                </a>
              )}
              {member.email && (
                <a
                  href={`mailto:${member.email}`}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer border-0"
                >
                  <Mail size={14} />
                  Email
                </a>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default MemberProfileDrawer;
