import { motion } from 'framer-motion';

export default function Logo() {
  return (
    <motion.div
      className="relative w-12 h-12 mb-6"
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-xl opacity-80"
        initial={{ rotate: -10 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl mix-blend-multiply opacity-80"
        initial={{ rotate: 10 }}
        animate={{ rotate: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
      <motion.div 
        className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        Q
      </motion.div>
    </motion.div>
  );
}
