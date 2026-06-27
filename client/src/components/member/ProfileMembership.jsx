import React from 'react';
import { Award, Shield, Target, Calendar } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const ProfileMembership = ({ member }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Shield size={20} className="text-blue-600" />
        Lions Membership
      </h2>
      
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-blue-600">
            <Target size={24} />
          </div>
          <div>
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-wider">Membership Type</p>
            <p className="text-base font-bold text-gray-900">{member.membershipType || 'Regular Member'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Date Joined</p>
            <p className="text-sm font-semibold text-gray-900">
              {member.joiningYear ? `Year ${member.joiningYear}` : 'Not available'}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-500">Current Designation</p>
            <p className="text-sm font-semibold text-gray-900">{member.clubPosition || 'Member'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileMembership;