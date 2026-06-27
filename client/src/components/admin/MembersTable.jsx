import React, { useRef, useEffect } from "react";
import { Eye, Edit2, Trash2 } from "lucide-react";
import { getInitials } from "../../utils/helpers";
import DashboardEmptyState from "../dashboard/DashboardEmptyState";

// ── Custom Checkbox Component ───────────────────────────────────────────────
const Checkbox = ({ checked, indeterminate, onChange }) => {
  const checkboxRef = useRef();

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <div className="relative flex items-center justify-center">
      <input
        type="checkbox"
        ref={checkboxRef}
        checked={checked}
        onChange={onChange}
        className="w-4 h-4 text-[#0A2A5E] bg-white border-gray-300 rounded cursor-pointer focus:ring-[#0A2A5E]/20 transition-all"
      />
    </div>
  );
};

const MembersTable = ({ members, loading, onEdit, onView, onDelete, selectedIds = [], onSelectAll, onSelectOne, customActions }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="p-4 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-100 rounded-xl shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-100 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!members || members.length === 0) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden p-8">
        <DashboardEmptyState icon="👥" message="No members found matching your search or filters." />
      </div>
    );
  }

  const allVisibleIds = members?.map(m => m._id) || [];
  const visibleSelected = allVisibleIds.filter(id => selectedIds.includes(id));
  const isAllVisibleSelected = visibleSelected.length === allVisibleIds.length && allVisibleIds.length > 0;
  const isSomeVisibleSelected = visibleSelected.length > 0 && !isAllVisibleSelected;

  const handleHeaderCheckboxChange = () => {
    if (isAllVisibleSelected) {
      // Unselect all currently visible
      onSelectAll(false, allVisibleIds);
    } else {
      // Select all currently visible
      onSelectAll(true, allVisibleIds);
    }
  };

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 dark:bg-gray-850/50 border-b border-gray-100 dark:border-gray-800">
              <th className="px-6 py-4 w-12 text-center">
                <Checkbox
                  checked={isAllVisibleSelected}
                  indeterminate={isSomeVisibleSelected}
                  onChange={handleHeaderCheckboxChange}
                />
              </th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Club Position</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {members.map((member) => {
              const isSelected = selectedIds.includes(member._id);
              
              return (
              <tr 
                key={member._id} 
                className={`hover:bg-gray-50/80 dark:hover:bg-gray-800/80 transition-colors group relative ${
                  isSelected ? "bg-[#0A2A5E]/[0.02] dark:bg-[#F4B400]/[0.02]" : ""
                }`}
              >
                {/* Selection Highlight Border */}
                {isSelected && (
                  <td className="absolute left-0 top-0 bottom-0 w-1 bg-[#0A2A5E] rounded-r-full" />
                )}

                {/* Checkbox */}
                <td className="px-6 py-4 text-center">
                  <Checkbox
                    checked={isSelected}
                    onChange={(e) => onSelectOne(member._id, e.target.checked)}
                  />
                </td>
                
                {/* Member Info */}
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {member.avatar ? (
                      <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-xl object-cover border border-gray-200 dark:border-gray-700" />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0A2A5E] to-[#1a4080] dark:from-[#F4B400] dark:to-[#D69E00] flex items-center justify-center text-white dark:text-black text-xs font-bold shadow-sm">
                        {getInitials(member.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-[#0A2A5E] dark:group-hover:text-[#F4B400] transition-colors">{member.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">#{member.memberNumber}</p>
                    </div>
                  </div>
                </td>

                {/* Contact */}
                <td className="px-6 py-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{member.mobile}</p>
                  {member.email && <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]">{member.email}</p>}
                </td>

                {/* Position */}
                <td className="px-6 py-4">
                  {member.clubPosition ? (
                    <div>
                      <span className="inline-block text-xs font-semibold text-[#0A2A5E] bg-[#0A2A5E]/8 dark:text-[#F4B400] dark:bg-[#F4B400]/10 px-2 py-0.5 rounded-full">
                        {member.clubPosition}
                      </span>
                      {member.joiningYear && <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 uppercase font-bold tracking-wider">Joined {member.joiningYear}</p>}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>

                {/* Status */}
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                    member.status === 'active' 
                      ? 'bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-900/30' 
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${member.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} />
                    {member.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {customActions ? (
                      customActions(member)
                    ) : (
                      <>
                        {onView && (
                          <button
                            onClick={() => onView(member)}
                            title="View Member"
                            aria-label={`View ${member.name}`}
                            className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            onClick={() => onEdit(member)}
                            title="Edit Member"
                            aria-label={`Edit ${member.name}`}
                            className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(member)}
                            title="Delete Member"
                            aria-label={`Delete ${member.name}`}
                            className="w-8 h-8 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </td>
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(MembersTable);
