import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Columns, ChevronDown, ChevronUp, CheckSquare, Square, Save, RotateCcw } from "lucide-react";

const ALL_COLUMNS = [
  { key: "memberNumber",    header: "Member No",          group: "Identity" },
  { key: "name",            header: "Member Name",         group: "Identity" },
  { key: "firstName",       header: "First Name",          group: "Identity" },
  { key: "lastName",        header: "Last Name",           group: "Identity" },
  { key: "dateOfBirth",     header: "Date of Birth",       group: "Personal" },
  { key: "age",             header: "Age",                 group: "Personal" },
  { key: "weddingDate",     header: "Wedding Anniversary", group: "Personal" },
  { key: "gender",          header: "Gender",              group: "Personal" },
  { key: "bloodGroup",      header: "Blood Group",         group: "Personal" },
  { key: "mobile",          header: "Mobile",              group: "Contact" },
  { key: "alternateMobile", header: "Alternate Mobile",    group: "Contact" },
  { key: "whatsappMobile",  header: "WhatsApp",            group: "Contact" },
  { key: "email",           header: "Email",               group: "Contact" },
  { key: "address",         header: "Address",             group: "Location" },
  { key: "city",            header: "City",                group: "Location" },
  { key: "district",        header: "District",            group: "Location" },
  { key: "state",           header: "State",               group: "Location" },
  { key: "country",         header: "Country",             group: "Location" },
  { key: "pincode",         header: "Pincode",             group: "Location" },
  { key: "profession",      header: "Occupation",          group: "Professional" },
  { key: "company",         header: "Company",             group: "Professional" },
  { key: "clubPosition",    header: "Club Position",       group: "Club" },
  { key: "membershipType",  header: "Membership Type",     group: "Club" },
  { key: "joiningYear",     header: "Joining Year",        group: "Club" },
  { key: "status",          header: "Membership Status",   group: "Club" },
  { key: "spouseName",      header: "Spouse Name",         group: "Personal" },
  { key: "createdAt",       header: "Created Date",        group: "System" },
  { key: "updatedAt",       header: "Updated Date",        group: "System" },
];

const DEFAULT_COLUMNS = [
  "memberNumber", "name", "dateOfBirth", "age", "weddingDate", "gender",
  "bloodGroup", "mobile", "email", "city", "profession", "clubPosition",
  "status", "joiningYear",
];

const GROUPS = ["Identity", "Personal", "Contact", "Location", "Professional", "Club", "System"];

const GROUP_ICONS = {
  "Identity": "🪪",
  "Personal": "👤",
  "Contact": "📞",
  "Location": "📍",
  "Professional": "💼",
  "Club": "🦁",
  "System": "⚙️",
};

const ColumnSelector = ({ selectedColumns, onChange, presets, onSavePreset, onLoadPreset }) => {
  const [expanded, setExpanded] = useState(true);
  const [presetName, setPresetName] = useState("");
  const [showSavePreset, setShowSavePreset] = useState(false);

  const toggle = (key) => {
    if (selectedColumns.includes(key)) {
      onChange(selectedColumns.filter(k => k !== key));
    } else {
      onChange([...selectedColumns, key]);
    }
  };

  const selectAll = () => onChange(ALL_COLUMNS.map(c => c.key));
  const clearAll = () => onChange([]);
  const selectDefault = () => onChange(DEFAULT_COLUMNS);

  const groupedCols = GROUPS.reduce((acc, g) => {
    acc[g] = ALL_COLUMNS.filter(c => c.group === g);
    return acc;
  }, {});

  const handleSavePreset = () => {
    if (!presetName.trim()) return;
    onSavePreset(presetName.trim());
    setPresetName("");
    setShowSavePreset(false);
  };

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <Columns size={18} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div className="text-left">
            <p className="font-bold text-gray-900 dark:text-white">Column Selector</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{selectedColumns.length} of {ALL_COLUMNS.length} columns selected</p>
          </div>
        </div>
        {expanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
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
            <div className="border-t border-gray-100 dark:border-gray-800 p-6">
              {/* Quick Actions */}
              <div className="flex flex-wrap gap-2 mb-5">
                <button onClick={selectAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-[#0A2A5E] dark:bg-[#F4B400] dark:text-black rounded-lg hover:opacity-90 transition">
                  <CheckSquare size={14} /> Select All
                </button>
                <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                  <Square size={14} /> Clear All
                </button>
                <button onClick={selectDefault} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[#0A2A5E] dark:text-[#F4B400] bg-[#0A2A5E]/10 dark:bg-[#F4B400]/10 rounded-lg hover:opacity-90 transition">
                  <RotateCcw size={14} /> Default Columns
                </button>
                <button onClick={() => setShowSavePreset(!showSavePreset)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-lg hover:opacity-90 transition">
                  <Save size={14} /> Save Preset
                </button>
                {presets && presets.length > 0 && (
                  <select
                    onChange={e => { if (e.target.value) onLoadPreset(e.target.value); }}
                    className="px-3 py-1.5 text-xs font-bold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg cursor-pointer focus:outline-none"
                    defaultValue=""
                  >
                    <option value="">Load Preset...</option>
                    {presets.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
                  </select>
                )}
              </div>

              {/* Save Preset Input */}
              <AnimatePresence>
                {showSavePreset && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                    className="mb-4 flex gap-2">
                    <input
                      type="text" placeholder="Preset name..." value={presetName}
                      onChange={e => setPresetName(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSavePreset()}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-purple-300"
                    />
                    <button onClick={handleSavePreset} className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-bold hover:bg-purple-700 transition">Save</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Column Groups */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {GROUPS.map(group => (
                  <div key={group} className="space-y-2">
                    <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                      {GROUP_ICONS[group]} {group}
                    </p>
                    <div className="space-y-1">
                      {groupedCols[group].map(col => {
                        const checked = selectedColumns.includes(col.key);
                        return (
                          <button
                            key={col.key}
                            onClick={() => toggle(col.key)}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition ${
                              checked
                                ? "bg-[#0A2A5E]/8 dark:bg-[#F4B400]/10 text-[#0A2A5E] dark:text-[#F4B400]"
                                : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            {checked
                              ? <CheckSquare size={16} className="text-[#0A2A5E] dark:text-[#F4B400] shrink-0" />
                              : <Square size={16} className="text-gray-300 dark:text-gray-600 shrink-0" />
                            }
                            <span className={checked ? "font-semibold" : ""}>{col.header}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ColumnSelector;
