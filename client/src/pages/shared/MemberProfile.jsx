import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

// Components
import ProfileSkeleton from '../../components/member/ProfileSkeleton';
import ProfileHeader from '../../components/member/ProfileHeader';
import ProfileInformation from '../../components/member/ProfileInformation';
import ProfileMembership from '../../components/member/ProfileMembership';
import ProfileFamily from '../../components/member/ProfileFamily';
import ProfileAwards from '../../components/member/ProfileAwards';
import ProfileTimeline from '../../components/member/ProfileTimeline';

const MemberProfile = ({ id: propId }) => {
  const params = useParams();
  const id = propId || params.id;
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Edit State
  const [canEdit, setCanEdit] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [updateForm, setUpdateForm] = useState({});

  useEffect(() => {
    fetchMemberProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMemberProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/members/${id}`);
      if (res.data.success) {
        const memberData = res.data.data;
        setMember(memberData);
        setCanEdit(memberData.canEdit);
        
        // Initialize form data
        setUpdateForm({
          mobile: memberData.mobile || '',
          alternateMobile: memberData.alternateMobile || '',
          email: memberData.email || '',
          profession: memberData.profession || '',
          address: memberData.address || '',
          city: memberData.city || '',
          state: memberData.state || '',
          pincode: memberData.pincode || '',
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load profile');
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const res = await api.put(`/members/${id}`, updateForm);
      if (res.data.success) {
        toast.success('Profile updated successfully');
        setMember(prev => ({ ...prev, ...res.data.data }));
        setIsEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (error || !member) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Profile Not Found</h2>
        <p className="text-gray-500">{error || "The member you are looking for doesn't exist or you don't have access."}</p>
        <button 
          onClick={() => navigate('/directory')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          Return to Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Navigation Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
        >
          <ChevronLeft size={20} />
          Back
        </button>
        
        {isEditing && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveProfile}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-sm transition-colors disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>

      <ProfileHeader 
        member={member} 
        canEdit={canEdit}
        isEditing={isEditing}
        setIsEditing={setIsEditing}
        profileId={id}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Main Info) */}
        <div className="lg:col-span-2 space-y-6">
          <ProfileInformation 
            member={member}
            isEditing={isEditing}
            updateForm={updateForm}
            setUpdateForm={setUpdateForm}
          />
        </div>

        {/* Right Column (Lions Details) */}
        <div className="space-y-6">
          <ProfileMembership member={member} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
            <ProfileAwards member={member} />
            <ProfileFamily member={member} />
          </div>
          
          <ProfileTimeline member={member} />
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
