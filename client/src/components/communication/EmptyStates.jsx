import React from 'react';
import { Users, Search, Gift, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const DirectoryEmptyState = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-card p-16 flex flex-col items-center justify-center text-center">
    <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
      <Search size={40} className="text-gray-400" />
    </div>
    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No members found</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">We couldn't find any members matching your current filters and search query. Try adjusting your criteria.</p>
  </motion.div>
);

export const BirthdayEmptyState = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-card p-16 flex flex-col items-center justify-center text-center">
    <div className="w-24 h-24 bg-pink-50 dark:bg-pink-900/20 rounded-full flex items-center justify-center mb-4">
      <Gift size={40} className="text-pink-300" />
    </div>
    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Birthdays Today</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">There are no members celebrating their birthday today. Check back tomorrow!</p>
  </motion.div>
);

export const AnniversaryEmptyState = () => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="premium-card p-16 flex flex-col items-center justify-center text-center">
    <div className="w-24 h-24 bg-purple-50 dark:bg-purple-900/20 rounded-full flex items-center justify-center mb-4">
      <Heart size={40} className="text-purple-300" />
    </div>
    <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">No Anniversaries Today</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md">There are no members celebrating their wedding anniversary today.</p>
  </motion.div>
);
