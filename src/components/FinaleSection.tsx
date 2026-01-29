import { useRef } from 'react';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import { Heart } from 'lucide-react';
import finaleImage from '@/assets/finale.jpg';

interface FinaleSectionProps {
  finale: {
    image: string;
    title: string;
    text: string;
  };
  coupleNames: {
    name1: string;
    name2: string;
  };
}

const FinaleSection = ({ finale, coupleNames }: FinaleSectionProps) => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);

  return (
    <section ref={sectionRef} className="relative min-h-screen overflow-hidden">
      {/* Parallax Background */}
      <motion.div 
        className="absolute inset-0"
        style={{ y }}
      >
        <img
          src={finaleImage}
          alt="Our forever"
          className="w-full h-[120%] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/50 to-foreground/30" />
      </motion.div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            transition={{ duration: 0.6, type: "spring" }}
            className="mb-8"
          >
            <Heart 
              size={48} 
              className="text-rose-light fill-rose-light/50 mx-auto animate-heart-beat"
            />
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="font-display text-5xl md:text-7xl text-primary-foreground mb-8"
          >
            {finale.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="font-body text-xl md:text-2xl leading-relaxed text-primary-foreground/90 mb-12"
          >
            {finale.text}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex items-center justify-center gap-4"
          >
            <span className="font-display text-3xl md:text-4xl text-rose-light italic">
              {coupleNames.name1}
            </span>
            <Heart size={24} className="text-rose-light fill-rose-light" />
            <span className="font-display text-3xl md:text-4xl text-rose-light italic">
              {coupleNames.name2}
            </span>
          </motion.div>

          {/* Decorative floating hearts */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  opacity: 0,
                  y: 100,
                  x: `${15 + i * 15}%`
                }}
                animate={isInView ? {
                  opacity: [0, 0.4, 0],
                  y: -200,
                } : {}}
                transition={{
                  duration: 4,
                  delay: 1 + i * 0.5,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                className="absolute bottom-0"
                style={{ left: `${10 + i * 15}%` }}
              >
                <Heart 
                  size={16 + i * 4} 
                  className="text-rose-light/50 fill-rose-light/30"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-0 right-0 text-center"
      >
        <p className="font-body text-sm text-primary-foreground/50">
          Made with love, Our story continues...
        </p>
      </motion.footer>
    </section>
  );
};

export default FinaleSection;
