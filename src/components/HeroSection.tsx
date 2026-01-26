import { motion } from 'framer-motion';
import { Heart, ChevronDown } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

interface HeroSectionProps {
  name1: string;
  name2: string;
}

const HeroSection = ({ name1, name2 }: HeroSectionProps) => {
  const scrollToStory = () => {
    document.getElementById('story')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img 
          src={heroBg} 
          alt="Romantic background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/20 to-background" />
      </div>

      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-10 opacity-20"
        >
          <Heart size={60} className="text-primary fill-primary/30" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, 15, 0],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 right-20 opacity-20"
        >
          <Heart size={40} className="text-primary fill-primary/30" />
        </motion.div>
        <motion.div
          animate={{ 
            y: [0, -10, 0],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-40 left-1/4 opacity-15"
        >
          <Heart size={30} className="text-primary fill-primary/30" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mb-6"
        >
          <span className="font-body text-lg md:text-xl tracking-[0.3em] uppercase text-muted-foreground">
            A Love Story
          </span>
        </motion.div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 mb-8">
          <motion.h1
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-foreground"
          >
            {name1}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 1 }}
            className="relative"
          >
            <Heart 
              size={32} 
              className="text-primary fill-primary animate-heart-beat md:w-10 md:h-10"
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-medium text-foreground"
          >
            {name2}
          </motion.h1>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          className="font-body text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto italic"
        >
          "Every love story is beautiful, but ours is my favorite."
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          onClick={scrollToStory}
          className="mt-16 flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-auto"
        >
          <span className="font-body text-sm tracking-widest uppercase">Explore Our Story</span>
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <ChevronDown size={24} />
          </motion.div>
        </motion.button>
      </div>
    </section>
  );
};

export default HeroSection;
