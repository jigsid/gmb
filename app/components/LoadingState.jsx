import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoadingState({ message = "Loading your comparison..." }) {
  const [progress, setProgress] = useState(5);
  const steps = [
    "Connecting to business database...",
    "Analyzing your competitors...",
    "Examining SEO performance...",
    "Generating growth insights...",
    "Identifying optimization opportunities..."
  ];
  
  // Simulate progress increase over time
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prevProgress => {
        const newProgress = prevProgress + 5;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center py-16 px-4"
    >
      {/* Morphing blob animation - 2025 trend */}
      <div className="relative w-36 h-36 mb-10">
        <motion.div
          animate={{
            borderRadius: [
              "60% 40% 30% 70%/60% 30% 70% 40%",
              "30% 60% 70% 40%/50% 60% 30% 60%",
              "60% 40% 30% 70%/60% 30% 70% 40%"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute inset-0 bg-gradient-to-br from-primary-600 to-secondary-600"
          style={{ 
            filter: "blur(6px)",
            zIndex: 1
          }}
        />
        
        <motion.div
          animate={{
            borderRadius: [
              "60% 40% 30% 70%/60% 30% 70% 40%",
              "30% 60% 70% 40%/50% 60% 30% 60%",
              "60% 40% 30% 70%/60% 30% 70% 40%"
            ]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.5
          }}
          className="absolute inset-0 bg-gradient-to-tr from-secondary-600 to-accent-600 opacity-70"
          style={{ 
            filter: "blur(8px)",
            zIndex: 2,
            transform: "scale(0.8) translateX(10px)"
          }}
        />
        
        {/* Main spinner */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute inset-0 flex items-center justify-center z-10"
        >
          <svg className="w-20 h-20 text-white drop-shadow-lg" viewBox="0 0 100 100">
            <motion.path
              fill="none"
              strokeWidth="6"
              stroke="currentColor"
              strokeLinecap="round"
              d="M 50,10 A 40,40 0 1 1 49,10"
              animate={{ 
                pathLength: [0.3, 0.8, 0.3],
                rotate: 360
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                times: [0, 0.5, 1]
              }}
              style={{ 
                transformOrigin: "center",
              }}
            />
          </svg>
        </motion.div>
      </div>
      
      {/* Main loading message */}
      <motion.div
        className="text-center max-w-md"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h3 
          className="text-2xl font-semibold text-foreground mb-2"
          animate={{ 
            color: [
              "rgb(16, 185, 129)", // primary-500
              "rgb(15, 155, 255)", // secondary-500
              "rgb(16, 185, 129)"  // primary-500
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {message}
        </motion.h3>
        
        {/* Dynamic steps with typewriter effect */}
        <div className="h-6 mt-3">
          <AnimatePresence mode="wait">
            {steps.map((step, index) => (
              <motion.p
                key={step}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="text-sm text-foreground-tertiary"
                style={{ 
                  position: "absolute",
                  left: "50%",
                  transform: "translateX(-50%)",
                  display: index === Math.floor((Date.now() / 3000) % steps.length) ? "block" : "none"
                }}
              >
                {step}
              </motion.p>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
      
      {/* Progress bar */}
      <div 
        className="w-full max-w-sm mt-10 h-2 bg-neutral-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuemin="0"
        aria-valuemax="100"
        aria-valuenow={progress}
      >
        <motion.div 
          className="h-full bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Value proposition hint */}
      <motion.p 
        className="mt-8 text-sm text-foreground-tertiary/80 max-w-sm text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        Our AI is analyzing thousands of data points to uncover your business's growth potential and outrank competitors
      </motion.p>
    </motion.div>
  );
} 