import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Cake, Heart, AlertCircle, RefreshCw } from "lucide-react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

// Dashboard Components
import ClubInformationCard from "../../components/dashboard/ClubInformationCard";
import BirthdayCard from "../../components/dashboard/BirthdayCard";
import AnniversaryCard from "../../components/dashboard/AnniversaryCard";
import DashboardEmptyState from "../../components/dashboard/DashboardEmptyState";
import { ClubInfoSkeleton, CardGridSkeleton } from "../../components/dashboard/DashboardSkeleton";

// ─── Section Header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon, title, count, accentColor }) => (
  <div className="flex items-center justify-between mb-4">
    <div className="flex items-center gap-3">
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accentColor}`}>
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white font-heading">{title}</h2>
        {count !== undefined && (
          <p className="text-xs text-gray-400 font-medium">
            {count === 0 ? "None today" : `${count} today`}
          </p>
        )}
      </div>
    </div>
    {count > 0 && (
      <span className={`text-xs font-bold px-3 py-1 rounded-full ${accentColor}`}>
        {count}
      </span>
    )}
  </div>
);

// ─── Greeting Banner ──────────────────────────────────────────────────────────

const GreetingBanner = ({ user }) => {
  const { t } = useTranslation();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative bg-gradient-to-r from-[#071D43] via-[#0A2A5E] to-[#0d3a7e] rounded-3xl p-6 sm:p-8 overflow-hidden"
    >
      {/* Decorative blobs */}
      <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-[#F4B400]/10 blur-2xl" />
      <div className="absolute -bottom-6 left-1/4 w-32 h-32 rounded-full bg-white/5 blur-xl" />

      <div className="relative">
        <p className="text-[#F4B400] text-sm font-semibold uppercase tracking-widest">{greeting}</p>
        <h1 className="text-white text-2xl sm:text-3xl font-black font-heading mt-1">
          Lion {user?.name || "Admin"}
        </h1>
        <p className="text-blue-200 text-sm mt-1">{today}</p>

        <div className="flex items-center gap-2 mt-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-white/40 text-xs font-medium">Lions Club of Rajapalayam · {t("sidebar.admin")} Portal</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>
      </div>
    </motion.div>
  );
};

// ─── Error State ──────────────────────────────────────────────────────────────

const ErrorState = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4">
    <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
      <AlertCircle size={32} className="text-red-500" />
    </div>
    <div className="text-center">
      <h3 className="text-lg font-bold text-gray-900">Failed to Load Dashboard</h3>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-2 px-5 py-2.5 bg-[#0A2A5E] text-white rounded-xl font-semibold text-sm hover:bg-[#071D43] transition-colors shadow"
    >
      <RefreshCw size={16} /> Retry
    </button>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/dashboard/admin");
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (error) {
    return <ErrorState message={error} onRetry={fetchDashboard} />;
  }

  return (
    <div className="space-y-8 pb-10">
      {/* Greeting Banner */}
      <GreetingBanner user={user} />

      {/* ── Section 1: Club Information ─────────────────────────────────── */}
      <section>
        <SectionHeader
          icon={<span className="text-lg">🏛️</span>}
          title="Club Information"
          accentColor="bg-[#0A2A5E]/8 text-[#0A2A5E] dark:bg-[#F4B400]/20 dark:text-[#F4B400]"
        />
        {loading ? (
          <ClubInfoSkeleton />
        ) : (
          <ClubInformationCard club={data?.clubInformation} />
        )}
      </section>

      {/* ── Section 2 & 3 side by side on large screens ──────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* ── Section 2: Today's Birthdays ────────────────────────────── */}
        <section>
          <SectionHeader
            icon={<Cake size={18} className="text-pink-500" />}
            title="Today's Birthdays"
            count={loading ? undefined : (data?.todaysBirthdays?.length ?? 0)}
            accentColor="bg-pink-50 text-pink-600"
          />
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : data?.todaysBirthdays?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.todaysBirthdays.map((member, i) => (
                <BirthdayCard key={member._id} member={member} index={i} />
              ))}
            </div>
          ) : (
            <div className="premium-card">
              <DashboardEmptyState icon="🎂" message="No birthdays today. Check back tomorrow!" />
            </div>
          )}
        </section>

        {/* ── Section 3: Today's Wedding Anniversaries ─────────────────── */}
        <section>
          <SectionHeader
            icon={<Heart size={18} className="text-rose-500" />}
            title="Today's Anniversaries"
            count={loading ? undefined : (data?.todaysAnniversaries?.length ?? 0)}
            accentColor="bg-rose-50 text-rose-600"
          />
          {loading ? (
            <CardGridSkeleton count={3} />
          ) : data?.todaysAnniversaries?.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.todaysAnniversaries.map((member, i) => (
                <AnniversaryCard key={member._id} member={member} index={i} />
              ))}
            </div>
          ) : (
            <div className="premium-card">
              <DashboardEmptyState icon="💍" message="No wedding anniversaries today." />
            </div>
          )}
        </section>

      </div>
    </div>
  );
};

export default AdminDashboard;
