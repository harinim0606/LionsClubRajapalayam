import React, { useState, useRef } from 'react';
import { X, UploadCloud, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ProfilePhotoUploader = ({ memberId, currentPhoto, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(currentPhoto ? `http://localhost:5000${currentPhoto}` : null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      toast.error('Invalid file type. Please upload JPG, PNG, or WEBP.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      toast.error('File size exceeds 5MB limit.');
      return;
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
  };

  const handleUpload = async () => {
    if (!file) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const response = await api.post(`/members/${memberId}/photo`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      if (response.data.success) {
        toast.success('Profile photo updated successfully!');
        onSuccess(response.data.data.avatar);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload photo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!currentPhoto) return;
    
    const confirm = window.confirm("Are you sure you want to remove the profile photo?");
    if (!confirm) return;

    setIsDeleting(true);
    try {
      const response = await api.delete(`/members/${memberId}/photo`);
      if (response.data.success) {
        toast.success('Profile photo removed.');
        onSuccess('');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete photo');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Update Profile Photo</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6 flex flex-col items-center">
          {preview ? (
            <div className="relative">
              <img src={preview} alt="Preview" className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg" />
              <button 
                onClick={() => { setFile(null); setPreview(currentPhoto ? `http://localhost:5000${currentPhoto}` : null); }}
                className="absolute top-0 right-0 bg-white text-gray-600 p-1.5 rounded-full shadow border hover:text-red-500 transition-colors"
                title="Clear selection"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full bg-blue-50 flex items-center justify-center border-2 border-dashed border-blue-200">
              <UploadCloud size={40} className="text-blue-300" />
            </div>
          )}

          <div className="text-center w-full space-y-2">
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".jpg,.jpeg,.png,.webp" 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Choose Image
            </button>
            <p className="text-xs text-gray-500">Max size 5MB. Formats: JPG, PNG, WEBP.</p>
          </div>

          <div className="flex w-full gap-3 pt-2">
            {currentPhoto && !file && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors flex justify-center items-center gap-2"
              >
                {isDeleting ? 'Deleting...' : <><Trash2 size={18}/> Remove</>}
              </button>
            )}
            
            <button 
              onClick={handleUpload}
              disabled={!file || isUploading}
              className={`flex-1 py-2 text-white rounded-lg font-medium transition-colors shadow-sm flex justify-center items-center gap-2
                ${file ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-300 cursor-not-allowed'}`}
            >
              {isUploading ? 'Uploading...' : 'Upload Photo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePhotoUploader;