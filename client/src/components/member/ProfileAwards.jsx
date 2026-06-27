import React from 'react';
import { Award } from 'lucide-react';

const ProfileAwards = ({ member }) => {
  // Placeholder logic based on data. The actual Member schema in this project
  // doesn't have an explicit array for awards yet, but it may have MJF status, etc.
  
  // For the sake of the requirement "Display badges/cards for MJF, PMJF",
  // we check membershipType or designation, or display a placeholder if none.
  
  const awards = [];
  if (member.membershipType && (member.membershipType.includes('MJF') || member.membershipType.includes('PMJF'))) {
    awards.push(member.membershipType);
  }

  if (awards.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[200px]">
        <Award size={32} className="text-gray-300" />
        <div>
          <h3 className="text-sm font-semibold text-gray-600">No Awards Listed</h3>
          <p className="text-xs text-gray-400">This member has no recorded awards yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Award size={20} className="text-amber-500" />
        Awards & Recognition
      </h2>
      
      <div className="space-y-3">
        {awards.map((award, idx) => (
          <div key={idx} className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-100">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center flex-shrink-0">
              <Award size={16} />
            </div>
            <p className="text-sm font-bold text-amber-900">{award}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileAwards;