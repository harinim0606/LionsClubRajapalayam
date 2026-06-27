import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Filter, ChevronDown, ChevronUp, X, RotateCcw } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female", "Other"];
const STATUSES = ["active", "inactive"];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 40 }, (_, i) => currentYear - i);

const ExportFilters = ({ filters, onChange, onPreview, previewCount, isPreviewing }) => {
  const [expanded, setExpanded] = useState(true);

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const reset = () => onChange({});

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "" && v !== null);

  const inputClass = `w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0A2A5E]/30 dark:focus:ring-[#F4B400]/30 transition`;
  const labelClass = "block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1";

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A2A5E]/10 dark:bg-[#F4B400]/15 flex items-center justify-center">
            <Filter size={18} className="text-[#0A2A5E] dark:text-[#F4B400]" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white">Export Filters</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {hasFilters ? "Custom filters applied" : "No filters — exporting all"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {hasFilters && (
            <span className="px-2.5 py-1 bg-[#0A2A5E] dark:bg-[#F4B400] text-white dark:text-black text-xs font-bold rounded-full">
              Active
            </span>
          )}
          {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 dark:border-gray-800 p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">

                {/* Status */}
                <div>
                  <label className={labelClass}>Status</label>
                  <select className={inputClass} value={filters.status || ""} onChange={e => update("status", e.target.value || undefined)}>
                    <option value="">All Statuses</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s === "active" ? "Active" : "Inactive"}</option>)}
                  </select>
                </div>

                {/* Blood Group */}
                <div>
                  <label className={labelClass}>Blood Group</label>
                  <select className={inputClass} value={filters.bloodGroup || ""} onChange={e => update("bloodGroup", e.target.value || undefined)}>
                    <option value="">All Blood Groups</option>
                    {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                  </select>
                </div>

                {/* Gender */}
                <div>
                  <label className={labelClass}>Gender</label>
                  <select className={inputClass} value={filters.gender || ""} onChange={e => update("gender", e.target.value || undefined)}>
                    <option value="">All Genders</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>

                {/* City */}
                <div>
                  <label className={labelClass}>City</label>
                  <input type="text" placeholder="e.g. Rajapalayam" className={inputClass}
                    value={filters.city || ""} onChange={e => update("city", e.target.value || undefined)} />
                </div>

                {/* District */}
                <div>
                  <label className={labelClass}>District</label>
                  <input type="text" placeholder="e.g. Virudhunagar" className={inputClass}
                    value={filters.district || ""} onChange={e => update("district", e.target.value || undefined)} />
                </div>

                {/* Occupation */}
                <div>
                  <label className={labelClass}>Occupation</label>
                  <input type="text" placeholder="e.g. Business" className={inputClass}
                    value={filters.occupation || ""} onChange={e => update("occupation", e.target.value || undefined)} />
                </div>

                {/* Club Position */}
                <div>
                  <label className={labelClass}>Club Position</label>
                  <input type="text" placeholder="e.g. President" className={inputClass}
                    value={filters.clubPosition || ""} onChange={e => update("clubPosition", e.target.value || undefined)} />
                </div>

                {/* Membership Type */}
                <div>
                  <label className={labelClass}>Membership Type</label>
                  <input type="text" placeholder="e.g. Regular" className={inputClass}
                    value={filters.membershipType || ""} onChange={e => update("membershipType", e.target.value || undefined)} />
                </div>

                {/* Age Range */}
                <div>
                  <label className={labelClass}>Age From</label>
                  <input type="number" placeholder="e.g. 30" min={1} max={120} className={inputClass}
                    value={filters.ageFrom || ""} onChange={e => update("ageFrom", e.target.value || undefined)} />
                </div>
                <div>
                  <label className={labelClass}>Age To</label>
                  <input type="number" placeholder="e.g. 60" min={1} max={120} className={inputClass}
                    value={filters.ageTo || ""} onChange={e => update("ageTo", e.target.value || undefined)} />
                </div>

                {/* Joining Year */}
                <div>
                  <label className={labelClass}>Joined From Year</label>
                  <select className={inputClass} value={filters.joiningYearFrom || ""} onChange={e => update("joiningYearFrom", e.target.value || undefined)}>
                    <option value="">Any Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>Joined To Year</label>
                  <select className={inputClass} value={filters.joiningYearTo || ""} onChange={e => update("joiningYearTo", e.target.value || undefined)}>
                    <option value="">Any Year</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>

                {/* Has Email */}
                <div>
                  <label className={labelClass}>Has Email</label>
                  <select className={inputClass} value={filters.hasEmail || ""} onChange={e => update("hasEmail", e.target.value || undefined)}>
                    <option value="">Any</option>
                    <option value="yes">Has Email</option>
                    <option value="no">No Email</option>
                  </select>
                </div>

                {/* Has Mobile */}
                <div>
                  <label className={labelClass}>Has Mobile</label>
                  <select className={inputClass} value={filters.hasMobile || ""} onChange={e => update("hasMobile", e.target.value || undefined)}>
                    <option value="">Any</option>
                    <option value="yes">Has Mobile</option>
                    <option value="no">No Mobile</option>
                  </select>
                </div>

                {/* Has Photo */}
                <div>
                  <label className={labelClass}>Has Photo</label>
                  <select className={inputClass} value={filters.hasPhoto || ""} onChange={e => update("hasPhoto", e.target.value || undefined)}>
                    <option value="">Any</option>
                    <option value="yes">Has Photo</option>
                    <option value="no">No Photo</option>
                  </select>
                </div>

              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={onPreview}
                  disabled={isPreviewing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2A5E] dark:bg-[#F4B400] text-white dark:text-black rounded-xl font-bold text-sm hover:bg-[#071D43] transition disabled:opacity-70"
                >
                  {isPreviewing ? <div className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin" /> : <Filter size={16} />}
                  Preview Count
                </button>
                {previewCount !== null && (
                  <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                    className="px-4 py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl">
                    <span className="text-green-700 dark:text-green-400 font-bold text-sm">
                      {previewCount.toLocaleString()} member{previewCount !== 1 ? "s" : ""} match
                    </span>
                  </motion.div>
                )}
                {hasFilters && (
                  <button onClick={reset} className="flex items-center gap-2 px-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-semibold text-sm transition">
                    <X size={16} /> Clear Filters
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExportFilters;
