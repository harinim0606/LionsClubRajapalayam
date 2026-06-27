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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden"
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
            <span className="text-xs font-medium text-gray-500 flex items-center gap-1">
              <Clock size={12} /> {formatDuration(record.executionTime)}
            </span>
            {record.importedBy && (
              <span className="text-xs font-medium text-gray-500">
                By: <span className="font-bold text-gray-700">{record.importedBy.username || record.importedBy.name}</span>
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
            ].map(({ label, val, color }) => (
              <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-3 text-center`}>
                <p className={`text-xl font-black text-${color}-700`}>{val ?? 0}</p>
                <p className={`text-[10px] font-bold text-${color}-600 uppercase mt-0.5`}>{label}</p>
              </div>
            ))}
          </div>

          {/* Timing */}
          {record.importStartedAt && (
            <div className="bg-gray-50 rounded-2xl p-4 text-sm space-y-1">
              <p><span className="font-semibold text-gray-700">Started:</span> <span className="text-gray-500">{formatDate(record.importStartedAt)}</span></p>
              <p><span className="font-semibold text-gray-700">Completed:</span> <span className="text-gray-500">{formatDate(record.importCompletedAt)}</span></p>
              <p><span className="font-semibold text-gray-700">Duration:</span> <span className="text-gray-500">{record.executionTime}s</span></p>
            </div>
          )}

          {/* Notes (for failed imports) */}
          {record.notes && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
              <p className="text-xs font-bold text-red-700 mb-1 uppercase">Error Notes</p>
              <p className="text-sm text-red-600">{record.notes}</p>
            </div>
          )}

          {/* Download Reports */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Download Reports</p>
            
            <button
                onClick={() => downloadReport("combined", "Credentials.xlsx")}
                disabled={downloading === "combined"}
                className="w-full py-3 bg-[#0A2A5E] text-white rounded-xl font-bold hover:bg-[#071D43] transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm shadow-sm"
              >
                {downloading === "combined" ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Combined Credentials (.xlsx)
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => downloadReport("usernames", "Usernames.xlsx")}
                disabled={downloading === "usernames"}
                className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {downloading === "usernames" ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Usernames
              </button>
              <button
                onClick={() => downloadReport("passwords", "Passwords.xlsx")}
                disabled={downloading === "passwords"}
                className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              >
                {downloading === "passwords" ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                Passwords
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => downloadReport("vcf", "Contacts.vcf")}
                disabled={downloading === "vcf"}
                className="flex-1 py-3 bg-green-50 text-green-700 border border-green-200 rounded-xl font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 text-[11px]"
              >
                {downloading === "vcf" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                VCF
              </button>
              <button
                onClick={() => downloadReport("csv", "Report.csv")}
                disabled={downloading === "csv"}
                className="flex-1 py-3 bg-blue-50 text-blue-700 border border-blue-200 rounded-xl font-bold hover:bg-blue-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 text-[11px]"
              >
                {downloading === "csv" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                CSV
              </button>
              <button
                onClick={() => downloadReport("combined", "Report.json")}
                disabled={downloading === "combined"}
                className="flex-1 py-3 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl font-bold hover:bg-purple-100 transition-colors flex items-center justify-center gap-1 disabled:opacity-70 text-[11px]"
              >
                {downloading === "combined" ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                JSON
              </button>
            </div>

            <button
                onClick={() => downloadReport("errors", "Errors.xlsx")}
                disabled={downloading === "errors"}
                className="w-full py-3 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
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
        <div key={i} className="h-14 bg-gray-100 rounded-2xl" />
      ))}
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 font-heading flex items-center gap-2">
              <History size={22} className="text-[#0A2A5E]" /> Import History
            </h1>
            <p className="text-sm text-gray-500 font-medium mt-1">
              Permanent audit trail of all bulk Excel imports.
            </p>
          </div>
          <button onClick={fetchHistory} className="p-2 text-gray-400 hover:text-[#0A2A5E] hover:bg-gray-50 rounded-xl transition-colors">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Imports",       val: stats.totalImports,          icon: <FileSpreadsheet size={18} />, color: "blue"  },
            { label: "Successful",          val: stats.successCount,          icon: <CheckCircle     size={18} />, color: "green" },
            { label: "Failed",              val: stats.failedCount,           icon: <XCircle         size={18} />, color: "red"   },
            { label: "Members Imported",    val: stats.totalMembersImported,  icon: <Users           size={18} />, color: "indigo"},
          ].map(({ label, val, icon, color }) => (
            <div key={label} className={`bg-${color}-50 border border-${color}-100 rounded-2xl p-4 flex items-center gap-4`}>
              <div className={`w-10 h-10 bg-${color}-100 rounded-xl flex items-center justify-center text-${color}-600 shrink-0`}>
                {icon}
              </div>
              <div>
                <p className={`text-2xl font-black text-${color}-700`}>{val ?? 0}</p>
                <p className={`text-xs font-bold text-${color}-600 uppercase`}>{label}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by filename..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 outline-none transition-all"
            />
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#0A2A5E]/20 outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Completed With Warnings">With Warnings</option>
            <option value="Failed">Failed</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Date range */}
          <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 outline-none" />
          <span className="text-gray-400 text-sm font-medium">to</span>
          <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 outline-none" />

          {hasFilters && (
            <button onClick={clearFilters} className="py-2 px-3 text-sm font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors flex items-center gap-1">
              <X size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6"><Skeleton /></div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
              <History size={28} />
            </div>
            <p className="text-lg font-bold text-gray-700">No import history found</p>
            <p className="text-sm text-gray-500 mt-1">Import your first Excel file to see records here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Import Date", "File Name", "Imported By", "Rows", "Imported", "Skipped", "Warnings", "Status", "Time", "Actions"].map(h => (
                      <th key={h} className="px-4 py-3 text-xs font-bold text-gray-500 uppercase whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((rec) => (
                    <motion.tr
                      key={rec._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-gray-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(rec.createdAt)}</td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-900 max-w-[150px] truncate">{rec.fileName}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{rec.importedBy?.username ?? "—"}</td>
                      <td className="px-4 py-3 text-sm font-bold text-gray-900">{rec.totalRows ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-green-600">{rec.importedRows ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-orange-500">{rec.skippedRows ?? 0}</td>
                      <td className="px-4 py-3 text-sm font-bold text-yellow-600">{rec.warningRows ?? 0}</td>
                      <td className="px-4 py-3"><StatusBadge status={rec.status} /></td>
                      <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDuration(rec.executionTime)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedRecord(rec)}
                            className="p-1.5 text-[#0A2A5E] hover:bg-blue-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(rec.importId)}
                            disabled={deletingId === rec.importId}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
                <p className="text-sm text-gray-500">
                  Showing page <span className="font-bold text-gray-700">{pagination.currentPage}</span> of <span className="font-bold text-gray-700">{pagination.totalPages}</span>
                  <span className="ml-2 text-gray-400">({pagination.total} total)</span>
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))}
                    disabled={page === pagination.totalPages}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
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
