import React from 'react';
import { Users, CheckCircle, AlertTriangle, XCircle, Copy, CheckSquare } from 'lucide-react';

const ImportStatsCards = ({ stats, selectedCount }) => {
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
      <div className="bg-white dark:bg-[#1E293B] p-3 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center text-center transition hover:shadow-md">
        <Users size={18} className="text-gray-400 mb-1" />
        <span className="text-xl font-black text-gray-900 dark:text-white">{stats.totalRows}</span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Total Rows</span>
      </div>
      
      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-2xl border border-green-100 dark:border-green-900/30 shadow-sm flex flex-col items-center text-center transition hover:shadow-md">
        <CheckCircle size={18} className="text-green-500 mb-1" />
        <span className="text-xl font-black text-green-700 dark:text-green-400">{stats.validCount}</span>
        <span className="text-[10px] font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Valid</span>
      </div>

      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-2xl border border-purple-100 dark:border-purple-900/30 shadow-sm flex flex-col items-center text-center transition hover:shadow-md">
        <Copy size={18} className="text-purple-500 mb-1" />
        <span className="text-xl font-black text-purple-700 dark:text-purple-400">{stats.duplicateDbCount}</span>
        <span className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider text-balance">DB Duplicates</span>
      </div>

      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-2xl border border-orange-100 dark:border-orange-900/30 shadow-sm flex flex-col items-center text-center transition hover:shadow-md">
        <Copy size={18} className="text-orange-500 mb-1" />
        <span className="text-xl font-black text-orange-700 dark:text-orange-400">{stats.duplicateExcelCount}</span>
        <span className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider text-balance">Excel Dups</span>
      </div>

      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 shadow-sm flex flex-col items-center text-center transition hover:shadow-md">
        <AlertTriangle size={18} className="text-yellow-500 mb-1" />
        <span className="text-xl font-black text-yellow-700 dark:text-yellow-400">{stats.warningCount}</span>
        <span className="text-[10px] font-bold text-yellow-700 dark:text-yellow-400 uppercase tracking-wider">Warnings</span>
      </div>

      <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-sm flex flex-col items-center text-center transition hover:shadow-md">
        <XCircle size={18} className="text-red-500 mb-1" />
        <span className="text-xl font-black text-red-700 dark:text-red-400">{stats.invalidCount}</span>
        <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-wider">Invalid</span>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-2xl border border-blue-100 dark:border-blue-900/30 shadow-sm flex flex-col items-center text-center transition hover:shadow-md ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-[#1E293B]">
        <CheckSquare size={18} className="text-blue-500 mb-1" />
        <span className="text-xl font-black text-blue-700 dark:text-blue-400">{selectedCount}</span>
        <span className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Selected</span>
      </div>
    </div>
  );
};

export default ImportStatsCards;
