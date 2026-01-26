import { useRef, useState, useEffect } from 'react';
import { Sparkles, Calendar, Quote } from 'lucide-react';

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
}) => {
  const style = shouldAnimate ? {
    animation: `float ${duration}s ease-in-out ${delay}s infinite`
  } : { opacity: 0.2 };

  return <div className={className} style={style} />;
};

const GlassCard = ({ 
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
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (!shouldAnimate || !ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
        }
      },
      { rootMargin: '-100px' }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldAnimate]);

  return (
    <div
      ref={ref}
      className={`
        relative rounded-2xl p-8 md:p-10 h-full overflow-hidden
        border border-white/20
        backdrop-blur-3xl
        transition-all duration-500
        ${isActive ? 'shadow-[0_12px_50px_rgba(255,255,255,0.18),0_0_90px_rgba(255,182,193,0.2)]' : 'shadow-[0_12px_36px_rgba(0,0,0,0.08)]'}
        hover:shadow-[0_18px_60px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.35)]
        hover:border-white/25 hover:-translate-y-1
      `}
      style={{
        background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.08) 100%)',
        opacity: shouldAnimate && !isInView ? 0 : 1,
        transform: shouldAnimate && !isInView ? 'translateY(40px) scale(0.95)' : 'translateY(0) scale(1)',
        transition: `all 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${delay}s`
      }}
    >
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 30%, transparent 60%)',
        }}
      />
      <div className="absolute inset-2 rounded-[1rem] border border-white/15 bg-white/8 pointer-events-none opacity-70" />
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      <div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: 'linear-gradient(110deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)',
          animation: 'shine 4s ease-in-out infinite',
          animationDelay: `${delay}s`
        }}
      />
      {isActive && (
        <div 
          className="absolute inset-0 rounded-2xl pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(236, 72, 153, 0.25), transparent 60%)',
          }}
        />
      )}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

const BeginningCard = ({ story }: { story: StoryData }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm">
      <Sparkles className="w-6 h-6 text-primary" />
    </div>
    <div>
      <h3 className="font-display text-xl text-foreground">{story.beginning.title}</h3>
      <p className="font-body text-sm text-muted-foreground">{story.beginning.subtitle}</p>
    </div>
  </div>
);

const SpecialDateCard = ({ story }: { story: StoryData }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm">
      <Calendar className="w-6 h-6 text-primary" />
    </div>
    <div>
      <h3 className="font-display text-xl text-foreground">{story.specialDate.title}</h3>
      <p className="font-body text-sm text-primary font-medium">{story.specialDate.date}</p>
    </div>
  </div>
);

const WordsCard = ({ story }: { story: StoryData }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center backdrop-blur-sm">
      <Quote className="w-6 h-6 text-primary" />
    </div>
    <h3 className="font-display text-xl text-foreground">{story.words.title}</h3>
  </div>
);

const CarouselDots = ({ 
  count, 
  current 
}: { 
  count: number; 
  current: number;
}) => (
  <div className="flex justify-center gap-2 mt-6">
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className="h-2 rounded-full bg-primary transition-all duration-300"
        style={{
          width: index === current ? '24px' : '8px',
          opacity: index === current ? 1 : 0.4
        }}
      />
    ))}
  </div>
);

const StoryOverview = ({ story }: StoryOverviewProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const shouldAnimate = true;
  const [current, setCurrent] = useState(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const cards = [
    {
      header: <BeginningCard story={story} />,
      content: (
        <p className="font-body text-lg leading-relaxed text-muted-foreground">
          {story.beginning.text}
        </p>
      ),
    },
    {
      header: <SpecialDateCard story={story} />,
      content: (
        <p className="font-body text-lg leading-relaxed text-muted-foreground">
          {story.specialDate.text}
        </p>
      ),
    },
    {
      header: <WordsCard story={story} />,
      content: (
        <>
          <blockquote className="font-accent text-xl italic leading-relaxed text-foreground mb-4">
            "{story.words.quote}"
          </blockquote>
          <p className="font-body text-sm text-primary text-right">— {story.words.author}</p>
        </>
      ),
    },
  ];

  return (
    <section id="story" className="py-24 md:py-32 relative overflow-hidden">
      <style>{`
        @keyframes float {
          0%, 100% {
            opacity: 0.15;
            transform: translate(0, 0) scale(1);
          }
          33% {
            opacity: 0.25;
            transform: translate(30px, -40px) scale(1.1);
          }
          66% {
            opacity: 0.15;
            transform: translate(-20px, 20px) scale(0.95);
          }
        }
        @keyframes shine {
          0% {
            transform: translateX(-150%) skewX(-20deg);
          }
          100% {
            transform: translateX(250%) skewX(-20deg);
          }
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="absolute inset-0 bg-gradient-to-br from-rose-light/20 via-background to-champagne/20" />
      
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
      
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, hsl(var(--primary)) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <span className="font-body text-primary tracking-[0.2em] uppercase text-sm">
            Our Journey Together
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-foreground">
            The Story of Us
          </h2>
        </div>

        {isMobile ? (
          <div className="max-w-md mx-auto">
            <div
              ref={scrollRef}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory px-2 pb-6 hide-scrollbar"
            >
              {cards.map((card, index) => (
                <div
                  key={index}
                  ref={(el) => {
                    cardRefs.current[index] = el;
                  }}
                  className="snap-center shrink-0 w-[85%] sm:w-[70%]"
                  style={{
                    transform: current === index ? 'scale(1)' : 'scale(0.95)',
                    opacity: current === index ? 1 : 0.7,
                    transition: 'transform 0.3s ease, opacity 0.3s ease'
                  }}
                >
                  <GlassCard 
                    delay={index * 0.1} 
                    isActive={current === index}
                    shouldAnimate={shouldAnimate}
                  >
                    {card.header}
                    {card.content}
                  </GlassCard>
                </div>
              ))}
            </div>
            <CarouselDots count={3} current={current} />
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {cards.map((card, index) => (
              <GlassCard key={index} delay={index * 0.15} shouldAnimate={shouldAnimate}>
                {card.header}
                {card.content}
              </GlassCard>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StoryOverview;