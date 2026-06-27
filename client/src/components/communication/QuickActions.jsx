import React from 'react';
import { motion } from 'framer-motion';
import { Gift, Heart } from 'lucide-react';

const QuickActionCard = ({ icon, title, description, color, onClick, disabled }) => (
  <motion.button
    whileHover={!disabled ? { y: -3, scale: 1.01 } : {}}
    whileTap={!disabled ? { scale: 0.98 } : {}}
    onClick={onClick}
    disabled={disabled}
    className={`premium-card p-5 text-left w-full group transition-all duration-200 
      ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'hover:shadow-lg cursor-pointer'}`}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${color}`}>
        {icon}
      </div>
    </div>
    <p className="font-bold text-gray-900 dark:text-white group-hover:text-[#0A2A5E] dark:group-hover:text-[#F4B400] transition">{title}</p>
    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">{description}</p>
  </motion.button>
);

const QuickActions = ({ onNavigate }) => {
  return (
    <div>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
        <QuickActionCard
          icon={<Gift size={22} className="text-white" />}
          title="Birthday Wishes"
          description="Instantly wish members celebrating their birthdays today. Quick action cards included."
          color="bg-pink-500"
          onClick={() => onNavigate('birthdays')}
        />
        <QuickActionCard
          icon={<Heart size={22} className="text-white" />}
          title="Anniversary Wishes"
          description="Send congratulations to members celebrating their wedding anniversary today."
          color="bg-purple-500"
          onClick={() => onNavigate('anniversaries')}
        />
      </div>
    </div>
  );
};

export default QuickActions;
