import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { motion } from 'framer-motion';

const MemberFilters = ({ search, onSearchChange, filters, onFiltersChange, onClearFilters }) => {
  const hasActiveFilters = search || filters.status || filters.bloodGroup || filters.clubPosition || filters.zone || filters.region || filters.chapter;

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex flex-col md:flex-row gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
    >
      {/* Search */}
      <div className="flex-1 relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, member no, phone, email..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 focus:border-[#0A2A5E] dark:focus:border-[#F4B400] outline-none transition-all dark:text-white"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs font-bold text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors px-2"
          >
            <X size={14} /> Clear
          </button>
        )}
        <div className="relative">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filters.status || ''}
            onChange={(e) => onFiltersChange({ ...filters, status: e.target.value })}
            className="pl-8 pr-8 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 outline-none appearance-none font-medium text-gray-700 dark:text-gray-300"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        
        <select
          value={filters.bloodGroup || ''}
          onChange={(e) => onFiltersChange({ ...filters, bloodGroup: e.target.value })}
          className="px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 outline-none font-medium text-gray-700 dark:text-gray-300"
        >
          <option value="">All Blood Groups</option>
          <option value="A+">A+</option>
          <option value="A-">A-</option>
          <option value="B+">B+</option>
          <option value="B-">B-</option>
          <option value="AB+">AB+</option>
          <option value="AB-">AB-</option>
          <option value="O+">O+</option>
          <option value="O-">O-</option>
        </select>
      </div>
    </motion.div>
  );
};

export default MemberFilters;
