import React from 'react';
import { motion } from 'framer-motion';

interface LoadingOverlayProps {
  isActive: boolean;
  message?: string;
  variant?: 'full' | 'skeleton';
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ 
  isActive, 
  message = 'Loading...',
  variant = 'full'
}) => {
  if (!isActive) return null;

  if (variant === 'skeleton') {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-slate-700/50 rounded w-3/4"></div>
        <div className="h-4 bg-slate-700/50 rounded w-1/2"></div>
        <div className="space-y-2">
          <div className="h-3 bg-slate-700/50 rounded w-full"></div>
          <div className="h-3 bg-slate-700/50 rounded w-full"></div>
          <div className="h-3 bg-slate-700/50 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center gap-4 p-8 rounded-2xl bg-slate-800 border border-slate-700 shadow-2xl"
      >
        <div className="relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
            className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full"
          ></motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
          </div>
        </div>
        <p className="text-cyan-100 font-medium animate-pulse">{message}</p>
      </motion.div>
    </motion.div>
  );
};
