import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  History, Search, Filter, Download, Trash2, Eye, CheckCircle,
  AlertTriangle, XCircle, RefreshCw, ChevronLeft, ChevronRight,
  FileSpreadsheet, Clock, Users, AlertCircle, Calendar, X
} from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import * as XLSX from "xlsx";

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatDate = (d) => d ? new Date(d).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—";
const formatDuration = (s) => s ? `${s}s` : "—";

const StatusBadge = ({ status }) => {
  const cfg = {
    "Completed":              { cls: "bg-green-100 text-green-700",  icon: <CheckCircle size={12} /> },
    "Completed With Warnings":{ cls: "bg-yellow-100 text-yellow-700",icon: <AlertTriangle size={12} /> },
    "Failed":                 { cls: "bg-red-100 text-red-700",      icon: <XCircle size={12} /> },
    "Cancelled":              { cls: "bg-gray-100 text-gray-600",    icon: <AlertCircle size={12} /> },
  }[status] ?? { cls: "bg-gray-100 text-gray-600", icon: null };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${cfg.cls}`}>
      {cfg.icon} {status}
    </span>
  );
};

// ── Detail Modal ───────────────────────────────────────────────────────────────
const DetailModal = ({ record, onClose }) => {
  const [downloading, setDownloading] = useState(null);

  const downloadReport = async (type, filename) => {
    setDownloading(type);
    try {
      if (type === 'vcf' || type === 'csv' || filename.endsWith('.json')) {
        window.open(`/api/admin/import/history/${record.importId}/reports/${type}`, "_blank");
        return;
      }
      
      const res = await api.get(`/admin/import/history/${record.importId}/reports/${type}`);
      const data = res.data.data;
      if (!data || data.length === 0) return toast("No data to download");

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Report");
      XLSX.writeFile(wb, filename);
      toast.success("Report downloaded!");
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error("Report no longer available.");
      } else {
        toast.error("Failed to download report.");
      }
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#1E293B] border border-gray-100 dark:border-gray-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A2A5E] to-[#1a4a8f] px-6 py-5 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-white font-heading">{record.fileName}</h2>
            <p className="text-sm text-blue-200 mt-0.5">{formatDate(record.createdAt)}</p>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors p-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Status + Timing */}
          <div className="flex flex-wrap gap-3 items-center">
            <StatusBadge status={record.status} />
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Clock size={12} /> {formatDuration(record.executionTime)}
            </span>
            {record.importedBy && (
              <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                By: <span className="font-bold text-gray-700 dark:text-white">{record.importedBy.username || record.importedBy.name}</span>
              </span>
            )}
          </div>

          {/* Row Statistics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Rows",  val: record.totalRows,    color: "gray"   },
              { label: "Imported",    val: record.importedRows, color: "green"  },
              { label: "Updated",     val: record.updatedRows,  color: "blue"   },
              { label: "Skipped",     val: record.skippedRows,  color: "orange" },
              { label: "Duplicates (DB)", val: record.duplicateDbRows, color: "purple" },
              { label: "Duplicates (Excel)", val: record.duplicateExcelRows, color: "orange" },
              { label: "Overridden",  val: record.overriddenRows, color: "blue" },
              { label: "Warnings",    val: record.warningRows,  color: "yellow" },
              { label: "Invalid",     val: record.invalidRows,  color: "red"    },
              { label: "Users Created",val: record.createdUsers, color: "indigo"  },
            ].map(({ label, val, color }) => {
              const colMap = {
                gray:   "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300",
                green:  "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400",
                blue:   "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400",
                orange: "bg-orange-50 dark:bg-orange-950/20 border-orange-100 dark:border-orange-900/30 text-orange-700 dark:text-orange-400",
                purple: "bg-purple-50 dark:bg-purple-950/20 border-purple-100 dark:border-purple-900/30 text-purple-700 dark:text-purple-400",
                yellow: "bg-yellow-50 dark:bg-yellow-950/20 border-yellow-100 dark:border-yellow-900/30 text-yellow-700 dark:text-yellow-400",
                red:    "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400",
                indigo: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400",
              }[color] || "bg-gray-50 dark:bg-gray-800/40 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-300";

              return (
                <div key={label} className={`border rounded-2xl p-3 text-center ${colMap}`}>
                  <p className="text-xl font-black">{val ?? 0}</p>
                  <p className="text-[10px] font-bold uppercase mt-0.5 opacity-80">{label}</p>
                </div>
              );
            })}
          </div>

          {/* Timing */}
          {record.importStartedAt && (
            <div className="bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-700/50 rounded-2xl p-4 text-sm space-y-1">
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Started:</span> <span className="text-gray-500 dark:text-gray-400">{formatDate(record.importStartedAt)}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Completed:</span> <span className="text-gray-500 dark:text-gray-400">{formatDate(record.importCompletedAt)}</span></p>
              <p><span className="font-semibold text-gray-700 dark:text-gray-300">Duration:</span> <span className="text-gray-500 dark:text-gray-400">{record.executionTime}s</span></p>
            </div>
          )}

          {/* Notes (for failed imports) */}
          {record.notes && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-4">
              <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 uppercase">Error Notes</p>
              <p className="text-sm text-red-600 dark:text-red-400">{record.notes}</p>
            </div>
          )}

          {/* Download Reports */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Download Reports</p>
            
            <button
                onClick={() => downloadReport("combined", "Credentials.xlsx")}
                disabled={downloading === "combined"}
                className="w-full py-3 bg-[#0A2A5E] hover:bg-[#071D43] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-sm"
              >
                {downloading === "combined" ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Combined Credentials (.xlsx)
            </button>
 
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadReport("usernames", "Usernames.xlsx")}
                disabled={downloading === "usernames"}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {downloading === "usernames" ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Usernames
              </button>
              <button
                onClick={() => downloadReport("passwords", "Passwords.xlsx")}
                disabled={downloading === "passwords"}
                className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {downloading === "passwords" ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Passwords
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => downloadReport("vcf", "Contacts.vcf")}
                disabled={downloading === "vcf"}
                className="flex-1 py-3 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/30 rounded-xl font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 text-[11px]"
              >
                {downloading === "vcf" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                VCF
              </button>
              <button
                onClick={() => downloadReport("csv", "Report.csv")}
                disabled={downloading === "csv"}
                className="flex-1 py-3 bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/30 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 text-[11px]"
              >
                {downloading === "csv" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                CSV
              </button>
              <button
                onClick={() => downloadReport("combined", "Report.json")}
                disabled={downloading === "combined"}
                className="flex-1 py-3 bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/30 rounded-xl font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 text-[11px]"
              >
                {downloading === "combined" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                JSON
              </button>
            </div>
 
            <button
                onClick={() => downloadReport("errors", "Errors.xlsx")}
                disabled={downloading === "errors"}
                className="w-full py-3 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/30 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {downloading === "errors" ? <RefreshCw size={16} className="animate-spin" /> : <AlertTriangle size={16} />}
                Error Report
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const AdminImportHistory = () => {
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);

  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page,
        limit: 15,
        ...(search && { search }),
        ...(statusFilter && { status: statusFilter }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      });
      const res = await api.get(`/admin/import/history?${params}`);
      const { history: h, pagination: pg, stats: s } = res.data.data;
      setHistory(h);
      setPagination(pg);
      setStats(s);
    } catch {
      toast.error("Failed to load import history");
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, dateFrom, dateTo]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const handleDelete = async (importId) => {
    if (!window.confirm("Delete this import history record? (Imported members will NOT be deleted)")) return;
    setDeletingId(importId);
    try {
      await api.delete(`/admin/import/history/${importId}`);
      toast.success("History record deleted");
      fetchHistory();
    } catch {
      toast.error("Failed to delete history record");
    } finally {
      setDeletingId(null);
    }
  };

  const clearFilters = () => {
    setSearch(""); setStatusFilter(""); setDateFrom(""); setDateTo(""); setPage(1);
  };

  const hasFilters = search || statusFilter || dateFrom || dateTo;

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  const Skeleton = () => (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-14 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading flex items-center gap-2">
              <History size={22} className="text-[#0A2A5E] dark:text-[#F4B400]" /> Import History
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
              Permanent audit trail of all bulk Excel imports.
            </p>
          </div>
          <button onClick={fetchHistory} className="p-2 text-gray-400 hover:text-[#0A2A5E] dark:hover:text-[#F4B400] hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Imports",       val: stats.totalImports,          icon: <FileSpreadsheet size={18} />, colorCls: "bg-blue-50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900/30 text-blue-700 dark:text-blue-400", iconCls: "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" },
            { label: "Successful",          val: stats.successCount,          icon: <CheckCircle     size={18} />, colorCls: "bg-green-50 dark:bg-green-950/20 border-green-100 dark:border-green-900/30 text-green-700 dark:text-green-400", iconCls: "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400" },
            { label: "Failed",              val: stats.failedCount,           icon: <XCircle         size={18} />, colorCls: "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30 text-red-700 dark:text-red-400", iconCls: "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" },
            { label: "Members Imported",    val: stats.totalMembersImported,  icon: <Users           size={18} />, colorCls: "bg-indigo-50 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/30 text-indigo-700 dark:text-indigo-400", iconCls: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400" },
          ].map(({ label, val, icon, colorCls, iconCls }) => (
            <div key={label} className={`border rounded-2xl p-4 flex items-center gap-4 ${colorCls}`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconCls}`}>
                {icon}
              </div>
              <div>
                <p className="text-2xl font-black leading-tight dark:text-white">{val ?? 0}</p>
                <p className="text-xs font-bold uppercase opacity-80">{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 outline-none transition-all text-gray-900 dark:text-white"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 outline-none text-gray-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Completed With Warnings">With Warnings</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date range */}
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 outline-none text-gray-900 dark:text-white" />
          <span className="text-gray-400 dark:text-gray-500 text-sm font-medium">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="py-2 px-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 dark:focus:ring-[#F4B400]/20 outline-none text-gray-900 dark:text-white" />
 
          {hasFilters && (
            <button onClick={clearFilters} className="py-2 px-3 text-sm font-bold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors flex items-center gap-1">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><Skeleton /></div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <History size={28} />
            </div>
            <p className="text-lg font-bold text-gray-700 dark:text-white">No import history found</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Import your first Excel file to see records here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
                  <tr>
                    {["Import Date", "File Name", "Imported By", "Rows", "Imported", "Skipped", "Warnings", "Status", "Time", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {history.map((rec) => (
                    <motion.tr
                      key={rec._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(rec.createdAt)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white max-w-[150px] truncate">{rec.fileName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{rec.importedBy?.username ?? "—"}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900 dark:text-white">{rec.totalRows ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600 dark:text-green-400">{rec.importedRows ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-500 dark:text-orange-400">{rec.skippedRows ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-yellow-600 dark:text-yellow-400">{rec.warningRows ?? 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDuration(rec.executionTime)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="p-1.5 text-[#0A2A5E] dark:text-[#F4B400] hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.importId)}
                            disabled={deletingId === rec.importId}
                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors disabled:opacity-50"
                            title="Delete Record"
                          >
                            {deletingId === rec.importId
                              ? <RefreshCw size={16} className="animate-spin" />
                              : <Trash2 size={16} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
 
            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing page <span className="font-bold text-gray-700 dark:text-white">{pagination.currentPage}</span> of <span className="font-bold text-gray-700 dark:text-white">{pagination.totalPages}</span>
                  <span className="ml-2 text-gray-400">({pagination.total} total)</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="p-2 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-750 text-gray-600 dark:text-gray-400 disabled:opacity-40 transition-colors"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedRecord && (
          <DetailModal record={selectedRecord} onClose={() => setSelectedRecord(null)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminImportHistory;
