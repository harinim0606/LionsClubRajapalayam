import React from 'react';
import { Search, Filter, CheckCircle, AlertTriangle, AlertCircle, Unlock, Database, CheckSquare } from 'lucide-react';

const ImportFilters = ({ 
  filter, 
  setFilter, 
  search, 
  setSearch, 
  onCancel, 
  onImportClick, 
  selectedCount,
  onSelectAllMatching,
  onDeselectAll,
  onInvertSelection 
}) => {
  return (
    <div className="flex flex-col lg:flex-row gap-4 bg-white dark:bg-[#1E293B] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm items-center justify-between sticky top-[72px] z-20">
      <div className="flex-1 flex flex-col sm:flex-row items-center gap-4 w-full">
        {selectedCount > 0 && (
          <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg border border-blue-100 dark:border-blue-800 whitespace-nowrap">
            <span className="text-xs font-bold text-blue-700 dark:text-blue-400">
              {selectedCount} Selected
            </span>
            <div className="w-px h-4 bg-blue-200 dark:bg-blue-800"></div>
            <button onClick={onInvertSelection} className="text-xs font-medium text-blue-600 hover:underline">Invert</button>
            <button onClick={onDeselectAll} className="text-xs font-medium text-blue-600 hover:underline">Clear</button>
          </div>
        )}
        
        {/* Search */}
        <div className="relative flex-1 w-full max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, mobile, email, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative w-full sm:w-auto min-w-[200px]">
          <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-8 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none font-bold text-gray-700 dark:text-gray-300 cursor-pointer"
          >
            <option value="all">All Records</option>
            <option value="valid">✅ Valid</option>
            <option value="invalid">❌ Invalid</option>
            <option value="warning">⚠️ Warnings</option>
            <option value="duplicate_excel">📑 Duplicate in Excel</option>
            <option value="duplicate_db">💾 Already in Database</option>
            <option value="overridden">🔓 Overridden</option>
            <option value="selected">✅ Selected Rows</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
        <button 
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button 
          onClick={onImportClick}
          className="px-6 py-2.5 text-sm font-bold text-white bg-[#0A2A5E] hover:bg-[#071D43] rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm shadow-blue-900/20 whitespace-nowrap"
        >
          Import Options ({selectedCount})
        </button>
      </div>
    </div>
  );
};

export default ImportFilters;
