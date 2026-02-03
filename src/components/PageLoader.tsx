import { motion, AnimatePresence } from "framer-motion";

export default function PageLoader({ isVisible }: { isVisible: boolean }) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="loader"
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#3B0E18]"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        >
          <motion.img
            src="/Logo-Cyntra-Insights.png"
            alt="Cyntra Insights Logo"
            className="w-20 mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          <motion.h1
            className="text-[#D6B48E] text-2xl font-playfair tracking-wide gold-shine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Cyntra Insights
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
