import React, { useState } from 'react';
import { Download, Printer, Edit2, MapPin } from 'lucide-react';
import { getInitials } from '../../utils/helpers';
import ProfilePhotoUploader from './ProfilePhotoUploader';

const ProfileHeader = ({ member, canEdit, isEditing, setIsEditing, profileId }) => {
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const currentYear = new Date().getFullYear();
  const yearsOfService = member?.joiningYear ? currentYear - member.joiningYear : null;

  // Compute status color
  const statusColor = member?.status?.toLowerCase() === 'active' 
    ? 'bg-green-100 text-green-700' 
    : 'bg-red-100 text-red-700';

  const avatarUrl = member?.avatar || null;

  return (
    <>
      <div className="bg-white dark:bg-[#1E293B] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden relative">
        {/* Cover Photo Area (Lions Club Theme) */}
        <div className="h-32 sm:h-40 bg-gradient-to-r from-[#00338D] to-[#0055D4] w-full" />
        
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6">
            {/* Avatar Profile */}
            <div className="relative group -mt-16 sm:-mt-20 z-10">
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt={member.name}
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover border-4 border-white dark:border-[#1E293B] shadow-md bg-white dark:bg-gray-850"
                />
              ) : (
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-amber-500 border-4 border-white dark:border-[#1E293B] shadow-md flex items-center justify-center text-white text-4xl sm:text-5xl font-bold">
                  {getInitials(member.name)}
                </div>
              )}
              
              {canEdit && (
                <button
                  onClick={() => setShowPhotoUpload(true)}
                  className="absolute bottom-2 right-2 bg-white dark:bg-gray-800 p-2 rounded-full shadow border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-[#F4B400] hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors z-10 cursor-pointer"
                  title="Update Photo"
                >
                  <Edit2 size={18} />
                </button>
              )}
            </div>
 
            <div className="flex-1 w-full flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
              {/* Member Core Details */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{member.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${statusColor}`}>
                    {member.status || 'Active'}
                  </span>
                </div>
                
                <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
                  {member.clubPosition || 'Member'} • {member.memberNumber}
                </p>
                
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 gap-4 pt-1">
                  {member.city && (
                    <div className="flex items-center gap-1">
                      <MapPin size={16} />
                      {member.city}
                    </div>
                  )}
                  {yearsOfService !== null && (
                    <div className="bg-amber-100 dark:bg-amber-950/40 text-amber-800 dark:text-amber-400 px-2 py-0.5 rounded text-xs font-semibold">
                      {yearsOfService} Years of Service
                    </div>
                  )}
                </div>
              </div>
 
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 w-full sm:w-auto mt-2 sm:mt-0">
                {canEdit && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm cursor-pointer"
                  >
                    <Edit2 size={18} />
                    {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                  </button>
                )}
                
                {/* Print Profile */}
                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-200 dark:border-gray-700 cursor-pointer"
                  title="Print Profile"
                >
                  <Printer size={18} />
                  <span className="hidden sm:inline">Print</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showPhotoUpload && (
        <ProfilePhotoUploader 
          memberId={profileId || member._id} 
          currentPhoto={member.avatar}
          onClose={() => setShowPhotoUpload(false)} 
          onSuccess={(newAvatar) => {
            setShowPhotoUpload(false);
            window.location.reload(); // Quick refresh for demo purposes, better to update state
          }} 
        />
      )}
    </>
  );
};

export default ProfileHeader;