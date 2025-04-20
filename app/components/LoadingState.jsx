import { motion } from 'framer-motion';

export default function LoadingState({ message = "Loading your comparison..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-20 h-20 mb-4">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-primary rounded-full"
          style={{ filter: "blur(8px)" }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <svg className="w-12 h-12 text-white" viewBox="0 0 24 24">
            <motion.path
              fill="currentColor"
              d="M12,4V2A10,10 0 0,0 2,12H4A8,8 0 0,1 12,4Z"
              animate={{ rotate: 360 }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "linear",
              }}
              transformOrigin="12px 12px"
            />
          </svg>
        </motion.div>
      </div>
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="text-lg font-medium text-gray-700"
      >
        {message}
      </motion.p>
      <p className="mt-2 text-sm text-gray-500">This may take a few moments</p>
    </div>
  );
} 