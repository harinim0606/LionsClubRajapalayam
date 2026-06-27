import React from 'react';
import { Users, Heart } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const ProfileFamily = ({ member }) => {
  if (!member.spouseName && !member.weddingDate) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center space-y-3 h-full min-h-[200px]">
        <Users size={32} className="text-gray-300" />
        <div>
          <h3 className="text-sm font-semibold text-gray-600">No Family Information</h3>
          <p className="text-xs text-gray-400">Family details are not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-full">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Users size={20} className="text-blue-600" />
        Family Information
      </h2>
      
      <div className="space-y-4">
        {member.spouseName && (
          <div className="p-4 bg-pink-50 rounded-xl border border-pink-100 flex items-center gap-4">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm text-pink-500">
              <Heart size={20} />
            </div>
            <div>
              <p className="text-xs font-semibold text-pink-600 uppercase tracking-wider">Spouse Name</p>
              <p className="text-base font-bold text-gray-900">{member.spouseName}</p>
            </div>
          </div>
        )}

        {member.weddingDate && (
          <div className="pt-2">
            <p className="text-xs font-medium text-gray-500">Wedding Anniversary</p>
            <p className="text-sm font-semibold text-gray-900">{formatDate(member.weddingDate)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileFamily;