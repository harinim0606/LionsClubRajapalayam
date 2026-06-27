import React from 'react';
import { Mail, Phone, MapPin, Briefcase, Calendar, Droplet, User, Users } from 'lucide-react';
import { formatDate } from '../../utils/helpers';

const InfoItem = ({ icon: Icon, label, value, isEditing, field, onChange, type = "text", colSpan = 1 }) => {
  return (
    <div className={`p-4 bg-gray-50 rounded-xl border border-gray-100 flex gap-4 ${colSpan === 2 ? 'sm:col-span-2' : ''}`}>
      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
        <Icon size={20} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        
        {isEditing && onChange ? (
          <input
            type={type}
            value={value || ''}
            onChange={(e) => onChange(field, e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-1.5 text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
            placeholder={`Enter ${label.toLowerCase()}`}
          />
        ) : (
          <p className="text-sm font-medium text-gray-900 truncate" title={value || 'N/A'}>
            {value || <span className="text-gray-400 italic">Not provided</span>}
          </p>
        )}
      </div>
    </div>
  );
};

const ProfileInformation = ({ member, isEditing, updateForm, setUpdateForm }) => {
  
  const handleInputChange = (field, value) => {
    setUpdateForm(prev => ({ ...prev, [field]: value }));
  };

  // Helper to get value (either from updateForm if editing, or member if not)
  const getValue = (field) => {
    return isEditing ? updateForm[field] : member[field];
  };

  return (
    <div className="space-y-6">
      {/* Contact Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          Contact Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem 
            icon={Phone} 
            label="Mobile Number" 
            value={getValue('mobile')} 
            isEditing={isEditing} 
            field="mobile" 
            onChange={handleInputChange} 
            type="tel"
          />
          <InfoItem 
            icon={Phone} 
            label="Alternate Mobile" 
            value={getValue('alternateMobile')} 
            isEditing={isEditing} 
            field="alternateMobile" 
            onChange={handleInputChange} 
            type="tel"
          />
          <InfoItem 
            icon={Mail} 
            label="Email Address" 
            value={getValue('email')} 
            isEditing={isEditing} 
            field="email" 
            onChange={handleInputChange} 
            type="email"
          />
          <InfoItem 
            icon={MapPin} 
            label="Address" 
            value={getValue('address')} 
            isEditing={isEditing} 
            field="address" 
            onChange={handleInputChange} 
          />
          <InfoItem 
            icon={MapPin} 
            label="City" 
            value={getValue('city')} 
            isEditing={isEditing} 
            field="city" 
            onChange={handleInputChange} 
          />
          <InfoItem 
            icon={MapPin} 
            label="State" 
            value={getValue('state')} 
            isEditing={isEditing} 
            field="state" 
            onChange={handleInputChange} 
          />
          <InfoItem 
            icon={MapPin} 
            label="PIN Code" 
            value={getValue('pincode')} 
            isEditing={isEditing} 
            field="pincode" 
            onChange={handleInputChange} 
          />
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Personal Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InfoItem 
            icon={User} 
            label="Gender" 
            value={member.gender} 
            isEditing={false} // Read only
          />
          <InfoItem 
            icon={Calendar} 
            label="Date of Birth" 
            value={formatDate(member.dateOfBirth)} 
            isEditing={false} // Read only
          />
          <InfoItem 
            icon={Droplet} 
            label="Blood Group" 
            value={member.bloodGroup} 
            isEditing={false} // Read only (or editable if required)
          />
          <InfoItem 
            icon={Briefcase} 
            label="Occupation" 
            value={getValue('profession')} 
            isEditing={isEditing} 
            field="profession" 
            onChange={handleInputChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileInformation;