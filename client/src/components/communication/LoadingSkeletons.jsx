import React from 'react';
import { motion } from 'framer-motion';

export const StatSkeleton = () => (
  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-white/20" />
    <div className="flex-1 space-y-2">
      <div className="h-6 bg-white/20 rounded w-1/2" />
      <div className="h-3 bg-white/10 rounded w-3/4" />
    </div>
  </div>
);

export const TableSkeleton = () => (
  <div className="premium-card p-8">
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-full mb-8" />
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex gap-4 items-center border-b border-gray-100 dark:border-gray-800 pb-4">
          <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
          <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
          </div>
          <div className="flex gap-2">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ContactCardSkeleton = () => (
  <div className="premium-card p-5 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-1/2" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-2 mt-5">
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
      <div className="h-12 bg-gray-200 dark:bg-gray-800 rounded-xl" />
    </div>
  </div>
);
