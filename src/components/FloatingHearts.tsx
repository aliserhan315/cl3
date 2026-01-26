import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FloatingHeart {
  id: number;
  x: number;
  delay: number;
  size: number;
  duration: number;
}

const FloatingHearts = () => {
  const [hearts, setHearts] = useState<FloatingHeart[]>([]);

  useEffect(() => {
    const createHeart = () => {
      const newHeart: FloatingHeart = {
        id: Date.now() + Math.random(),
        x: Math.random() * 100,
        delay: 0,
        size: Math.random() * 20 + 12,
        duration: Math.random() * 3 + 4,
      };
      setHearts(prev => [...prev, newHeart]);

      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== newHeart.id));
      }, newHeart.duration * 1000);
    };

    const interval = setInterval(createHeart, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ 
              opacity: 0, 
              y: '100vh',
              x: `${heart.x}vw`,
              scale: 0.5,
              rotate: -15
            }}
            animate={{ 
              opacity: [0, 0.7, 0.7, 0],
              y: '-10vh',
              scale: [0.5, 1, 1, 0.8],
              rotate: [0, 10, -10, 0]
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: heart.duration,
              ease: 'easeOut'
            }}
            className="absolute"
            style={{ left: `${heart.x}%` }}
          >
            <Heart 
              size={heart.size} 
              className="text-primary/40 fill-primary/20"
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default FloatingHearts;
