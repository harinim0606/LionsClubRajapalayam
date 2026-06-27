import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, Key, Loader2, Image as ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api/axios";

// Helper for resetting form state
const initialFormState = {
  memberNumber: "",
  name: "",
  firstName: "",
  lastName: "",
  gender: "",
  mobile: "",
  alternateMobile: "",
  whatsappMobile: "",
  email: "",
  bloodGroup: "",
  dateOfBirth: "",
  weddingDate: "",
  profession: "",
  company: "",
  address: "",
  city: "",
  district: "",
  state: "",
  country: "",
  pincode: "",
  joiningYear: "",
  clubPosition: "",
  clubPositionYear: "",
  spouseName: "",
  spouseMemberId: "",
  status: "active",
};

const MemberFormModal = ({ isOpen, onClose, member = null, onSuccess }) => {
  const [formData, setFormData] = useState(initialFormState);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const isEditMode = !!member;

  useEffect(() => {
    if (isOpen) {
      if (member) {
        setFormData({
          ...initialFormState,
          ...member,
          dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : "",
          weddingDate: member.weddingDate ? new Date(member.weddingDate).toISOString().split('T')[0] : "",
        });
        setPhotoPreview(member.avatar || null);
      } else {
        setFormData(initialFormState);
        setPhotoPreview(null);
      }
      setPhoto(null);
      setErrors({});
    }
  }, [isOpen, member]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Image size must be less than 2MB");
        return;
      }
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.memberNumber.trim()) newErrors.memberNumber = "Member Number is required";
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile Number is required";
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      // Focus first error
      setTimeout(() => {
        const firstErrorName = Object.keys(newErrors)[0];
        const el = formRef.current?.querySelector(`[name="${firstErrorName}"]`);
        if (el) el.focus();
      }, 0);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== "") {
          data.append(key, formData[key]);
        }
      });
      if (photo) {
        data.append("photo", photo);
      }

      let res;
      if (isEditMode) {
        res = await api.put(`/admin/members/${member._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Member updated successfully");
      } else {
        res = await api.post("/admin/members", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Member created successfully");
        if (res.data.data.tempPassword) {
          // In a real app, you might want to show this in a modal
          toast(`Temporary Password: ${res.data.data.tempPassword}`, { duration: 10000, icon: '🔑' });
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Operation failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!window.confirm("Are you sure you want to reset this user's password?")) return;
    
    setIsResettingPassword(true);
    try {
      const res = await api.put(`/admin/members/${member._id}/reset-password`);
      toast.success("Password reset successfully");
      if (res.data.data.tempPassword) {
        toast(`New Temporary Password: ${res.data.data.tempPassword}`, { duration: 10000, icon: '🔑' });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reset password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[90vh] bg-gray-50 rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-100 flex items-center justify-between shrink-0 z-10 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900 font-heading">
                {isEditMode ? "Edit Member" : "Add New Member"}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {isEditMode ? "Update member details and preferences" : "Create a new member profile and user account"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {isEditMode && (
                <button
                  type="button"
                  onClick={handleResetPassword}
                  disabled={isResettingPassword}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl font-semibold text-sm transition-colors border border-amber-200 shadow-sm disabled:opacity-50"
                >
                  {isResettingPassword ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
                  Reset Password
                </button>
              )}
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Form Body */}
          <div className="flex-1 overflow-y-auto">
            <form id="member-form" ref={formRef} onSubmit={handleSubmit} className="p-6 space-y-8">
              
              {/* Photo Upload Section */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden shrink-0 transition-colors group-hover:border-[#0A2A5E]">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="text-gray-400" size={32} />
                    )}
                  </div>
                  <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-2xl">
                    <Upload size={20} />
                    <span className="text-[10px] font-bold mt-1">Upload</span>
                    <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={handlePhotoChange} />
                  </label>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Profile Photo</h3>
                  <p className="text-xs text-gray-500 mt-1 max-w-sm">
                    Upload a square image. Allowed formats: JPG, PNG, WEBP. Max size: 2MB.
                  </p>
                </div>
              </div>

              {/* Grid Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Personal Information */}
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0A2A5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#F4B400] rounded-full"></span>
                    Personal Information
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Member Number *</label>
                    <input type="text" name="memberNumber" value={formData.memberNumber} onChange={handleChange} className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.memberNumber ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all`} />
                    {errors.memberNumber && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.memberNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all`} />
                    {errors.name && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">First Name</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Last Name</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth</label>
                      <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Blood Group</label>
                      <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all">
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0A2A5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#F4B400] rounded-full"></span>
                    Contact Information
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Mobile *</label>
                    <input type="text" name="mobile" value={formData.mobile} onChange={handleChange} className={`w-full px-4 py-2.5 bg-gray-50 border ${errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-200'} rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all`} />
                    {errors.mobile && <p className="text-[10px] text-red-500 font-semibold mt-1">{errors.mobile}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">WhatsApp</label>
                      <input type="text" name="whatsappMobile" value={formData.whatsappMobile} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Alternate</label>
                      <input type="text" name="alternateMobile" value={formData.alternateMobile} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Email</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                  </div>
                </div>

                {/* Club Information */}
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0A2A5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#F4B400] rounded-full"></span>
                    Club Details
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Club Position</label>
                      <input type="text" name="clubPosition" value={formData.clubPosition} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Position Year</label>
                      <input type="text" name="clubPositionYear" value={formData.clubPositionYear} onChange={handleChange} placeholder="e.g. 2024-25" className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Joining Year</label>
                    <input type="number" name="joiningYear" value={formData.joiningYear} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                  </div>
                </div>

                {/* Family Information */}
                <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-sm font-bold text-[#0A2A5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[#F4B400] rounded-full"></span>
                    Family Details
                  </h3>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Spouse Name</label>
                    <input type="text" name="spouseName" value={formData.spouseName} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Spouse Member ID (if any)</label>
                      <input type="text" name="spouseMemberId" value={formData.spouseMemberId} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Wedding Date</label>
                      <input type="date" name="weddingDate" value={formData.weddingDate} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                  </div>
                </div>

                {/* Professional & Address spanning full width */}
                <div className="col-span-1 md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-[#0A2A5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#F4B400] rounded-full"></span>
                      Professional
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Profession</label>
                        <input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Company</label>
                        <input type="text" name="company" value={formData.company} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                    <h3 className="text-sm font-bold text-[#0A2A5E] uppercase tracking-wider mb-2 flex items-center gap-2">
                      <span className="w-1.5 h-4 bg-[#F4B400] rounded-full"></span>
                      Location
                    </h3>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-1">Address</label>
                      <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">City</label>
                        <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Pincode</label>
                        <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#0A2A5E]/20 focus:border-[#0A2A5E] outline-none transition-all" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Footer Actions */}
          <div className="bg-white px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="member-form"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-[#0A2A5E] hover:bg-[#071D43] transition-colors flex items-center gap-2 shadow-sm shadow-blue-900/20 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Saving...
                </>
              ) : (
                "Save Member"
              )}
            </button>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MemberFormModal;
