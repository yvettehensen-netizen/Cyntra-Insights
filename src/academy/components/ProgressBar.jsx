import React from "react";
import { motion } from "framer-motion";

export const ProgressBar = ({ percentage }) => (
  <div className="w-full bg-[#2A2A2A] h-3 rounded-full overflow-hidden">
    <motion.div
      className="h-3 bg-[#D6B48E]"
      initial={{ width: 0 }}
      animate={{ width: `${percentage}%` }}
      transition={{ duration: 0.8 }}
    />
  </div>
);
export default ProgressBar;
