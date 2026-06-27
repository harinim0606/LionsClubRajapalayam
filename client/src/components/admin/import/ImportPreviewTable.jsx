import React, { useState } from 'react';
import { Edit2, CheckCircle2, AlertTriangle, XCircle, Unlock, Copy, Save, X, RotateCcw } from 'lucide-react';

const Badge = ({ status }) => {
  switch (status) {
    case 'valid': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800"><CheckCircle2 size={10} /> VALID</span>;
    case 'invalid': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800"><XCircle size={10} /> INVALID</span>;
    case 'warning': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800"><AlertTriangle size={10} /> WARNING</span>;
    case 'duplicate_excel': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200 dark:border-orange-800"><Copy size={10} /> DUP (EXCEL)</span>;
    case 'duplicate_db': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800"><Copy size={10} /> DUP (DB)</span>;
    case 'overridden': return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800"><Unlock size={10} /> OVERRIDDEN</span>;
    default: return null;
  }
};

const EditableCell = ({ value, isEditing, onChange, type = "text", placeholder }) => {
  if (!isEditing) return <span className="truncate block">{value || '-'}</span>;
  return (
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-blue-300 dark:border-blue-700 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-900 dark:text-white"
    />
  );
};

const ImportPreviewTable = ({ 
  data, 
  isLoading,
  selectedRowIds, 
  onToggleRow, 
  onToggleAllPage,
  onRowEdit,
  onRowOverride,
  onRowDelete,
  onRowCompare,
  page,
  totalPages,
  setPage
}) => {
  const [editingRow, setEditingRow] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [expandedRow, setExpandedRow] = useState(null);

  const startEdit = (row) => {
    setEditingRow(row.rowNum);
    setEditForm({ ...row }); // Start with all row fields
  };

  const saveEdit = (rowNum) => {
    onRowEdit(rowNum, editForm);
    setEditingRow(null);
    setExpandedRow(null);
  };

  const cancelEdit = () => {
    setEditingRow(null);
    setExpandedRow(null);
    setEditForm({});
  };

  const toggleExpand = (rowNum) => {
    if (expandedRow === rowNum) {
      setExpandedRow(null);
    } else {
      setExpandedRow(rowNum);
    }
  };

  // Determine if all valid rows on current page are selected
  const validPageRows = data.filter(r => ['valid', 'warning', 'overridden'].includes(r.status));
  const isAllPageSelected = validPageRows.length > 0 && validPageRows.every(r => selectedRowIds.has(r.id));

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex flex-col relative h-[600px]">
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm z-30 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#0A2A5E] dark:border-blue-400 border-t-transparent" />
        </div>
      )}

      <div className="flex-1 overflow-auto relative">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-[11px] uppercase tracking-wider sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="p-3 pl-4 w-12">
                <input 
                  type="checkbox"
                  checked={isAllPageSelected}
                  onChange={(e) => onToggleAllPage(data, e.target.checked)}
                  disabled={validPageRows.length === 0}
                  className="w-4 h-4 rounded border-gray-300 text-[#0A2A5E] focus:ring-[#0A2A5E]"
                />
              </th>
              <th className="p-3 w-16 text-center">Row</th>
              <th className="p-3 w-32">Status</th>
              <th className="p-3 w-32">Member No</th>
              <th className="p-3 w-48">Name</th>
              <th className="p-3 w-32">Mobile</th>
              <th className="p-3 w-48">Email</th>
              <th className="p-3">Issues</th>
              <th className="p-3 w-28 text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {data.length === 0 && !isLoading ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                  No records found.
                </td>
              </tr>
            ) : (
              data.map((row) => {
                const isEditing = editingRow === row.rowNum;
                const canSelect = ['valid', 'warning', 'overridden'].includes(row.status);
                
                let rowBg = '';
                if (row.status === 'invalid') rowBg = 'bg-red-50/30 dark:bg-red-900/10';
                else if (row.status === 'duplicate_excel' || row.status === 'duplicate_db') rowBg = 'bg-orange-50/30 dark:bg-orange-900/10';
                else if (row.status === 'overridden') rowBg = 'bg-blue-50/30 dark:bg-blue-900/10';
                if (isEditing) rowBg = 'bg-blue-50 dark:bg-blue-900/20';

                return (
                  <React.Fragment key={row.id}>
                    <tr className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${rowBg}`}>
                    <td className="p-3 pl-4">
                      <input 
                        type="checkbox"
                        checked={selectedRowIds.has(row.id)}
                        onChange={() => onToggleRow(row.id)}
                        disabled={!canSelect}
                        className="w-4 h-4 rounded border-gray-300 text-[#0A2A5E] focus:ring-[#0A2A5E] disabled:opacity-30"
                      />
                    </td>
                    <td className="p-3 text-xs font-bold text-gray-400 dark:text-gray-500 text-center">#{row.rowNum}</td>
                    <td className="p-3"><Badge status={row.status} /></td>
                    
                    <td className="p-3 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <EditableCell 
                        isEditing={isEditing} 
                        value={isEditing ? editForm.memberNumber : row.memberNumber}
                        onChange={v => setEditForm({...editForm, memberNumber: v})}
                        placeholder="LC001"
                      />
                    </td>
                    <td className="p-3 text-sm font-bold text-gray-900 dark:text-white">
                      <EditableCell 
                        isEditing={isEditing} 
                        value={isEditing ? editForm.name : row.name}
                        onChange={v => setEditForm({...editForm, name: v})}
                        placeholder="Full Name"
                      />
                    </td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                      <EditableCell 
                        isEditing={isEditing} 
                        value={isEditing ? editForm.mobile : row.mobile}
                        onChange={v => setEditForm({...editForm, mobile: v})}
                        placeholder="9876543210"
                      />
                    </td>
                    <td className="p-3 text-sm text-gray-600 dark:text-gray-300">
                      <EditableCell 
                        isEditing={isEditing} 
                        value={isEditing ? editForm.email : row.email}
                        onChange={v => setEditForm({...editForm, email: v})}
                        type="email"
                        placeholder="email@example.com"
                      />
                    </td>
                    <td className="p-3">
                      {row.errors?.length > 0 && (
                        <ul className="list-none space-y-1">
                          {row.errors.map((e, i) => <li key={i} className="text-[11px] font-medium text-red-600 dark:text-red-400 leading-tight">• {e}</li>)}
                        </ul>
                      )}
                      {row.warnings?.length > 0 && (
                        <ul className="list-none space-y-1 mt-1">
                          {row.warnings.map((w, i) => <li key={i} className="text-[11px] font-medium text-yellow-600 dark:text-yellow-400 leading-tight">• {w}</li>)}
                        </ul>
                      )}
                      {(!row.errors?.length && !row.warnings?.length) && <span className="text-gray-400 text-xs">-</span>}
                    </td>
                    
                    {/* Actions */}
                    <td className="p-3 pr-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => saveEdit(row.rowNum)} className="p-1.5 text-green-600 hover:bg-green-100 rounded-lg transition" title="Save">
                            <Save size={16} />
                          </button>
                          <button onClick={cancelEdit} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition" title="Cancel">
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center justify-end gap-1">
                            <button onClick={() => { startEdit(row); setExpandedRow(row.rowNum); }} className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition" title="Full Edit">
                              <Edit2 size={16} />
                            </button>
                            {!['valid', 'overridden'].includes(row.status) && (
                              <button onClick={() => onRowOverride(row.rowNum)} className="p-1.5 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded-lg transition" title="Override Validation">
                                <Unlock size={16} />
                              </button>
                            )}
                          </div>
                          {row.status === 'duplicate_excel' && (
                            <button onClick={() => onRowDelete(row.rowNum)} className="text-[10px] text-red-600 dark:text-red-400 hover:underline">
                              Delete Duplicate
                            </button>
                          )}
                          {row.status === 'duplicate_db' && (
                            <button onClick={() => onRowCompare(row.rowNum)} className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline">
                              Compare DB
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded Full Edit Row */}
                  {expandedRow === row.rowNum && isEditing && (
                    <tr className="bg-blue-50/50 dark:bg-blue-900/10 border-b border-blue-100 dark:border-blue-800">
                      <td colSpan="9" className="p-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {[
                            { label: "First Name", field: "firstName" },
                            { label: "Last Name", field: "lastName" },
                            { label: "Alternate Mobile", field: "alternateMobile" },
                            { label: "WhatsApp Mobile", field: "whatsappMobile" },
                            { label: "Blood Group", field: "bloodGroup" },
                            { label: "Date of Birth (YYYY-MM-DD)", field: "dateOfBirth" },
                            { label: "Wedding Date (YYYY-MM-DD)", field: "weddingDate" },
                            { label: "Occupation", field: "profession" },
                            { label: "Address", field: "address" },
                            { label: "City", field: "city" },
                            { label: "Club Position", field: "clubPosition" },
                            { label: "Spouse Name", field: "spouseName" }
                          ].map(({ label, field }) => (
                            <div key={field}>
                              <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
                              <input 
                                type="text"
                                value={editForm[field] || ''}
                                onChange={(e) => setEditForm({ ...editForm, [field]: e.target.value })}
                                className="w-full px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm text-gray-900 dark:text-white"
                              />
                            </div>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-gray-50 dark:bg-gray-800 p-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
        <p className="text-xs font-bold text-gray-500 dark:text-gray-400">
          Page {page} of {totalPages || 1}
        </p>
        <div className="flex gap-1">
          <button 
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          >
            Previous
          </button>
          <button 
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportPreviewTable;
