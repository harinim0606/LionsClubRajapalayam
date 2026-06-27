import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, X, SlidersHorizontal, Users, 
  HelpCircle, AlertCircle, ChevronLeft, ChevronRight 
} from "lucide-react";
import api from "../../api/axios";

// Import custom directory elements
import MemberCard from "../../components/member/MemberCard";
import MemberFilters from "../../components/member/MemberFilters";
import MemberProfileDrawer from "../../components/member/MemberProfileDrawer";
import MemberDirectorySkeleton from "../../components/member/MemberDirectorySkeleton";

const MemberDirectory = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // 1. Sync React state with URL parameters
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "active";
  const designation = searchParams.get("designation") || "";
  const bloodGroup = searchParams.get("bloodGroup") || "";
  const gender = searchParams.get("gender") || "";
  const sortBy = searchParams.get("sortBy") || "name";
  const sortOrder = searchParams.get("sortOrder") || "asc";

  const [searchInput, setSearchInput] = useState(search);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  
  // Profile Drawer State
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // API Data State
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Synchronize search input field with query parameter changes (resets, etc.)
  useEffect(() => {
    setSearchInput(search);
  }, [search]);

  // 3. Debounce search queries to avoid excessive API requests
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchInput !== search) {
        updateFilters({ search: searchInput, page: 1 });
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [searchInput]);

  // 4. Fetch list of members on filter, search, sort, or page changes
  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      setError(null);
      try {
        const queryParams = new URLSearchParams();
        queryParams.set("page", page);
        queryParams.set("limit", limit);
        if (search) queryParams.set("search", search);
        if (status) queryParams.set("status", status);
        if (designation) queryParams.set("designation", designation);
        if (bloodGroup) queryParams.set("bloodGroup", bloodGroup);
        if (gender) queryParams.set("gender", gender);
        if (sortBy) queryParams.set("sortBy", sortBy);
        if (sortOrder) queryParams.set("sortOrder", sortOrder);

        const res = await api.get(`/members?${queryParams.toString()}`);
        if (res.data.success) {
          setData(res.data.data);
        } else {
          setError(res.data.message || "Failed to fetch directory list.");
        }
      } catch (err) {
        setError(
          err.response?.data?.message || 
          "Unable to connect to the server. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [page, limit, search, status, designation, bloodGroup, gender, sortBy, sortOrder]);

  // Helper: Merges and writes updated filters into searchParams
  const updateFilters = (newFilters) => {
    const params = {};
    for (const [key, val] of searchParams.entries()) {
      params[key] = val;
    }

    Object.keys(newFilters).forEach((key) => {
      const val = newFilters[key];
      if (val === undefined || val === null || val === "") {
        delete params[key];
      } else {
        params[key] = String(val);
      }
    });

    setSearchParams(params);
  };

  const handleResetFilters = () => {
    setSearchParams({ status: "active", page: "1", limit: "20" });
    setSearchInput("");
    setIsMobileFiltersOpen(false);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= (data?.pagination?.totalPages || 1)) {
      updateFilters({ page: newPage });
    }
  };

  const handleLimitChange = (newLimit) => {
    updateFilters({ limit: newLimit, page: 1 });
  };

  // Navigate to the full Member Profile page when a card is clicked
  const handleViewProfile = (member) => {
    navigate(`/directory/${member._id}`);
  };

  // Compile active filters to display in the header
  const filtersObj = {
    status,
    designation,
    bloodGroup,
    gender,
    sortBy,
    sortOrder,
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">Member Directory</h1>
          <p className="text-sm text-gray-500 mt-1">Browse, filter, and contact Lions Club Rajapalayam members.</p>
        </div>
        
        {/* Dynamic statistics badge */}
        {!loading && !error && data && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0A2A5E]/5 border border-[#0A2A5E]/10 rounded-2xl">
            <Users size={16} className="text-[#0A2A5E]" />
            <span className="text-xs font-semibold text-gray-700">
              Total Members: <strong className="text-[#0A2A5E]">{data.pagination.totalMembers}</strong>
            </span>
          </div>
        )}
      </div>

      {/* 2. Main Content Grid */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Left Side: Filter Column (Desktop only, mobile renders via portal/drawer) */}
        <MemberFilters 
          filters={filtersObj}
          onChange={updateFilters}
          onReset={handleResetFilters}
          isMobileOpen={isMobileFiltersOpen}
          onCloseMobile={() => setIsMobileFiltersOpen(false)}
        />

        {/* Right Side: Search and Listings Container */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Search bar & Filter Trigger for Mobile */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, number, phone, or email..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2A5E] focus:border-transparent transition-all placeholder-gray-400"
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            
            {/* Mobile filter toggle */}
            <button
              onClick={() => setIsMobileFiltersOpen(true)}
              className="lg:hidden p-3 bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 rounded-2xl shadow-sm flex items-center justify-center shrink-0 cursor-pointer transition-colors"
              title="Filters"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>

          {/* Loading state rendering */}
          {loading ? (
            <MemberDirectorySkeleton />
          ) : error ? (
            // Error State
            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-2xl flex items-start gap-4 shadow-sm">
              <AlertCircle className="h-6 w-6 text-red-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-red-800 font-bold font-heading">Error Loading Members</h4>
                <p className="text-red-700 text-sm mt-1">{error}</p>
                <button
                  onClick={() => updateFilters({ page: 1 })}
                  className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors border-0 cursor-pointer"
                >
                  Retry Fetch
                </button>
              </div>
            </div>
          ) : !data || data.members.length === 0 ? (
            // Empty State
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm flex flex-col items-center justify-center max-w-lg mx-auto"
            >
              <div className="h-20 w-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                <HelpCircle size={40} className="text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 font-heading">No Members Found</h3>
              <p className="text-sm text-gray-500 mt-2 max-w-sm">
                We couldn't find any members matching your search terms or combined filters. Try modifying your criteria.
              </p>
              <button
                onClick={handleResetFilters}
                className="mt-6 px-6 py-3 bg-[#0A2A5E] hover:bg-[#071D43] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0A2A5E]/20 transition-all border-0 cursor-pointer"
              >
                Reset All Filters
              </button>
            </motion.div>
          ) : (
            // Cards Grid View
            <div className="space-y-8">
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: { opacity: 0 },
                  show: {
                    opacity: 1,
                    transition: { staggerChildren: 0.05 }
                  }
                }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {data.members.map((member) => (
                  <MemberCard
                    key={member._id}
                    member={member}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </motion.div>

              {/* 3. Pagination Footer Section */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100 bg-white p-4 rounded-2xl shadow-sm border">
                {/* Page Size Select */}
                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                  <span>Show</span>
                  <select
                    value={limit}
                    onChange={(e) => handleLimitChange(parseInt(e.target.value, 10))}
                    className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-[#0A2A5E] transition-all"
                  >
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <span>members per page</span>
                </div>

                {/* Page Navigation Controls */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handlePageChange(page - 1)}
                    disabled={page <= 1}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer shrink-0"
                    title="Previous Page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <div className="flex items-center gap-1 px-2">
                    {[...Array(data.pagination.totalPages)].map((_, i) => {
                      const pageNum = i + 1;
                      // Display a subset of numbers if there are too many pages
                      if (
                        data.pagination.totalPages > 6 &&
                        pageNum !== 1 &&
                        pageNum !== data.pagination.totalPages &&
                        Math.abs(pageNum - page) > 1
                      ) {
                        if (pageNum === 2 || pageNum === data.pagination.totalPages - 1) {
                          return <span key={pageNum} className="text-gray-400 px-1 text-xs">...</span>;
                        }
                        return null;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all border-0 cursor-pointer ${
                            pageNum === page
                              ? "bg-[#0A2A5E] text-white shadow-sm shadow-[#0A2A5E]/20"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => handlePageChange(page + 1)}
                    disabled={page >= data.pagination.totalPages}
                    className="p-2 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 disabled:hover:bg-transparent transition-colors cursor-pointer shrink-0"
                    title="Next Page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

      {/* 4. Slide-out Profile Drawer (Lazy Loaded / Portal) */}
      <MemberProfileDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        member={selectedMember}
      />
    </div>
  );
};

export default MemberDirectory;
