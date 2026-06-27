import { motion } from "framer-motion";
import {
  Building2, Hash, Calendar, Users, MapPin, Clock,
  Star, Heart, Handshake, Leaf, Crown, Shield, Landmark,
  ChevronRight
} from "lucide-react";
import { getInitials } from "../../utils/helpers";

// ─── helpers ────────────────────────────────────────────────────────────────

const formatDisplayDate = (val) => {
  if (!val) return "—";
  // Already a formatted string like "09-02-1972"
  if (typeof val === "string") return val;
  const d = new Date(val);
  if (isNaN(d.getTime())) return "—";
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};

const Avatar = ({ member, size = "sm" }) => {
  const sizeClass = size === "sm" ? "w-10 h-10 text-sm" : "w-12 h-12 text-base";
  if (!member) return null;
  return member.avatar ? (
    <img src={member.avatar} alt={member.name} className={`${sizeClass} rounded-full object-cover border-2 border-white shadow`} />
  ) : (
    <div className={`${sizeClass} rounded-full bg-gradient-to-br from-[#0A2A5E] to-[#1a4a9f] flex items-center justify-center text-[#F4B400] font-bold border-2 border-white shadow`}>
      {getInitials(member.name)}
    </div>
  );
};

const LeadershipPill = ({ member, role, icon: Icon }) => {
  if (!member) return null;
  return (
    <div className="flex items-center gap-3 bg-gradient-to-r from-[#F5F7FB] to-white rounded-2xl px-4 py-3 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-8 h-8 rounded-lg bg-[#0A2A5E]/10 flex items-center justify-center shrink-0">
        <Icon size={16} className="text-[#0A2A5E]" />
      </div>
      <Avatar member={member} size="sm" />
      <div className="min-w-0">
        <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{role}</p>
        <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
      </div>
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, value, accent }) => (
  <div className="flex items-start gap-3 group">
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${accent || "bg-blue-50"}`}>
      <Icon size={15} className="text-[#0A2A5E]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-sm font-medium text-gray-800 mt-0.5 break-words">{value || "—"}</p>
    </div>
  </div>
);

// ─── main card ───────────────────────────────────────────────────────────────

const ClubInformationCard = ({ club }) => {
  if (!club) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden"
    >
      {/* Header Banner */}
      <div className="relative h-28 bg-gradient-to-r from-[#071D43] via-[#0A2A5E] to-[#0d3a7e] flex items-end px-6 pb-4 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-white/5" />
        <div className="absolute top-4 right-16 w-16 h-16 rounded-full bg-[#F4B400]/10" />
        <div className="absolute -bottom-4 left-1/3 w-24 h-24 rounded-full bg-[#F4B400]/5" />

        <div className="relative flex items-end gap-4">
          {/* Club emblem */}
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center shrink-0">
            <span className="text-[#F4B400] text-2xl font-black font-heading">LC</span>
          </div>
          <div>
            <p className="text-[#F4B400] text-xs font-semibold uppercase tracking-widest">Lions Club International</p>
            <h2 className="text-white text-xl font-bold font-heading leading-tight">{club.clubName}</h2>
          </div>
        </div>

        {/* Club number badge */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/10 backdrop-blur border border-white/20 rounded-xl px-3 py-1.5">
          <Hash size={12} className="text-[#F4B400]" />
          <span className="text-white text-xs font-bold">{club.clubNumber}</span>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Active Members", value: club.totalMembers ?? "—", icon: Users, color: "from-blue-500 to-blue-600" },
            { label: "Lionistic Year", value: club.currentLionisticYear || "—", icon: Calendar, color: "from-amber-500 to-amber-600" },
            { label: "Zone", value: club.zone || "—", icon: MapPin, color: "from-emerald-500 to-emerald-600" },
            { label: "Region", value: club.region || "—", icon: Landmark, color: "from-purple-500 to-purple-600" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-3 border border-gray-100 text-center">
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                <Icon size={16} className="text-white" />
              </div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-sm font-bold text-gray-900 mt-0.5">{value}</p>
            </div>
          ))}
        </div>

        {/* Leadership */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Crown size={12} className="text-[#F4B400]" /> Club Leadership
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <LeadershipPill member={club.president} role="President" icon={Crown} />
            <LeadershipPill member={club.secretary} role="Secretary" icon={Shield} />
            <LeadershipPill member={club.treasurer} role="Treasurer" icon={Star} />
          </div>
        </div>

        {/* Club Details Grid */}
        <div>
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Building2 size={12} className="text-[#0A2A5E]" /> Club Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoRow icon={Calendar} label="Inaugurated" value={formatDisplayDate(club.inauguratedOn)} accent="bg-purple-50" />
            <InfoRow icon={Calendar} label="Chartered" value={formatDisplayDate(club.charteredOn)} accent="bg-indigo-50" />
            <InfoRow icon={Clock} label="Meeting Time" value={club.meetingTime} accent="bg-blue-50" />
            <InfoRow icon={Calendar} label="Meeting Days" value={club.meetingDays} accent="bg-sky-50" />
            <InfoRow icon={MapPin} label="Meeting Venue" value={club.meetingVenue} accent="bg-teal-50" />
            <InfoRow icon={Handshake} label="Sponsored By" value={club.sponsoredBy} accent="bg-green-50" />
          </div>
        </div>

        {/* Clubs Sponsored */}
        {club.clubsSponsored?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Star size={12} className="text-[#F4B400]" /> Clubs Sponsored
            </h3>
            <div className="flex flex-wrap gap-2">
              {club.clubsSponsored.map((c, i) => (
                <span key={i} className="flex items-center gap-1 text-xs font-medium bg-[#0A2A5E]/5 text-[#0A2A5E] border border-[#0A2A5E]/10 px-3 py-1.5 rounded-xl">
                  <ChevronRight size={11} /> {c}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Permanent Projects */}
        {club.permanentProjects?.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Leaf size={12} className="text-emerald-500" /> Permanent Projects
            </h3>
            <div className="flex flex-wrap gap-2">
              {club.permanentProjects.map((p, i) => (
                <span key={i} className="text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100 px-3 py-1.5 rounded-xl">
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ClubInformationCard;
