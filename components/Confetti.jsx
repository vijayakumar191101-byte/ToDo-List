import React from 'react';
import { motion } from 'framer-motion';

export const Confetti = ({ x, y }) => {
  const particles = Array.from({ length: 30 });
  const colors = ['#22d3ee', '#a855f7', '#f43f5e', '#fbbf24', '#34d399'];

  return (
    <div className="fixed pointer-events-none z-50" style={{ left: x, top: y }}>
      {particles.map((_, i) => {
        const angle = Math.random() * 360;
        const velocity = Math.random() * 150 + 50;
        const color = colors[Math.floor(Math.random() * colors.length)];
        
        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
            animate={{
              x: Math.cos(angle * (Math.PI / 180)) * velocity,
              y: Math.sin(angle * (Math.PI / 180)) * velocity,
              opacity: 0,
              scale: 0
            }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute w-2 h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        );
      })}
    </div>
  );
};