import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { MessageCircle, Mail } from 'lucide-react';
import { useCommunication } from '../../hooks/useCommunication';

import QuickActions from '../../components/communication/QuickActions';
import MemberFilters from '../../components/admin/MemberFilters';
import MembersTable from '../../components/admin/MembersTable';
import BulkToolbar from '../../components/communication/BulkToolbar';
import BatchModal from '../../components/communication/BatchModal';
import ContactCard from '../../components/communication/ContactCard';
import ComposeMessageModal from '../../components/communication/ComposeMessageModal';
import { BirthdayEmptyState, AnniversaryEmptyState } from '../../components/communication/EmptyStates';
import toast from 'react-hot-toast';

const CommunicationDashboard = () => {
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'birthdays' | 'anniversaries'
  
  // Data State
  const [birthdays, setBirthdays] = useState({ today: [], thisWeek: [], thisMonth: [], upcoming30Days: [] });
  const [anniversaries, setAnniversaries] = useState({ today: [], thisWeek: [], thisMonth: [], upcoming30Days: [] });
  
  // Table State
  const [members, setMembers] = useState([]);
  const [totalMembers, setTotalMembers] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters & Search
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState('');
  
  // Selection
  const [selectedIds, setSelectedIds] = useState([]);
  const [allMatchingSelected, setAllMatchingSelected] = useState(false);
  const [isSelectingAll, setIsSelectingAll] = useState(false);

  // Modals
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeType, setComposeType] = useState('whatsapp'); // 'whatsapp' | 'email'
  const [composeTarget, setComposeTarget] = useState([]); // members to send to

  // Hooks
  const comm = useCommunication();
  
  // Derived Selection State — selectedMembers tracks all selected across pages
  const [selectedMembersMap, setSelectedMembersMap] = useState({});

  // Keep map in sync whenever members load
  useEffect(() => {
    if (members.length > 0) {
      setSelectedMembersMap(prev => {
        const updated = { ...prev };
        members.forEach(m => { updated[m._id] = m; });
        return updated;
      });
    }
  }, [members]);

  const selectedMembers = useMemo(() => {
    return selectedIds.map(id => selectedMembersMap[id]).filter(Boolean);
  }, [selectedIds, selectedMembersMap]);

  // Initial Load
  useEffect(() => {
    fetchBirthdays();
    fetchAnniversaries();
  }, []);

  // Fetch Directory
  useEffect(() => {
    if (activeTab === 'directory') {
      fetchMembers();
    }
  }, [page, filters, search, activeTab]);

  const fetchBirthdays = async () => {
    try {
      const res = await api.get('/communication/birthdays');
      if (res.data.success) setBirthdays(res.data.data);
    } catch (e) { console.error('Failed to load birthdays', e); }
  };

  const fetchAnniversaries = async () => {
    try {
      const res = await api.get('/communication/anniversaries');
      if (res.data.success) setAnniversaries(res.data.data);
    } catch (e) { console.error('Failed to load anniversaries', e); }
  };

  const fetchMembers = async () => {
    setIsLoading(true);
    try {
      const res = await api.post('/communication/members', {
        page,
        limit: 10,
        search,
        filters,
      });
      if (res.data.success) {
        setMembers(res.data.data.members);
        setTotalMembers(res.data.data.total);
        setTotalPages(res.data.data.totalPages);
      }
    } catch (e) {
      console.error('Failed to fetch members', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (id) => {
    setAllMatchingSelected(false);
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleSelectAll = (checked) => {
    setAllMatchingSelected(false);
    if (checked) {
      const newIds = members.map(m => m._id);
      setSelectedIds(Array.from(new Set([...selectedIds, ...newIds])));
    } else {
      const currentIds = members.map(m => m._id);
      setSelectedIds(selectedIds.filter(id => !currentIds.includes(id)));
    }
  };

  const handleSelectAllMatching = async () => {
    setIsSelectingAll(true);
    try {
      const res = await api.post('/communication/members', {
        page: 1,
        limit: 99999,
        search,
        filters,
      });
      if (res.data.success) {
        const allIds = res.data.data.members.map(m => m._id);
        setSelectedIds(allIds);
        setAllMatchingSelected(true);
      }
    } catch (e) {
      toast.error('Failed to select all matching members');
    } finally {
      setIsSelectingAll(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
    setAllMatchingSelected(false);
  };

  const handleOpenCompose = (type, targetMembers) => {
    setComposeType(type);
    setComposeTarget(targetMembers);
    setComposeOpen(true);
  };

  const handleSendMessage = ({ subject, message }) => {
    if (composeType === 'whatsapp') {
      comm.prepareBulkWhatsApp(composeTarget, message);
    } else {
      comm.prepareBulkEmail(composeTarget, subject, message);
    }
  };

  const handleExport = async (format, customIds = null) => {
    try {
      toast.loading('Preparing export...', { id: 'export' });
      const idsToExport = customIds || (selectedIds.length > 0 ? selectedIds : []);
      const payload = {
        format,
        filters,
        search,
        selectedIds: idsToExport
      };
      const res = await api.post('/communication/export-contacts', payload, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Contacts_Export_${new Date().toISOString().split('T')[0]}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      toast.success('Export downloaded successfully!', { id: 'export' });
    } catch (error) {
      console.error(error);
      toast.error('Export failed.', { id: 'export' });
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Quick Actions */}
      <QuickActions onNavigate={setActiveTab} />

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-800">
        {[
          { id: 'directory', label: 'Member Directory' },
          { id: 'birthdays', label: `Birthdays` },
          { id: 'anniversaries', label: `Anniversaries` }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { setActiveTab(tab.id); setPage(1); }}
            className={`px-6 py-3 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.id ? 'border-[#0A2A5E] dark:border-[#F4B400] text-[#0A2A5E] dark:text-[#F4B400]' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <MemberFilters 
              filters={filters} 
              onFiltersChange={(f) => { setFilters(f); setPage(1); }} 
              search={search}
              onSearchChange={(s) => { setSearch(s); setPage(1); }}
              onClearFilters={() => { setFilters({}); setSearch(''); setPage(1); }}
            />
            
            <MembersTable 
              members={members}
              loading={isLoading}
              selectedIds={selectedIds}
              onSelectOne={handleToggleSelect}
              onSelectAll={handleSelectAll}
              customActions={(member) => (
                <div className="flex justify-center gap-2">
                  <button
                    onClick={() => handleOpenCompose('whatsapp', [member])}
                    className="p-2 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/40 transition"
                    title="WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </button>
                  <button
                    onClick={() => handleOpenCompose('email', [member])}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                    title="Email"
                  >
                    <Mail size={16} />
                  </button>
                </div>
              )}
            />

            {/* Select All Matching Banner */}
            {selectedIds.length > 0 && selectedIds.length < totalMembers && !allMatchingSelected && (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-xl text-sm">
                <span className="text-blue-800 dark:text-blue-300 font-medium">
                  {selectedIds.length} members selected.
                </span>
                <button
                  onClick={handleSelectAllMatching}
                  disabled={isSelectingAll}
                  className="text-blue-700 dark:text-blue-400 font-bold hover:underline disabled:opacity-50"
                >
                  {isSelectingAll ? 'Selecting...' : `Select all ${totalMembers} matching members`}
                </button>
              </div>
            )}
            {allMatchingSelected && (
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl text-sm">
                <span className="text-green-800 dark:text-green-300 font-bold">
                  All {selectedIds.length} matching members are selected.
                </span>
                <button onClick={handleClearSelection} className="text-green-700 dark:text-green-400 font-bold hover:underline">
                  Clear selection
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'birthdays' && (
          <div className="space-y-12">
            {[
              { title: "Today's Birthdays", data: birthdays.today },
              { title: "This Week", data: birthdays.thisWeek },
              { title: "This Month", data: birthdays.thisMonth },
              { title: "Upcoming (30 Days)", data: birthdays.upcoming30Days }
            ].map((section, idx) => (
              <div key={idx}>
                {section.data.length > 0 ? (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{section.title} ({section.data.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleOpenCompose('whatsapp', section.data)} className="px-3 py-1.5 bg-green-600 text-white font-bold rounded-lg text-xs hover:bg-green-700 transition">Send WA</button>
                        <button onClick={() => handleOpenCompose('email', section.data)} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition">Send Email</button>
                        <button onClick={() => comm.copyToClipboard(comm.getCopyText(section.data, 'mobile', 'newline'), 'Phones copied')} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition">Copy Phones</button>
                        <button onClick={() => comm.copyToClipboard(comm.getCopyText(section.data, 'email', 'newline'), 'Emails copied')} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition">Copy Emails</button>
                        <button onClick={() => handleExport('xlsx', section.data.map(b => b._id))} className="px-3 py-1.5 bg-gray-800 text-white font-bold rounded-lg text-xs hover:bg-gray-700 transition">Export</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.data.map(m => <ContactCard key={m._id} member={m} type="birthday" onOpenCompose={handleOpenCompose} />)}
                    </div>
                  </div>
                ) : (
                  idx === 0 && <BirthdayEmptyState />
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'anniversaries' && (
          <div className="space-y-12">
            {[
              { title: "Today's Anniversaries", data: anniversaries.today },
              { title: "This Week", data: anniversaries.thisWeek },
              { title: "This Month", data: anniversaries.thisMonth },
              { title: "Upcoming (30 Days)", data: anniversaries.upcoming30Days }
            ].map((section, idx) => (
              <div key={idx}>
                {section.data.length > 0 ? (
                  <div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{section.title} ({section.data.length})</h3>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={() => handleOpenCompose('whatsapp', section.data)} className="px-3 py-1.5 bg-green-600 text-white font-bold rounded-lg text-xs hover:bg-green-700 transition">Send WA</button>
                        <button onClick={() => handleOpenCompose('email', section.data)} className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition">Send Email</button>
                        <button onClick={() => comm.copyToClipboard(comm.getCopyText(section.data, 'mobile', 'newline'), 'Phones copied')} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition">Copy Phones</button>
                        <button onClick={() => comm.copyToClipboard(comm.getCopyText(section.data, 'email', 'newline'), 'Emails copied')} className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-bold rounded-lg text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition">Copy Emails</button>
                        <button onClick={() => handleExport('xlsx', section.data.map(a => a._id))} className="px-3 py-1.5 bg-gray-800 text-white font-bold rounded-lg text-xs hover:bg-gray-700 transition">Export</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {section.data.map(m => <ContactCard key={m._id} member={m} type="anniversary" onOpenCompose={handleOpenCompose} />)}
                    </div>
                  </div>
                ) : (
                  idx === 0 && <AnniversaryEmptyState />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Toolbar & Modals */}
      <BulkToolbar 
        selectedCount={selectedIds.length}
        members={selectedMembers}
        onClear={handleClearSelection}
        onBulkWhatsApp={() => handleOpenCompose('whatsapp', selectedMembers)}
        onBulkEmail={() => handleOpenCompose('email', selectedMembers)}
        onExport={(format) => handleExport(format, null)}
      />

      <ComposeMessageModal 
        isOpen={composeOpen}
        onClose={() => setComposeOpen(false)}
        onSend={handleSendMessage}
        type={composeType}
        targetMembers={composeTarget}
      />

      <BatchModal 
        isOpen={comm.isBatching}
        onClose={() => comm.setIsBatching(false)}
        batches={comm.batches}
        type={comm.batchType}
      />
    </div>
  );
};

export default CommunicationDashboard;
