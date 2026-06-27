import React from 'react';
import { motion } from 'framer-motion';
import { Clock, Star, Flag } from 'lucide-react';

const ProfileTimeline = ({ member }) => {
  const events = [];

  // Add Joined Club event
  if (member.joiningYear) {
    events.push({
      year: member.joiningYear,
      title: 'Joined Lions Club',
      description: `Became a member of Lions Club Rajapalayam.`,
      icon: Flag,
      color: 'bg-blue-500',
    });
  }

  // Add Current Position event
  if (member.clubPosition) {
    events.push({
      year: 'Present',
      title: 'Current Role',
      description: `Serving as ${member.clubPosition}.`,
      icon: Star,
      color: 'bg-amber-500',
    });
  }

  // Fallback if no timeline data
  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col items-center justify-center text-center space-y-3">
        <Clock size={32} className="text-gray-300" />
        <h3 className="text-sm font-semibold text-gray-600">Timeline Unavailable</h3>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Clock size={20} className="text-blue-600" />
        Member Timeline
      </h2>

      <div className="relative border-l-2 border-gray-100 ml-4 space-y-8 pb-4">
        {events.map((event, index) => {
          const Icon = event.icon;
          return (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-8"
            >
              {/* Timeline dot */}
              <div className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center text-white ${event.color}`}>
                <Icon size={12} />
              </div>
              
              {/* Content */}
              <div>
                <span className="text-xs font-bold tracking-wider text-gray-400 uppercase">
                  {event.year}
                </span>
                <h3 className="text-sm font-bold text-gray-900 mt-1">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{event.description}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileTimeline;