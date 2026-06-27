import React from "react";
import { useAuth } from "../../context/AuthContext";
import MemberProfile from "./MemberProfile";
import { Shield } from "lucide-react";

/**
 * MyProfile.jsx
 *
 * - Standard Members: Renders their own profile using the MemberProfile component with id="me".
 * - Admins: Shown a clean Administrator account card (no member profile exists).
 */
const MyProfile = () => {
  const { user } = useAuth();

  if (!user) return null;

  // Admin view — Admins do not have member profiles
  if (user.role === "admin") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-10 max-w-md shadow-sm">
          <div className="w-20 h-20 bg-[#0A2A5E] rounded-full flex items-center justify-center mx-auto mb-5">
            <span className="text-[#F4B400] text-3xl font-bold font-heading">
              {user.name ? user.name.charAt(0).toUpperCase() : "A"}
            </span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name || "Administrator"}</h2>
          <p className="text-sm text-[#0A2A5E] font-semibold uppercase tracking-wider bg-[#0A2A5E]/5 px-4 py-1 rounded-full border border-[#0A2A5E]/10 inline-block mb-4">
            Administrator
          </p>
          <div className="text-sm text-gray-500 bg-gray-50 rounded-xl p-4 border border-gray-100">
            <p>Administrator accounts do not have a member profile.</p>
            <p className="mt-1">Use the <strong>Member Directory</strong> to view and manage member profiles.</p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback for members with no memberId linked (edge case)
  if (user.role === "member" && !user.memberId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10 max-w-md shadow-sm">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-amber-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Linked</h2>
          <p className="text-sm text-gray-600">
            Your account is not yet linked to a member record. Please contact the administrator.
          </p>
        </div>
      </div>
    );
  }

  // Member view — Render their own profile via the "me" endpoint
  return <MemberProfile id="me" />;
};

export default MyProfile;
