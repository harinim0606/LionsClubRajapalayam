import { X, RotateCcw, SlidersHorizontal } from "lucide-react";

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const GENDERS = ["Male", "Female"];
const DESIGNATIONS = [
  "President",
  "Secretary",
  "Treasurer",
  "Region Chairperson",
  "Zone Chairperson",
  "Vice President",
  "Director",
  "Member",
];

const MemberFilters = ({ filters, onChange, onReset, isMobileOpen, onCloseMobile }) => {
  const handleFilterChange = (key, value) => {
    onChange({ ...filters, [key]: value, page: 1 }); // reset page when filters change
  };

  const filterContent = (
    <div className="space-y-6">
      {/* 1. Header (desktop only, or mobile resets) */}
      <div className="hidden lg:flex items-center justify-between pb-4 border-b border-gray-100">
        <div className="flex items-center gap-2 font-bold text-gray-900 font-heading text-sm uppercase tracking-wider">
          <SlidersHorizontal size={16} className="text-[#0A2A5E]" />
          Filters
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      {/* 2. Filters Grid/Section */}
      <div className="space-y-5">
        {/* Status Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Status
          </label>
          <select
            value={filters.status || "active"}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0A2A5E] focus:bg-white focus:border-transparent transition-all outline-none"
          >
            <option value="active">Active Members</option>
            <option value="inactive">Inactive Members</option>
            <option value="all">All Statuses</option>
          </select>
        </div>

        {/* Designation Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Club Designation
          </label>
          <select
            value={filters.designation || ""}
            onChange={(e) => handleFilterChange("designation", e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0A2A5E] focus:bg-white focus:border-transparent transition-all outline-none"
          >
            <option value="">All Designations</option>
            {DESIGNATIONS.map((pos) => (
              <option key={pos} value={pos}>
                {pos}
              </option>
            ))}
          </select>
        </div>

        {/* Blood Group Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Blood Group
          </label>
          <select
            value={filters.bloodGroup || ""}
            onChange={(e) => handleFilterChange("bloodGroup", e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0A2A5E] focus:bg-white focus:border-transparent transition-all outline-none"
          >
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.map((bg) => (
              <option key={bg} value={bg}>
                {bg}
              </option>
            ))}
          </select>
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Gender
          </label>
          <select
            value={filters.gender || ""}
            onChange={(e) => handleFilterChange("gender", e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0A2A5E] focus:bg-white focus:border-transparent transition-all outline-none"
          >
            <option value="">All Genders</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy || "name"}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0A2A5E] focus:bg-white focus:border-transparent transition-all outline-none"
          >
            <option value="name">Name</option>
            <option value="memberNumber">Member Number</option>
            <option value="joiningDate">Joining Date</option>
            <option value="dateOfBirth">Date of Birth</option>
          </select>
        </div>

        {/* Sort Order Filter */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Sort Order
          </label>
          <select
            value={filters.sortOrder || "asc"}
            onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
            className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs text-gray-800 font-medium focus:ring-2 focus:ring-[#0A2A5E] focus:bg-white focus:border-transparent transition-all outline-none"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. Sidebar Layout for Desktop */}
      <div className="hidden lg:block w-64 bg-white border border-gray-100 rounded-2xl p-6 shadow-sm shrink-0 h-fit">
        {filterContent}
      </div>

      {/* 2. Slide-up Panel / Drawer Layout for Mobile & Tablet */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm"
            onClick={onCloseMobile}
          />
          
          {/* Drawer Panel */}
          <div className="relative bg-white rounded-t-3xl p-6 shadow-xl max-h-[85vh] overflow-y-auto space-y-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="font-heading font-bold text-gray-900">Filters & Sorting</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={onReset}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 transition-colors bg-transparent border-0 cursor-pointer"
                >
                  Reset
                </button>
                <button
                  onClick={onCloseMobile}
                  className="p-1 text-gray-400 hover:bg-gray-100 rounded-lg border-0 cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {filterContent}
            
            <button
              onClick={onCloseMobile}
              className="w-full py-3 bg-[#0A2A5E] hover:bg-[#071D43] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0A2A5E]/20 mt-4 cursor-pointer border-0"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MemberFilters;
