import { motion } from "framer-motion";
import { Construction } from "lucide-react";

const ComingSoon = ({ title }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.97 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
    className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
  >
    <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0A2A5E]/10 to-[#0A2A5E]/5 flex items-center justify-center mb-6 shadow-sm">
      <Construction size={36} className="text-[#0A2A5E]" />
    </div>
    <h2 className="text-2xl font-bold font-heading text-gray-900 mb-2">{title}</h2>
    <p className="text-gray-400 text-sm font-medium max-w-xs">
      This module is under development and will be available soon.
    </p>
    <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#0A2A5E] bg-[#0A2A5E]/8 px-4 py-2 rounded-full border border-[#0A2A5E]/10">
      🦁 Coming Soon
    </div>
  </motion.div>
);

export default ComingSoon;
