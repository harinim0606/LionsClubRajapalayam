import React from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Smartphone, Mail, Gift, Heart, PhoneOff, MailX } from 'lucide-react';
import { StatSkeleton } from './LoadingSkeletons';

const StatCard = ({ icon, label, value, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-white leading-tight">{value}</p>
      <p className="text-xs text-blue-100 font-medium">{label}</p>
    </div>
  </motion.div>
);

const HeroBanner = ({ stats }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative bg-gradient-to-r from-[#071D43] via-[#0A2A5E] to-[#0d3a7e] rounded-3xl p-6 sm:p-8 overflow-hidden"
    >
      <div className="absolute -top-8 -right-8 w-56 h-56 rounded-full bg-[#F4B400]/10 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 w-32 h-32 rounded-full bg-white/5 blur-2xl" />
      
      <div className="relative flex flex-col xl:flex-row gap-8 justify-between">
        {/* Left Content */}
        <div className="xl:w-1/3">
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare size={18} className="text-[#F4B400]" />
            <span className="text-[#F4B400] text-sm font-bold uppercase tracking-widest">Module 14</span>
          </div>
          <h1 className="text-white text-3xl font-black font-heading leading-tight mb-2">
            Communication Center
          </h1>
          <p className="text-blue-200 text-sm max-w-lg leading-relaxed">
            Connect with your Lions Club members instantly through WhatsApp and Email. Leverage smart batching to bypass browser limits seamlessly.
          </p>
        </div>

        {/* Right Stats Grid */}
        <div className="xl:w-2/3 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.keys(stats).length === 0 ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <StatCard delay={0.05} icon={<Users size={20} className="text-white" />} label="Total Members" value={stats.totalMembers || 0} color="bg-blue-500/30" />
              <StatCard delay={0.10} icon={<Smartphone size={20} className="text-green-300" />} label="With Mobile" value={stats.withMobile || 0} color="bg-green-500/30" />
              <StatCard delay={0.15} icon={<Mail size={20} className="text-blue-300" />} label="With Email" value={stats.withEmail || 0} color="bg-blue-600/30" />
              <StatCard delay={0.20} icon={<PhoneOff size={20} className="text-red-300" />} label="Missing Mobile" value={stats.missingMobile || 0} color="bg-red-500/30" />
              <StatCard delay={0.25} icon={<MailX size={20} className="text-red-300" />} label="Missing Email" value={stats.missingEmail || 0} color="bg-red-600/30" />
              <StatCard delay={0.30} icon={<Gift size={20} className="text-pink-300" />} label="Birthdays" value={stats.todaysBirthdays || 0} color="bg-pink-500/30" />
              <StatCard delay={0.35} icon={<Heart size={20} className="text-purple-300" />} label="Anniversaries" value={stats.todaysAnniversaries || 0} color="bg-purple-500/30" />
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default HeroBanner;
