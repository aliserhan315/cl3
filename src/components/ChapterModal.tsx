import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

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
          {/* Backdrop + Centered Container */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-foreground/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="
                relative
                w-full max-w-3xl
                bg-card rounded-3xl overflow-hidden shadow-2xl
                max-h-[96vh] md:max-h-[90vh]
              "
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm
                           flex items-center justify-center text-foreground hover:bg-background transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex flex-col h-full overflow-y-auto">
                {/* Image */}
                <div className="w-full h-[55vh] md:h-[50vh] relative overflow-hidden flex-shrink-0">
                  <motion.img
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6 }}
                    src={chapter.image}
                    alt={chapter.title}
                    className="w-full h-full object-cover md:object-contain md:bg-black/20"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-8 md:p-10 flex flex-col items-center text-center">
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
                    className="font-body text-lg leading-relaxed text-muted-foreground max-w-2xl"
                  >
                    {chapter.story}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChapterModal;
