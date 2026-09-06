import { motion } from 'framer-motion';
import { Heart, Users } from 'lucide-react';

export function LoadingScreen() {
  return (
    <div className="loading-screen min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 flex flex-col items-center justify-center p-6">
      <div className="loading-water-drops" aria-hidden="true">
        {[0, 1, 2, 3, 4, 5].map(index => (
          <motion.span
            key={index}
            className="loading-water-drop"
            style={{ left: `${14 + index * 15}%` }}
            initial={{ y: -40, opacity: 0 }}
            animate={{ y: ['0%', '190px'], opacity: [0, 0.7, 0] }}
            transition={{ duration: 2.6, delay: index * 0.38, repeat: Infinity, ease: 'easeIn' }}
          />
        ))}
      </div>
      <motion.div 
        className="relative z-10 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        {/* App Logo */}
        <motion.div 
          className="w-28 h-28 mx-auto mb-6 rounded-2xl overflow-hidden shadow-lg bg-white border border-gray-100"
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "reverse"
          }}
        >
          <img 
            src="/logo.png" 
            alt="NagarSetu Logo" 
            className="w-full h-full object-contain p-2"
          />
        </motion.div>

        {/* Circular Loader */}
        <motion.div
          className="loading-signal mx-auto mb-8"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          aria-hidden="true"
        >
          {[0, 1, 2, 3, 4].map(index => (
            <motion.span
              key={index}
              className="loading-signal-bar"
              animate={{ height: [8, 24, 12, 8], opacity: [0.35, 1, 0.55, 0.35] }}
              transition={{ duration: 1.4, delay: index * 0.12, repeat: Infinity, ease: 'easeInOut' }}
            />
          ))}
        </motion.div>

        {/* App Name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          {/* <h1 className="text-3xl font-bold text-gray-800 mb-8">Swachh Nagar</h1> */}
        </motion.div>

        {/* Features */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Heart className="w-4 h-4 text-red-500" />
            <span className="text-md">&nbsp;Building a cleaner community</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-md">&nbsp;Connecting citizens & government</span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}