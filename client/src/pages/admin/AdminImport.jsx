import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileSpreadsheet, CheckCircle, AlertTriangle, Download, Info } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

import ImportStatsCards from "../../components/admin/import/ImportStatsCards";
import ImportFilters from "../../components/admin/import/ImportFilters";
import ImportPreviewTable from "../../components/admin/import/ImportPreviewTable";
import ImportOptionsModal from "../../components/admin/import/ImportOptionsModal";
import ImportOverrideModal from "../../components/admin/import/ImportOverrideModal";
import ImportProgressModal from "../../components/admin/import/ImportProgressModal";

const STEP_UPLOAD = 0;
const STEP_PREVIEW = 1;
const STEP_SUMMARY = 2;

const AdminImport = () => {
  const [step, setStep] = useState(STEP_UPLOAD);
  
  // Upload State
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Preview State
  const [previewId, setPreviewId] = useState(null);
  const [stats, setStats] = useState(null);
  const [previewData, setPreviewData] = useState([]); // current page data
  
  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Selection State
  const [selectedRowIds, setSelectedRowIds] = useState(new Set());
  const [isSelectAllMatching, setIsSelectAllMatching] = useState(false);
  const [matchingIdsCount, setMatchingIdsCount] = useState(0);

  // Import State
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [overrideModalRow, setOverrideModalRow] = useState(null); // stores { rowNum, ...row }
  const [isImporting, setIsImporting] = useState(false);
  const [summary, setSummary] = useState(null);

  // --- 1. File Upload ---
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected && selected.name.endsWith(".xlsx")) {
      if (selected.size > 50 * 1024 * 1024) return toast.error("File size must be < 50MB");
      setFile(selected);
    } else {
      toast.error("Please select a valid .xlsx file");
      e.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append("excel", file);

    try {
      const res = await api.post("/admin/import/preview", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const { previewId: pId, stats: newStats } = res.data.data;
      
      setPreviewId(pId);
      setStats(newStats);
      setStep(STEP_PREVIEW);
      toast.success("File parsed successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to parse Excel file");
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  };

  // --- 2. Fetch Preview Data ---
  // Use a ref so fetchPreviewData always reads the latest previewId/filter/search
  // without creating a stale closure. This avoids the race condition where
  // previewId is still null in the first render after upload.
  const previewIdRef = useRef(previewId);
  const pageRef = useRef(page);
  const limitRef = useRef(limit);
  const filterRef = useRef(filter);
  const searchRef = useRef(search);
  useEffect(() => { previewIdRef.current = previewId; }, [previewId]);
  useEffect(() => { pageRef.current = page; }, [page]);
  useEffect(() => { limitRef.current = limit; }, [limit]);
  useEffect(() => { filterRef.current = filter; }, [filter]);
  useEffect(() => { searchRef.current = search; }, [search]);

  const fetchPreviewData = useCallback(async () => {
    const pid = previewIdRef.current;
    if (!pid) return;
    setIsLoading(true);
    try {
      const res = await api.post(`/admin/import/preview/${pid}/data`, {
        page: pageRef.current,
        limit: limitRef.current,
        filter: filterRef.current,
        search: searchRef.current
      });
      setPreviewData(res.data.data.rows);
      setTotalPages(Math.ceil(res.data.data.total / limitRef.current));
      setStats(res.data.data.stats);
      setSelectedRowIds(prev => {
        // If select-all-matching was on, clear it on any data reload (filter/page change)
        return prev;
      });
    } catch (error) {
      const msg = error.response?.data?.message || error.message || "Failed to load preview data";
      console.error("fetchPreviewData error:", msg, error);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []); // stable — reads everything from refs

  // Trigger fetch whenever previewId, page, filter, or search changes
  useEffect(() => {
    if (!previewId || step !== STEP_PREVIEW) return;
    const timer = setTimeout(() => {
      fetchPreviewData();
    }, search ? 300 : 0); // debounce search, instant for page/filter changes
    return () => clearTimeout(timer);
  }, [previewId, step, page, filter, search, fetchPreviewData]);

  // --- 3. Inline Edit & Override ---
  const handleRowEdit = async (rowNum, updateData) => {
    try {
      const res = await api.put(`/admin/import/preview/${previewId}/row/${rowNum}`, updateData);
      setStats(res.data.data.stats);
      setPreviewData(prev => prev.map(row => row.rowNum === rowNum ? res.data.data.row : row));
      toast.success("Row updated & revalidated");
    } catch (error) {
      toast.error("Failed to update row");
    }
  };

  const handleRowOverrideTrigger = (rowNum) => {
    const row = previewData.find(r => r.rowNum === rowNum);
    if (row) setOverrideModalRow(row);
  };

  const handleRowOverrideConfirm = async (rowNum, reason) => {
    try {
      const res = await api.post(`/admin/import/preview/${previewId}/override`, { rowNumbers: [rowNum], overrideReason: reason });
      setStats(res.data.data.stats);
      setPreviewData(prev => prev.map(row => row.rowNum === rowNum ? { ...row, status: 'overridden', isOverridden: true, errors: [] } : row));
      setOverrideModalRow(null);
      toast.success("Row validation overridden");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to override row");
    }
  };

  const handleRowDelete = async (rowNum) => {
    if (!window.confirm(`Are you sure you want to delete row ${rowNum}?`)) return;
    try {
      const res = await api.post(`/admin/import/preview/${previewId}/resolve/${rowNum}`, { action: 'delete' });
      setStats(res.data.data.stats);
      setPreviewData(prev => prev.filter(row => row.rowNum !== rowNum));
      toast.success("Duplicate row deleted");
    } catch (error) {
      toast.error("Failed to delete row");
    }
  };

  const handleRowCompare = async (rowNum) => {
    try {
      const res = await api.get(`/admin/import/preview/${previewId}/compare/${rowNum}`);
      const { excelRow, dbMember } = res.data.data;
      // For now, we just alert a basic comparison
      alert(`EXCEL ROW:\nName: ${excelRow.name}\nMobile: ${excelRow.mobile}\nEmail: ${excelRow.email}\n\nDATABASE MEMBER:\nName: ${dbMember.name}\nMobile: ${dbMember.mobile}\nEmail: ${dbMember.email}`);
    } catch (error) {
      toast.error("Failed to load comparison");
    }
  };

  // --- 4. Selection Management ---
  const toggleRowSelection = (id) => {
    const newSet = new Set(selectedRowIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedRowIds(newSet);
    setIsSelectAllMatching(false);
  };

  const toggleAllPage = (pageData, isChecked) => {
    const newSet = new Set(selectedRowIds);
    pageData.forEach(r => {
      if (['valid', 'warning', 'overridden'].includes(r.status)) {
        if (isChecked) newSet.add(r.id);
        else newSet.delete(r.id);
      }
    });
    setSelectedRowIds(newSet);
    setIsSelectAllMatching(false);
  };

  const handleSelectAllMatching = async () => {
    setIsLoading(true);
    try {
      const res = await api.post(`/admin/import/preview/${previewId}/matching`, { filter, search });
      const validIds = res.data.data; 
      setSelectedRowIds(new Set(validIds));
      setIsSelectAllMatching(true);
      setMatchingIdsCount(validIds.length);
      toast.success(`Selected all ${validIds.length} matching rows`);
    } catch (error) {
      toast.error("Failed to select matching rows");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInvertSelection = () => {
    const newSet = new Set();
    previewData.forEach(r => {
      if (['valid', 'warning', 'overridden'].includes(r.status)) {
        if (!selectedRowIds.has(r.id)) newSet.add(r.id);
      }
    });
    setSelectedRowIds(newSet);
    setIsSelectAllMatching(false);
  };

  const handleDeselectAll = () => {
    setSelectedRowIds(new Set());
    setIsSelectAllMatching(false);
  };

  // --- 5. Import Execution ---
  const executeImport = async (options) => {
    setIsImporting(true);
    setShowOptionsModal(false);
    setShowProgressModal(true); // Open SSE progress modal

    try {
      const res = await api.post("/admin/import/confirm", {
        previewId,
        selectedRowIds: Array.from(selectedRowIds),
        options
      });
      setSummary(res.data.data);
      // We don't set STEP_SUMMARY here immediately.
      // ImportProgressModal will call onComplete when it receives the 'completed' SSE event.
    } catch (error) {
      // It failed before SSE finished, or API rejected immediately
      toast.error(error.response?.data?.message || "Import request failed");
      setIsImporting(false);
      setShowProgressModal(false);
    }
  };

  const handleProgressComplete = () => {
    setShowProgressModal(false);
    setIsImporting(false);
    setStep(STEP_SUMMARY);
    toast.success("Import Completed");
  };

  const handleProgressError = (msg) => {
    setShowProgressModal(false);
    setIsImporting(false);
    toast.error(msg || "Import failed during processing");
  };

  const resetImport = () => {
    setFile(null);
    setPreviewId(null);
    setPreviewData([]);
    setStats(null);
    setSelectedRowIds(new Set());
    setSummary(null);
    setSearch("");
    setFilter("all");
    setPage(1);
    setIsSelectAllMatching(false);
    setStep(STEP_UPLOAD);
  };

  const downloadReport = async (type, filename) => {
    if (!summary?.historyId) return;
    
    // For VCF and CSV, the backend sends the file directly as an attachment
    if (type === 'vcf' || type === 'csv') {
      window.open(`/api/admin/import/report/${summary.historyId}/${type}`, "_blank");
      return;
    }

    // For other types, backend sends JSON. We convert it to XLSX on the frontend.
    try {
      const res = await api.get(`/admin/import/report/${summary.historyId}/${type}`);
      const data = res.data.data;
      if (!data || data.length === 0) return toast("No data to download", { icon: "🤷" });

      // Dynamic import XLSX so it doesn't block initial page load
      const XLSX = await import('xlsx');
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Report");
      XLSX.writeFile(workbook, filename);
    } catch (error) {
      toast.error("Failed to download report");
    }
  };

  return (
    <div className="space-y-6 pb-20 max-w-[1400px] mx-auto">
      <div className="bg-white dark:bg-[#1E293B] p-6 rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <h1 className="text-2xl font-black text-[#0A2A5E] dark:text-white tracking-tight">Enterprise Bulk Import</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mt-1">
          Import up to 50,000+ members efficiently with advanced duplicate detection and inline editing.
        </p>
      </div>

      <AnimatePresence mode="wait">
        
        {step === STEP_UPLOAD && (
          <motion.div key="step0" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8">
              <div
                className={`border-2 border-dashed rounded-3xl p-12 text-center transition-colors cursor-pointer ${file ? 'border-[#0A2A5E] bg-blue-50/50 dark:bg-blue-900/10' : 'border-gray-300 dark:border-gray-700 hover:border-[#0A2A5E] hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault();
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFileChange({ target: { files: e.dataTransfer.files } });
                }}
              >
                {!file ? (
                  <>
                    <div className="w-16 h-16 bg-[#0A2A5E]/10 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-[#0A2A5E] dark:text-blue-400">
                      <Upload size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Drag & Drop Excel File</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Only .xlsx files are supported. Max size 50MB.</p>
                    <span className="px-6 py-2.5 bg-gray-900 dark:bg-gray-700 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors inline-block pointer-events-none">
                      Choose File
                    </span>
                    <input type="file" accept=".xlsx" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
                  </>
                ) : (
                  <div onClick={e => e.stopPropagation()}>
                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 dark:text-green-400">
                      <FileSpreadsheet size={28} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">{file.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <div className="flex items-center justify-center gap-3">
                      <button onClick={() => setFile(null)} className="px-6 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-bold hover:bg-gray-200 transition-colors">
                        Remove
                      </button>
                      <button onClick={handleUpload} disabled={isUploading} className="px-6 py-2.5 bg-[#0A2A5E] text-white rounded-xl font-bold hover:bg-[#071D43] transition-colors shadow-sm disabled:opacity-70 flex items-center gap-2">
                        {isUploading ? <span className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" /> : null}
                        Process File
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {step === STEP_PREVIEW && stats && (
          <motion.div key="step1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            
            <ImportStatsCards stats={stats} selectedCount={selectedRowIds.size} />
            
            <ImportFilters 
              filter={filter} setFilter={(v) => { setFilter(v); setPage(1); }}
              search={search} setSearch={(v) => { setSearch(v); setPage(1); }}
              selectedCount={selectedRowIds.size}
              onCancel={resetImport}
              onImportClick={() => setShowOptionsModal(true)}
              onInvertSelection={handleInvertSelection}
              onDeselectAll={handleDeselectAll}
            />

            {/* Select All Matching Banner */}
            {!isSelectAllMatching && totalPages > 1 && filter !== "invalid" && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-3 rounded-xl flex items-center justify-center gap-4 text-sm shadow-sm transition-all">
                <p className="text-blue-800 dark:text-blue-300 font-medium">
                  {selectedRowIds.size} rows selected on this page.
                </p>
                <button 
                  onClick={handleSelectAllMatching}
                  className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  Select all matching rows in {filter === 'all' ? 'this file' : `this filter`}
                </button>
              </div>
            )}
            {isSelectAllMatching && (
               <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-3 rounded-xl flex items-center justify-center gap-4 text-sm shadow-sm transition-all">
                <CheckCircle size={16} className="text-green-500" />
                <p className="text-green-800 dark:text-green-300 font-medium">
                  All {matchingIdsCount} matching rows are selected.
                </p>
                <button 
                  onClick={() => { setSelectedRowIds(new Set()); setIsSelectAllMatching(false); }}
                  className="font-bold text-green-700 dark:text-green-400 hover:underline flex items-center gap-1 ml-4"
                >
                  Clear Selection
                </button>
              </div>
            )}

            <ImportPreviewTable 
              data={previewData}
              isLoading={isLoading}
              selectedRowIds={selectedRowIds}
              onToggleRow={toggleRowSelection}
              onToggleAllPage={toggleAllPage}
              onRowEdit={handleRowEdit}
              onRowOverride={handleRowOverrideTrigger}
              onRowDelete={handleRowDelete}
              onRowCompare={handleRowCompare}
              page={page}
              totalPages={totalPages}
              setPage={setPage}
            />

          </motion.div>
        )}

        {step === STEP_SUMMARY && summary && (
          <motion.div key="step2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm p-8 text-center max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
              <CheckCircle size={40} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight mb-2">Import Completed</h2>
            <p className="text-gray-500 dark:text-gray-400 font-medium mb-8">Successfully executed bulk import operation.</p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700">
                <p className="text-2xl font-black text-gray-900 dark:text-white">{summary.totalImported}</p>
                <p className="text-[10px] font-bold text-gray-500 uppercase mt-1 tracking-wider">New Members</p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50">
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400">{summary.totalUpdated}</p>
                <p className="text-[10px] font-bold text-blue-700 dark:text-blue-400 uppercase mt-1 tracking-wider">Updated</p>
              </div>
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-2xl border border-orange-200 dark:border-orange-900/50">
                <p className="text-2xl font-black text-orange-700 dark:text-orange-400">{summary.totalSkipped}</p>
                <p className="text-[10px] font-bold text-orange-700 dark:text-orange-400 uppercase mt-1 tracking-wider">Skipped</p>
              </div>
              <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-2xl border border-purple-200 dark:border-purple-900/50">
                <p className="text-2xl font-black text-purple-700 dark:text-purple-400">{summary.historyId.substring(0,6)}</p>
                <p className="text-[10px] font-bold text-purple-700 dark:text-purple-400 uppercase mt-1 tracking-wider">Batch ID</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 max-w-md mx-auto">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 text-left uppercase tracking-wider mb-1">Downloads</h3>
              
              <button onClick={() => downloadReport('combined', 'Credentials.json')} className="w-full py-3 px-4 bg-[#0A2A5E] text-white rounded-xl font-bold hover:bg-[#071D43] transition-colors flex items-center justify-between shadow-sm shadow-blue-900/20">
                <span className="flex items-center gap-2"><Download size={18} /> Combined Credentials (.xlsx)</span>
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => downloadReport('usernames', 'Usernames.json')} className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                  <Download size={16} /> Usernames
                </button>
                <button onClick={() => downloadReport('passwords', 'Passwords.json')} className="w-full py-3 px-4 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-xl font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2">
                  <Download size={16} /> Passwords
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button onClick={() => downloadReport('vcf', 'Contacts.vcf')} className="w-full py-3 px-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-900/50 rounded-xl font-bold hover:bg-green-100 dark:hover:bg-green-900/40 transition-colors flex items-center justify-center gap-1 text-[11px]">
                  <Download size={14} /> VCF
                </button>
                <button onClick={() => downloadReport('csv', 'Report.csv')} className="w-full py-3 px-2 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors flex items-center justify-center gap-1 text-[11px]">
                  <Download size={14} /> CSV
                </button>
                <button onClick={() => downloadReport('combined', 'Report.json')} className="w-full py-3 px-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-900/50 rounded-xl font-bold hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors flex items-center justify-center gap-1 text-[11px]">
                  <Download size={14} /> JSON
                </button>
              </div>

              <button onClick={() => downloadReport('errors', 'Errors.json')} className="w-full py-3 px-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 rounded-xl font-bold hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2 mt-2">
                <AlertTriangle size={16} /> Download Error Report
              </button>

              <button onClick={resetImport} className="w-full py-3 text-gray-500 font-bold hover:text-gray-900 dark:hover:text-white transition-colors mt-4">
                Import Another File
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      <ImportOptionsModal 
        isOpen={showOptionsModal} 
        onClose={() => setShowOptionsModal(false)}
        onConfirm={executeImport}
        isImporting={isImporting}
        stats={stats}
        selectedCount={selectedRowIds.size}
      />
      
      <ImportOverrideModal
        isOpen={!!overrideModalRow}
        onClose={() => setOverrideModalRow(null)}
        onConfirm={handleRowOverrideConfirm}
        row={overrideModalRow}
      />

      <ImportProgressModal
        isOpen={showProgressModal}
        previewId={previewId}
        onComplete={handleProgressComplete}
        onError={handleProgressError}
      />
    </div>
  );
};

export default AdminImport;
