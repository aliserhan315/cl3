import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Sparkles, Calendar, Quote } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface StoryData {
  beginning: {
    title: string;
    subtitle: string;
    text: string;
  };
  specialDate: {
    title: string;
    date: string;
    text: string;
  };
  words: {
    title: string;
    quote: string;
    author: string;
  };
}

interface StoryOverviewProps {
  story: StoryData;
}

// Optimized floating orbs - uses transform and opacity only for GPU acceleration
const FloatingOrb = ({ 
  className, 
  delay = 0, 
  duration = 15,
  shouldAnimate = true 
}: { 
  className: string; 
  delay?: number; 
  duration?: number;
  shouldAnimate?: boolean;
}) => (
  <motion.div
    className={className}
    initial={{ opacity: 0 }}
    animate={shouldAnimate ? {
      opacity: [0.15, 0.25, 0.15],
      x: [0, 30, -20, 0],
      y: [0, -40, 20, 0],
    } : { opacity: 0.2 }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "linear", // Changed to linear for smoother animation
    }}
    style={{ willChange: 'transform, opacity' }} // Hint to browser for optimization
  />
);

// Optimized invitation view
const InvitationView = ({ 
  children, 
  delay = 0,
  isActive = false,
  shouldAnimate = true,
}: { 
  children: React.ReactNode; 
  delay?: number;
  isActive?: boolean;
  shouldAnimate?: boolean;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px", amount: 0.3 });

  const variants = {
    hidden: { opacity: 0, y: 20 }, // Reduced distance for smoother feel
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate && isInView ? "visible" : undefined}
      variants={shouldAnimate ? variants : undefined}
      transition={{ duration: 0.5, delay, ease: "easeOut" }} // Shortened duration
      className="relative h-full min-h-[500px] md:min-h-[600px] flex items-center justify-center py-12"
      style={{ willChange: shouldAnimate && !isInView ? 'transform, opacity' : 'auto' }}
    >
      {/* Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-center px-6 md:px-12 text-center">
        {children}
      </div>
    </motion.div>
  );
};

const BeginningCard = ({ story }: { story: StoryData }) => (
  <>
    <div className="mb-3">
      <p className="font-body text-xs md:text-sm text-primary/70 tracking-[0.3em] uppercase">
        {story.beginning.subtitle}
      </p>
    </div>
    <h3 className="font-display text-4xl md:text-5xl text-foreground mb-8 leading-tight">
      {story.beginning.title}
    </h3>
    <div className="w-20 h-0.5 bg-primary/30 mx-auto mb-10" />
    <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground max-w-lg mx-auto">
      {story.beginning.text}
    </p>
  </>
);

const SpecialDateCard = ({ story }: { story: StoryData }) => (
  <>
    <div className="mb-3">
      <p className="font-body text-xs md:text-sm text-primary/70 tracking-[0.3em] uppercase">
        Special Date
      </p>
    </div>
    <h3 className="font-display text-4xl md:text-5xl text-foreground mb-6 leading-tight">
      {story.specialDate.title}
    </h3>
    <div className="mb-8">
      <Calendar className="w-8 h-8 text-primary/60 mx-auto mb-3" />
      <p className="font-body text-xl md:text-2xl text-primary font-light tracking-wide">{story.specialDate.date}</p>
    </div>
    <div className="w-20 h-0.5 bg-primary/30 mx-auto mb-10" />
    <p className="font-body text-base md:text-lg leading-relaxed text-muted-foreground max-w-lg mx-auto">
      {story.specialDate.text}
    </p>
  </>
);

const WordsCard = ({ story }: { story: StoryData }) => (
  <>
    <div className="mb-3">
      <p className="font-body text-xs md:text-sm text-primary/70 tracking-[0.3em] uppercase">
        Words to Remember
      </p>
    </div>
    <h3 className="font-display text-4xl md:text-5xl text-foreground mb-10 leading-tight">
      {story.words.title}
    </h3>
    <div className="w-20 h-0.5 bg-primary/30 mx-auto mb-10" />
    <blockquote className="font-accent text-lg md:text-xl italic leading-relaxed text-foreground/90 mb-8 max-w-2xl mx-auto px-4">
      "{story.words.quote}"
    </blockquote>
    <p className="font-body text-xs md:text-sm text-muted-foreground/70 tracking-wider">— {story.words.author}</p>
  </>
);

const CarouselDots = ({ 
  count, 
  current 
}: { 
  count: number; 
  current: number;
}) => (
  <div className="flex justify-center gap-2 mt-8">
    {Array.from({ length: count }).map((_, index) => (
      <motion.div
        key={index}
        animate={{
          width: index === current ? 32 : 8,
          opacity: index === current ? 1 : 0.4,
        }}
        transition={{ duration: 0.2, ease: "easeOut" }} // Faster transition
        className="h-2 rounded-full bg-primary"
      />
    ))}
  </div>
);

const StoryOverview = ({ story }: StoryOverviewProps) => {
  const isMobile = useIsMobile();
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = !prefersReducedMotion;
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Optimized scroll handler with throttling
  useEffect(() => {
    if (!isMobile) return;
    const container = scrollRef.current;
    if (!container) return;

    let ticking = false;

    const updateCurrent = () => {
      const containerCenter = container.scrollLeft + container.clientWidth / 2;
      let closestIndex = 0;
      let minDistance = Infinity;

      cardRefs.current.forEach((card, index) => {
        if (!card) return;
        const cardCenter = card.offsetLeft + card.clientWidth / 2;
        const distance = Math.abs(containerCenter - cardCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIndex = index;
        }
      });

      setCurrent(closestIndex);
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateCurrent);
        ticking = true;
      }
    };

    updateCurrent();
    container.addEventListener('scroll', onScroll, { passive: true });
    
    const resizeObserver = new ResizeObserver(() => {
      if (!ticking) {
        requestAnimationFrame(updateCurrent);
        ticking = true;
      }
    });
    resizeObserver.observe(container);

    return () => {
      container.removeEventListener('scroll', onScroll);
      resizeObserver.disconnect();
    };
  }, [isMobile]);

  const cards = [
    {
      content: <BeginningCard story={story} />,
    },
    {
      content: <SpecialDateCard story={story} />,
    },
    {
      content: <WordsCard story={story} />,
    },
  ];

  return (
    <section id="story" className="py-24 md:py-32 relative overflow-hidden">
      {/* Static gradient background - no animation for better performance */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-light/20 via-background to-champagne/20" />
      
      {/* Reduced number of floating orbs and simpler animations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb 
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/20 blur-3xl"
          delay={0}
          duration={20} // Slower = smoother
          shouldAnimate={shouldAnimate}
        />
        <FloatingOrb 
          className="absolute bottom-32 right-[15%] w-96 h-96 rounded-full bg-champagne/30 blur-3xl"
          delay={4}
          duration={24}
          shouldAnimate={shouldAnimate}
        />
        {/* Removed two orbs to reduce GPU load */}
      </div>
      
      {/* Subtle pattern overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={shouldAnimate ? { opacity: 0, y: 20 } : false}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="font-body text-primary tracking-[0.2em] uppercase text-sm">
            Our Journey Together
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-foreground">
            The Story of Us
          </h2>
        </motion.div>

        {isMobile ? (
          <div className="max-w-3xl mx-auto">
            <div
              ref={scrollRef}
              className="flex gap-8 overflow-x-auto snap-x snap-mandatory px-6 pb-8 hide-scrollbar"
              style={{ 
                scrollPaddingLeft: '1.5rem',
                scrollBehavior: 'smooth' // Native smooth scrolling
              }}
            >
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="snap-center shrink-0 w-full"
                  animate={shouldAnimate ? {
                    scale: current === index ? 1 : 0.92,
                    opacity: current === index ? 1 : 0.5,
                  } : undefined}
                  transition={{ duration: 0.3, ease: "easeOut" }} // Faster, smoother
                  style={{ willChange: 'transform, opacity' }}
                >
                  <InvitationView 
                    delay={0} // Remove staggered delay on mobile for instant response
                    isActive={current === index}
                    shouldAnimate={shouldAnimate}
                  >
                    {card.content}
                  </InvitationView>
                </motion.div>
              ))}
            </div>
            <CarouselDots count={3} current={current} />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12 lg:gap-16 max-w-7xl mx-auto">
            {cards.map((card, index) => (
              <InvitationView 
                key={index} 
                delay={index * 0.1} // Reduced stagger
                shouldAnimate={shouldAnimate}
              >
                {card.content}
              </InvitationView>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
};

export default StoryOverview;
