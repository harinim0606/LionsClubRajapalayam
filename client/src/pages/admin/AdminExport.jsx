import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Download, Users, Filter as FilterIcon, MousePointer2,
  FileText, BarChart3, Clock, TrendingUp, RefreshCw
} from "lucide-react";
import api from "../../api/axios";

import ExportFilters from "../../components/export/ExportFilters";
import ColumnSelector from "../../components/export/ColumnSelector";
import ExportProgressModal from "../../components/export/ExportProgressModal";
import ExportHistoryTable from "../../components/export/ExportHistoryTable";

// Default columns
const DEFAULT_COLUMNS = [
  "memberNumber", "name", "dateOfBirth", "age", "weddingDate", "gender",
  "bloodGroup", "mobile", "email", "city", "profession", "clubPosition",
  "status", "joiningYear",
];

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ icon, label, value, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="premium-card p-5 flex items-center gap-4"
  >
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black font-heading text-gray-900 dark:text-white leading-tight">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">{label}</p>
    </div>
  </motion.div>
);

// ─── Export Option Card ────────────────────────────────────────────────────────
const ExportCard = ({ icon, title, description, badge, color, onClick, disabled, isLoading }) => (
  <motion.button
    whileHover={{ y: -3, scale: 1.01 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    disabled={disabled || isLoading}
    className={`premium-card p-5 text-left w-full group transition-all duration-200 hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        {isLoading ? <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-60" /> : icon}
      </div>
      {badge && (
        <span className="px-2 py-1 bg-[#F4B400]/15 text-[#D69E00] dark:text-[#F4B400] text-xs font-bold rounded-full">{badge}</span>
      )}
    </div>
    <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#0A2A5E] dark:group-hover:text-[#F4B400] transition">{title}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
  </motion.button>
);

// ─── Main AdminExport ─────────────────────────────────────────────────────────
const AdminExport = () => {
  // Data State
  const [stats, setStats] = useState({ totalMembers: 0, lastExport: null });
  const [filters, setFilters] = useState({});
  const [selectedColumns, setSelectedColumns] = useState(DEFAULT_COLUMNS);
  const [previewCount, setPreviewCount] = useState(null);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [presets, setPresets] = useState([]);

  // History State
  const [historyRecords, setHistoryRecords] = useState([]);
  const [historyTotal, setHistoryTotal] = useState(0);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [historyLoading, setHistoryLoading] = useState(true);

  // Progress Modal State
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressStage, setProgressStage] = useState("prepare");
  const [progressType, setProgressType] = useState("");
  const [progressRows, setProgressRows] = useState(0);
  const [progressError, setProgressError] = useState(null);
  const [loadingExport, setLoadingExport] = useState(null);

  // ── Initial Data Load
  useEffect(() => {
    fetchStats();
    fetchPresets();
  }, []);

  useEffect(() => {
    fetchHistory(historyPage);
  }, [historyPage]);

  const fetchStats = async () => {
    try {
      const res = await api.get("/export/stats");
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error("Failed to load export stats:", err);
    }
  };

  const fetchHistory = async (page = 1) => {
    setHistoryLoading(true);
    try {
      const res = await api.get(`/export/history?page=${page}&limit=10`);
      if (res.data.success) {
        const { records, total, totalPages } = res.data.data;
        setHistoryRecords(records);
        setHistoryTotal(total);
        setHistoryTotalPages(totalPages);
      }
    } catch (err) {
      console.error("Failed to load export history:", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const fetchPresets = async () => {
    try {
      const res = await api.get("/export/presets");
      if (res.data.success) setPresets(res.data.data);
    } catch (err) { /* silently fail */ }
  };

  // ── Filter Preview
  const handlePreviewCount = async () => {
    setIsPreviewing(true);
    setPreviewCount(null);
    try {
      const res = await api.post("/export/filter-preview", { filters });
      if (res.data.success) setPreviewCount(res.data.data.count);
    } catch (err) {
      toast.error("Preview failed. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  // ── Core Download Helper (handles streaming blob download)
  const downloadBlob = async (apiCall, exportType, totalRows) => {
    setProgressOpen(true);
    setProgressStage("prepare");
    setProgressType(exportType);
    setProgressRows(totalRows);
    setProgressError(null);
    setLoadingExport(exportType);

    try {
      setTimeout(() => setProgressStage("generate"), 600);
      setTimeout(() => setProgressStage("format"), 1400);

      const response = await apiCall();

      setProgressStage("download");

      // Trigger browser download from blob
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const contentDisposition = response.headers["content-disposition"] || "";
      const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/);
      const fileName = fileNameMatch ? fileNameMatch[1] : `LionsClub_Export.xlsx`;

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setTimeout(() => {
        setProgressStage("done");
        fetchStats();
        fetchHistory(1);
        setHistoryPage(1);
        toast.success("Export downloaded successfully!");
      }, 500);

    } catch (err) {
      const msg = err.response?.data?.message || "Export failed. Please try again.";
      setProgressError(msg);
      toast.error(msg);
    } finally {
      setLoadingExport(null);
    }
  };

  // ── Export Actions
  const handleExportAll = () => {
    downloadBlob(
      () => api.get(`/export/members?columns=${selectedColumns.join(",")}`, { responseType: "arraybuffer" }),
      "all",
      stats.totalMembers
    );
  };

  const handleExportFiltered = () => {
    downloadBlob(
      () => api.post("/export/filter", { filters, columns: selectedColumns }, { responseType: "arraybuffer" }),
      "filtered",
      previewCount || null
    );
  };

  const handleExportStatistics = () => {
    downloadBlob(
      () => api.get("/export/statistics", { responseType: "arraybuffer" }),
      "statistics",
      stats.totalMembers
    );
  };

  const handleDownloadTemplate = async () => {
    setLoadingExport("template");
    try {
      const res = await api.get("/export/template", { responseType: "arraybuffer" });
      const blob = new Blob([res.data], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Member_Import_Template.xlsx";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Template downloaded!");
    } catch (err) {
      toast.error("Failed to download template.");
    } finally {
      setLoadingExport(null);
    }
  };

  // ── Preset Management
  const handleSavePreset = async (name) => {
    try {
      await api.post("/export/presets", { name, columns: selectedColumns, filters });
      toast.success(`Preset "${name}" saved!`);
      fetchPresets();
    } catch (err) {
      toast.error("Failed to save preset.");
    }
  };

  const handleLoadPreset = (presetId) => {
    const preset = presets.find(p => p._id === presetId);
    if (!preset) return;
    if (preset.columns?.length) setSelectedColumns(preset.columns);
    if (preset.filters && Object.keys(preset.filters).length > 0) setFilters(preset.filters);
    toast.success(`Preset "${preset.name}" loaded!`);
  };

  // ── Format last export
  const lastExportStr = stats.lastExport
    ? new Date(stats.lastExport.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : "Never";

  const hasFilters = Object.values(filters).some(v => v !== undefined && v !== "" && v !== null);

  return (
    <div className="space-y-6 pb-16">

      {/* ── Hero Banner */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white font-heading">Excel Export</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
            Generate customized, professionally formatted Excel workbooks from your member database. Supports 10,000+ members with streaming export.
          </p>
        </div>
      </div>

      {/* ── Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard delay={0.05} icon={<Users size={22} className="text-[#0A2A5E] dark:text-[#F4B400]" />} label="Total Members" value={stats.totalMembers.toLocaleString()} color="bg-[#0A2A5E]/10 dark:bg-[#F4B400]/15" />
        <StatCard delay={0.10} icon={<FilterIcon size={22} className="text-purple-600 dark:text-purple-400" />} label="Filtered Members" value={previewCount !== null ? previewCount.toLocaleString() : "—"} color="bg-purple-100 dark:bg-purple-900/30" />
        <StatCard delay={0.15} icon={<TrendingUp size={22} className="text-green-600 dark:text-green-400" />} label="Columns Selected" value={selectedColumns.length} color="bg-green-100 dark:bg-green-900/30" />
        <StatCard delay={0.20} icon={<Clock size={22} className="text-orange-600 dark:text-orange-400" />} label="Last Export" value={lastExportStr} color="bg-orange-100 dark:bg-orange-900/30" />
      </div>

      {/* ── Export Option Cards */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Download size={20} className="text-[#0A2A5E] dark:text-[#F4B400]" />
          Export Options
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
          <ExportCard
            icon={<Users size={22} className="text-white" />}
            title="Export All Members"
            description={`Download all ${stats.totalMembers.toLocaleString()} members with selected columns and 4-sheet workbook.`}
            badge="Full DB"
            color="bg-[#0A2A5E]"
            onClick={handleExportAll}
            isLoading={loadingExport === "all"}
          />
          <ExportCard
            icon={<FilterIcon size={22} className="text-white" />}
            title="Export Filtered Members"
            description="Apply filters (status, blood group, city, age, etc.) and download only matching members."
            badge={hasFilters ? "Filtered" : null}
            color="bg-purple-600"
            onClick={handleExportFiltered}
            isLoading={loadingExport === "filtered"}
          />
          <ExportCard
            icon={<BarChart3 size={22} className="text-white" />}
            title="Export Statistics Report"
            description="Generate a detailed statistics workbook with charts, distribution data, and member analytics."
            color="bg-green-600"
            onClick={handleExportStatistics}
            isLoading={loadingExport === "statistics"}
          />
          <ExportCard
            icon={<MousePointer2 size={22} className="text-white" />}
            title="Export Selected Members"
            description="Go to Member Management → select rows → use Bulk Export to download only specific members."
            color="bg-orange-500"
            onClick={() => toast("Use the Bulk Export button in Member Management to export selected members.", { icon: "ℹ️" })}
          />
          <ExportCard
            icon={<FileText size={22} className="text-white" />}
            title="Download Import Template"
            description="Get the standardized Excel template for importing new members via the Import Wizard."
            color="bg-gray-600 dark:bg-gray-700"
            onClick={handleDownloadTemplate}
            isLoading={loadingExport === "template"}
          />
        </div>
      </div>

      {/* ── Filters & Column Selector */}
      <ExportFilters
        filters={filters}
        onChange={(f) => { setFilters(f); setPreviewCount(null); }}
        onPreview={handlePreviewCount}
        previewCount={previewCount}
        isPreviewing={isPreviewing}
      />

      <ColumnSelector
        selectedColumns={selectedColumns}
        onChange={setSelectedColumns}
        presets={presets}
        onSavePreset={handleSavePreset}
        onLoadPreset={handleLoadPreset}
      />

      {/* ── Export Preview Summary */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="premium-card p-6"
      >
        <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-[#0A2A5E] dark:text-[#F4B400]" />
          Export Preview Summary
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Rows to Export", value: previewCount !== null ? previewCount.toLocaleString() : `${stats.totalMembers.toLocaleString()} (all)` },
            { label: "Selected Columns", value: `${selectedColumns.length} columns` },
            { label: "Workbook Sheets", value: hasFilters || previewCount !== null ? "Members + Stats" : "Members, Statistics, Birthdays, Anniversaries" },
            { label: "Estimated Size", value: `~${Math.max(10, Math.round((previewCount ?? stats.totalMembers) * selectedColumns.length * 0.005))} KB` },
          ].map((item, i) => (
            <div key={i} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">{item.label}</p>
              <p className="font-bold text-gray-900 dark:text-white mt-1 text-sm leading-tight">{item.value}</p>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Export History */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock size={20} className="text-[#0A2A5E] dark:text-[#F4B400]" />
            Export Audit Log
          </h2>
          <button
            onClick={() => fetchHistory(historyPage)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition"
          >
            <RefreshCw size={16} /> Refresh
          </button>
        </div>
        <ExportHistoryTable
          records={historyRecords}
          total={historyTotal}
          page={historyPage}
          totalPages={historyTotalPages}
          onPageChange={setHistoryPage}
          isLoading={historyLoading}
        />
      </div>

      {/* ── Progress Modal */}
      <ExportProgressModal
        isOpen={progressOpen}
        stage={progressStage}
        exportType={progressType}
        totalRows={progressRows}
        onClose={() => { setProgressOpen(false); setProgressStage("prepare"); }}
        hasError={!!progressError}
        errorMessage={progressError}
      />
    </div>
  );
};

export default AdminExport;
