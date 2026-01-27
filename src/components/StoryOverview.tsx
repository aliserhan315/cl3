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

// Animated floating orbs for background
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
      scale: [1, 1.1, 0.95, 1],
    } : { opacity: 0.2 }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
  />
);

// Full-screen invitation-style view
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
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const variants = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      ref={ref}
      initial={shouldAnimate ? "hidden" : false}
      animate={shouldAnimate && isInView ? "visible" : undefined}
      variants={shouldAnimate ? variants : undefined}
      transition={{ duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative h-full min-h-[500px] md:min-h-[600px] flex items-center justify-center py-12"
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
        transition={{ duration: 0.3 }}
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

  useEffect(() => {
    if (!isMobile) return;
    const container = scrollRef.current;
    if (!container) return;

    let frame = 0;
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
    };

    const onScroll = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(updateCurrent);
    };

    updateCurrent();
    container.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      container.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [isMobile]);

  // Simple views without individual backgrounds
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
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-rose-light/20 via-background to-champagne/20" />
      
      {/* Floating orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <FloatingOrb 
          className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-primary/20 blur-3xl"
          delay={0}
          duration={16}
          shouldAnimate={shouldAnimate}
        />
        <FloatingOrb 
          className="absolute bottom-32 right-[15%] w-96 h-96 rounded-full bg-champagne/30 blur-3xl"
          delay={2}
          duration={18}
          shouldAnimate={shouldAnimate}
        />
        <FloatingOrb 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-rose-light/15 blur-3xl"
          delay={4}
          duration={14}
          shouldAnimate={shouldAnimate}
        />
        <FloatingOrb 
          className="absolute top-[30%] right-[25%] w-48 h-48 rounded-full bg-blush/25 blur-2xl"
          delay={1}
          duration={12}
          shouldAnimate={shouldAnimate}
        />
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
          initial={shouldAnimate ? { opacity: 0, y: 30 } : false}
          whileInView={shouldAnimate ? { opacity: 1, y: 0 } : undefined}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
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
              style={{ scrollPaddingLeft: '1.5rem' }}
            >
              {cards.map((card, index) => (
                <motion.div
                  key={index}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="snap-center shrink-0 w-full"
                  animate={shouldAnimate ? {
                    scale: current === index ? 1 : 0.90,
                    opacity: current === index ? 1 : 0.4,
                  } : undefined}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <InvitationView 
                    delay={index * 0.1} 
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
                delay={index * 0.15} 
                shouldAnimate={shouldAnimate}
              >
                {card.content}
              </InvitationView>
            ))}
          </div>
        )}
      </div>

      {/* Add this to your global CSS to hide scrollbar */}
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
