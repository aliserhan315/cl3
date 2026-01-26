import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Chapter {
  id: number;
  title: string;
  image: string;
  story: string;
}

interface ChapterModalProps {
  chapter: Chapter | null;
  isOpen: boolean;
  onClose: () => void;
}

const ChapterModal = ({ chapter, isOpen, onClose }: ChapterModalProps) => {
  if (!chapter) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 
                       md:max-w-3xl md:w-full md:max-h-[90vh] 
                       bg-card rounded-3xl overflow-hidden shadow-2xl z-50"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm 
                         flex items-center justify-center text-foreground hover:bg-background transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col md:flex-row h-full max-h-[calc(100vh-2rem)] md:max-h-[80vh]">
              {/* Image */}
              <div className="md:w-1/2 h-64 md:h-auto relative overflow-hidden">
                <motion.img
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6 }}
                  src={chapter.image}
                  alt={chapter.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card/50 to-transparent md:bg-gradient-to-r" />
              </div>

              {/* Content */}
              <div className="md:w-1/2 p-8 md:p-10 flex flex-col justify-center overflow-y-auto">
                <motion.span
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-body text-sm text-primary tracking-[0.2em] uppercase mb-2"
                >
                  Chapter {chapter.id}
                </motion.span>
                
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="font-display text-3xl md:text-4xl text-foreground mb-6"
                >
                  {chapter.title}
                </motion.h3>
                
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="font-body text-lg leading-relaxed text-muted-foreground"
                >
                  {chapter.story}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChapterModal;
