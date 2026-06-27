import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/axios";
import { 
  Sun, Sunrise, Moon, Gift, Heart, Info, Users, 
  Calendar, MapPin, Award 
} from "lucide-react";

// Helper for time-based greeting
const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return { text: "Good Morning", icon: Sunrise };
  if (hour < 18) return { text: "Good Afternoon", icon: Sun };
  return { text: "Good Evening", icon: Moon };
};

// Skeleton Loader Component
const DashboardSkeleton = () => (
  <div className="space-y-8 animate-pulse">
    <div className="h-10 bg-gray-200 rounded-lg w-1/3"></div>
    <div className="h-64 bg-gray-200 rounded-2xl w-full"></div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="h-48 bg-gray-200 rounded-2xl"></div>
      <div className="h-48 bg-gray-200 rounded-2xl"></div>
    </div>
  </div>
);

// Horizontal Member Card
const MemberCard = ({ member, type }) => (
  <motion.div 
    whileHover={{ scale: 1.02 }}
    className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="h-14 w-14 rounded-full bg-gray-100 overflow-hidden shrink-0 border-2 border-gray-50 flex items-center justify-center">
      {member.avatar ? (
        <img src={member.avatar} alt={member.name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-xl text-[#0A2A5E] font-bold">{member.name.charAt(0)}</span>
      )}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-gray-900 truncate font-heading">{member.name}</p>
      <p className="text-xs text-gray-500 truncate">{member.clubPosition || "Member"}</p>
    </div>
    <div className="shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-opacity-10 border" 
         style={{ 
           backgroundColor: type === "birthday" ? "#F4B4001a" : "#0A2A5E1a",
           borderColor: type === "birthday" ? "#F4B40033" : "#0A2A5E33",
           color: type === "birthday" ? "#D69E00" : "#0A2A5E" 
         }}>
      {type === "birthday" ? <Gift size={20} /> : <Heart size={20} />}
    </div>
  </motion.div>
);

const MemberDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const greeting = getGreeting();
  const GreetingIcon = greeting.icon;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/member");
        if (response.data.success) {
          setData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (err) {
        setError("Failed to load dashboard data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="text-red-500 p-4 bg-red-50 rounded-lg">{error}</div>;
  if (!data) return null;

  const { loggedInMember, clubSettings, todayBirthdays, todayAnniversaries } = data;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8 pb-10"
    >
      {/* 1. Welcome Section */}
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <GreetingIcon className="text-[#F4B400] h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900 font-heading">
            {greeting.text}, {loggedInMember?.name || "Member"}!
          </h1>
          {loggedInMember?.clubPosition && (
            <p className="text-gray-600 mt-1">{loggedInMember.clubPosition} • {clubSettings?.clubName}</p>
          )}
        </div>
      </motion.div>

      {/* 2. Club Information Hero Card */}
      {clubSettings && (
        <motion.div variants={itemVariants}>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0A2A5E] to-[#071D43] text-white shadow-xl">
            {/* Glassmorphism Background Pattern */}
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-white opacity-5 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#F4B400] opacity-10 blur-3xl"></div>
            
            <div className="relative p-6 sm:p-10 z-10 flex flex-col md:flex-row items-center gap-8">
              {/* Club Logo / Monogram */}
              <div className="shrink-0">
                <div className="h-32 w-32 rounded-full bg-white/10 backdrop-blur-md border border-white/20 p-2 flex items-center justify-center shadow-inner">
                  {clubSettings.clubLogo ? (
                    <img src={clubSettings.clubLogo} alt="Club Logo" className="h-full w-full object-contain rounded-full" />
                  ) : (
                    <span className="text-5xl font-bold text-[#F4B400] font-heading">LC</span>
                  )}
                </div>
              </div>

              {/* Club Details */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm font-medium mb-4 backdrop-blur-sm">
                  <Award size={16} className="text-[#F4B400] mr-2" />
                  Club No: {clubSettings.clubNumber}
                </div>
                <h2 className="text-3xl sm:text-4xl font-bold font-heading mb-4 tracking-tight">
                  {clubSettings.clubName}
                </h2>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="flex flex-col">
                    <span className="text-white/60 text-xs uppercase tracking-wider mb-1 flex items-center gap-1 justify-center md:justify-start"><MapPin size={12}/> District / Region</span>
                    <span className="font-semibold">{clubSettings.region || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/60 text-xs uppercase tracking-wider mb-1 flex items-center gap-1 justify-center md:justify-start"><Calendar size={12}/> Chartered On</span>
                    <span className="font-semibold">{clubSettings.charteredOn || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/60 text-xs uppercase tracking-wider mb-1 flex items-center gap-1 justify-center md:justify-start"><Users size={12}/> Total Members</span>
                    <span className="font-semibold text-[#F4B400]">{clubSettings.totalMembers || 0}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-white/60 text-xs uppercase tracking-wider mb-1 flex items-center gap-1 justify-center md:justify-start"><Info size={12}/> Lionistic Year</span>
                    <span className="font-semibold">{clubSettings.currentLionisticYear || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* 3 & 4. Birthdays and Anniversaries Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Birthdays Section */}
        <motion.div variants={itemVariants} className="premium-card p-6 flex flex-col h-full bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#F4B400]/10 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-[#F4B400]/10 rounded-lg">
              <Gift className="text-[#D69E00]" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-heading">Today's Birthdays</h3>
          </div>
          
          <div className="flex-1 relative z-10">
            {todayBirthdays && todayBirthdays.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {todayBirthdays.map((member) => (
                  <MemberCard key={member._id} member={member} type="birthday" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="bg-gray-50 rounded-full p-4 mb-3">
                  <Gift className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium">No birthdays today 🎉</p>
                <p className="text-xs text-gray-400 mt-1">Check back tomorrow!</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Anniversaries Section */}
        <motion.div variants={itemVariants} className="premium-card p-6 flex flex-col h-full bg-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#0A2A5E]/5 to-transparent rounded-bl-full pointer-events-none"></div>
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 bg-[#0A2A5E]/10 rounded-lg">
              <Heart className="text-[#0A2A5E]" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 font-heading">Today's Anniversaries</h3>
          </div>
          
          <div className="flex-1 relative z-10">
            {todayAnniversaries && todayAnniversaries.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {todayAnniversaries.map((member) => (
                  <MemberCard key={member._id} member={member} type="anniversary" />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <div className="bg-gray-50 rounded-full p-4 mb-3">
                  <Heart className="text-gray-300" size={32} />
                </div>
                <p className="text-gray-500 font-medium">No anniversaries today 💍</p>
                <p className="text-xs text-gray-400 mt-1">Check back tomorrow!</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>
    </motion.div>
  );
};

export default MemberDashboard;
