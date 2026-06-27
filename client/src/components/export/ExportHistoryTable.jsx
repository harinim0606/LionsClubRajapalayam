import React, { useState } from "react";
import { motion } from "framer-motion";
import { History, FileSpreadsheet, User, Clock, CheckCircle2, XCircle, ChevronLeft, ChevronRight } from "lucide-react";

const EXPORT_TYPE_LABELS = {
  all: "All Members",
  filtered: "Filtered",
  selected: "Selected",
  template: "Template",
  statistics: "Statistics",
};

const EXPORT_TYPE_COLORS = {
  all: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400",
  filtered: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400",
  selected: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
  template: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400",
  statistics: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
};

const formatDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

const ExportHistoryTable = ({ records = [], total = 0, page = 1, totalPages = 1, onPageChange, isLoading }) => {
  const [expandedId, setExpandedId] = useState(null);

  if (isLoading) {
    return (
      <div className="premium-card p-8">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 items-center">
              <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="premium-card p-12 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
          <History size={28} className="text-gray-400" />
        </div>
        <div>
          <p className="font-bold text-gray-700 dark:text-white">No Export History</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Your export history will appear here after your first export.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="premium-card overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#0A2A5E]/10 dark:bg-[#F4B400]/15 flex items-center justify-center">
            <History size={18} className="text-[#0A2A5E] dark:text-[#F4B400]" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white">Export History</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{total.toLocaleString()} total exports logged</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-gray-800">
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">File Name</th>
              <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rows</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Admin</th>
              <th className="text-left px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
              <th className="text-right px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Time</th>
              <th className="text-center px-6 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.map((rec, idx) => (
              <motion.tr
                key={rec._id}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`border-b border-gray-50 dark:border-gray-800/50 cursor-pointer transition hover:bg-gray-50 dark:hover:bg-gray-800/30 ${idx % 2 === 0 ? "" : "bg-gray-50/50 dark:bg-gray-800/20"}`}
                onClick={() => setExpandedId(expandedId === rec._id ? null : rec._id)}
              >
                <td className="px-6 py-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${EXPORT_TYPE_COLORS[rec.exportType] || EXPORT_TYPE_COLORS.all}`}>
                    {EXPORT_TYPE_LABELS[rec.exportType] || rec.exportType}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet size={16} className="text-green-600 dark:text-green-400 shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300 font-medium truncate max-w-[200px]">{rec.fileName || "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right font-semibold text-gray-700 dark:text-gray-300">{rec.totalRows?.toLocaleString() || 0}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5">
                    <User size={14} className="text-gray-400" />
                    <span className="text-gray-600 dark:text-gray-400">{rec.exportedBy?.username || "—"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-xs">{formatDate(rec.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1 text-gray-500 dark:text-gray-400">
                    <Clock size={12} />
                    <span className="text-xs">{rec.executionTime}s</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">
                  {rec.status === "Completed" ? (
                    <CheckCircle2 size={18} className="text-green-500 mx-auto" />
                  ) : (
                    <XCircle size={18} className="text-red-500 mx-auto" />
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
          <div className="flex gap-2">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition"
            >
              <ChevronLeft size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-40 transition"
            >
              <ChevronRight size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportHistoryTable;
