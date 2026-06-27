import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { motion } from "framer-motion";
import { UserPlus, RefreshCw, Download, ChevronLeft, ChevronRight } from "lucide-react";
import api from "../../api/axios";
import toast from "react-hot-toast";

import MembersTable from "../../components/admin/MembersTable";
import BulkActionToolbar from "../../components/admin/BulkActionToolbar";
import MemberFilters from "../../components/admin/MemberFilters";

// Lazy load heavy modal components
const MemberFormModal = lazy(() => import("../../components/admin/MemberFormModal"));
const MemberViewDrawer = lazy(() => import("../../components/admin/MemberViewDrawer"));
const DeleteConfirmModal = lazy(() => import("../../components/admin/DeleteConfirmModal"));
const BulkDeleteConfirmModal = lazy(() => import("../../components/admin/BulkDeleteConfirmModal"));

const AdminMembers = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalMembers: 0 });
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", bloodGroup: "", clubPosition: "" });
  
  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSelectingAll, setIsSelectingAll] = useState(false);

  const fetchMembers = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page,
        limit: pagination.limit,
        ...(search && { search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.bloodGroup && { bloodGroup: filters.bloodGroup }),
        ...(filters.clubPosition && { clubPosition: filters.clubPosition }),
      });

      const res = await api.get(`/admin/members?${params}`);
      if (res.data.success) {
        setMembers(res.data.data.members);
        setPagination({
          page: res.data.data.pagination.currentPage,
          limit: res.data.data.pagination.limit,
          totalPages: res.data.data.pagination.totalPages,
          totalMembers: res.data.data.pagination.totalMembers,
        });
      }
    } catch (error) {
      toast.error("Failed to fetch members");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMembers(1);
    }, 500); // debounce search
    return () => clearTimeout(timer);
  }, [search, filters]);

  const handleRefresh = useCallback(() => {
    fetchMembers(1);
  }, [pagination.limit, search, filters]);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setFilters({ status: "", bloodGroup: "", clubPosition: "" });
    // fetchMembers will be called via useEffect due to dependencies changing
  }, []);

  const handleDeleteConfirm = async () => {
    if (!selectedMember) return;
    setIsDeleting(true);
    try {
      await api.delete(`/admin/members/${selectedMember._id}`);
      toast.success("Member deleted successfully");
      setIsDeleteOpen(false);
      fetchMembers(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete member");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      fetchMembers(newPage);
    }
  }, [pagination.totalPages]);

  const handleEdit = useCallback((m) => {
    setSelectedMember(m);
    setIsFormOpen(true);
  }, []);

  const handleView = useCallback((m) => {
    setSelectedMember(m);
    setIsViewOpen(true);
  }, []);

  const handleDelete = useCallback((m) => {
    setSelectedMember(m);
    setIsDeleteOpen(true);
  }, []);

  // ── Bulk Selection Handlers ───────────────────────────────────────────────
  const handleSelectOne = useCallback((id, isSelected) => {
    setSelectedIds(prev => isSelected ? [...prev, id] : prev.filter(item => item !== id));
  }, []);

  const handleSelectAll = useCallback((isSelected, idsArray) => {
    if (isSelected) {
      setSelectedIds(prev => {
        const set = new Set([...prev, ...idsArray]);
        return Array.from(set);
      });
    } else {
      setSelectedIds(prev => prev.filter(id => !idsArray.includes(id)));
    }
  }, []);

  const handleClearSelection = useCallback(() => setSelectedIds([]), []);

  const handleSelectAllMatching = useCallback(async () => {
    setIsSelectingAll(true);
    try {
      const params = new URLSearchParams({
        ...(search && { search }),
        ...(filters.status && { status: filters.status }),
        ...(filters.bloodGroup && { bloodGroup: filters.bloodGroup }),
        ...(filters.clubPosition && { clubPosition: filters.clubPosition }),
      });
      const res = await api.get(`/admin/members/ids?${params}`);
      if (res.data.success) {
        setSelectedIds(res.data.data);
      }
    } catch (error) {
      toast.error("Failed to select all members");
    } finally {
      setIsSelectingAll(false);
    }
  }, [search, filters]);

  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    try {
      const res = await api.delete(`/admin/members/bulk-delete`, {
        data: { ids: selectedIds }
      });
      toast.success(res.data.message || "Members deleted successfully");
      setSelectedIds([]);
      setIsBulkDeleteOpen(false);
      fetchMembers(1); // Return to page 1 to be safe
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete members");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleBulkExport = async () => {
    try {
      const toastId = toast.loading("Generating Excel...");
      const res = await api.post(`/admin/members/export-selected`, 
        { ids: selectedIds },
        { responseType: "blob" } // Very important for downloading files via Axios
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'SelectedMembers.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Export successful!", { id: toastId });
    } catch (error) {
      toast.error("Failed to export members");
    }
  };

  return (
    <div className="space-y-6 pb-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 font-heading">Member Management</h1>
          <p className="text-sm text-gray-500 font-medium mt-1">
            Total {pagination.totalMembers} members registered
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors border border-gray-200"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <a
            href="/api/admin/export"
            download
            className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-xl text-sm font-semibold transition-colors"
          >
            <Download size={16} /> Export
          </a>
          <button
            onClick={() => { setSelectedMember(null); setIsFormOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2A5E] text-white rounded-xl font-bold hover:bg-[#071D43] transition-colors shadow-sm shadow-blue-900/20"
          >
            <UserPlus size={18} /> Add Member
          </button>
        </div>
      </div>

      {/* Toolbar Layering */}
      {selectedIds.length > 0 ? (
        <BulkActionToolbar
          selectedCount={selectedIds.length}
          totalMatching={pagination.totalMembers}
          visibleCount={members.filter(m => selectedIds.includes(m._id)).length}
          onClear={handleClearSelection}
          onDelete={() => setIsBulkDeleteOpen(true)}
          onExport={handleBulkExport}
          onSelectAllMatching={handleSelectAllMatching}
          isSelectingAll={isSelectingAll}
        />
      ) : (
        <MemberFilters 
          search={search}
          onSearchChange={setSearch}
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Table */}
      <MembersTable
        members={members}
        loading={loading}
        onEdit={handleEdit}
        onView={handleView}
        onDelete={handleDelete}
        selectedIds={selectedIds}
        onSelectAll={handleSelectAll}
        onSelectOne={handleSelectOne}
      />

      {/* Pagination */}
      {!loading && members.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white px-6 py-4 rounded-2xl border border-gray-100 shadow-sm">
          <p className="text-sm text-gray-500 font-medium">
            Showing <span className="font-bold text-gray-900">{(pagination.page - 1) * pagination.limit + 1}</span> to <span className="font-bold text-gray-900">{Math.min(pagination.page * pagination.limit, pagination.totalMembers)}</span> of <span className="font-bold text-gray-900">{pagination.totalMembers}</span> members
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-bold text-gray-900 px-2">
              Page {pagination.page} of {pagination.totalPages || 1}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0}
              className="w-9 h-9 flex items-center justify-center rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      <Suspense fallback={null}>
        <MemberFormModal
          isOpen={isFormOpen}
          onClose={() => { setIsFormOpen(false); setSelectedMember(null); }}
          member={selectedMember}
          onSuccess={() => fetchMembers(pagination.page)}
        />

        <MemberViewDrawer
          isOpen={isViewOpen}
          onClose={() => { setIsViewOpen(false); setSelectedMember(null); }}
          member={selectedMember}
        />

        <DeleteConfirmModal
          isOpen={isDeleteOpen}
          onClose={() => { !isDeleting && setIsDeleteOpen(false); }}
          onConfirm={handleDeleteConfirm}
          member={selectedMember}
          isDeleting={isDeleting}
        />

        <BulkDeleteConfirmModal
          isOpen={isBulkDeleteOpen}
          onClose={() => { !isBulkDeleting && setIsBulkDeleteOpen(false); }}
          onConfirm={handleBulkDeleteConfirm}
          count={selectedIds.length}
          isDeleting={isBulkDeleting}
        />
      </Suspense>
    </div>
  );
};

export default AdminMembers;
