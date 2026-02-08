import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import ChapterModal from "./ChapterModal";
import chapter1 from "@/assets/chapter1.mp4";
import chapter2 from "@/assets/chapter2.jpg";
import chapter3 from "@/assets/chapter3.jpg";
import chapter4 from "@/assets/chapter4.jpg";
import chapter5 from "@/assets/chapter5.jpg";

interface Chapter {
  id: number;
  title: string;
  image: string; // can be image OR video url
  story: string;
}

interface ChaptersSectionProps {
  chapters: Chapter[];
}

const chapterMedia: Record<number, string> = {
  1: chapter1,
  2: chapter2,
  3: chapter3,
  4: chapter4,
  5: chapter5,
};

const isVideo = (src: string) => {
  const clean = src.split("?")[0].toLowerCase();
  return clean.endsWith(".mp4") || clean.endsWith(".webm") || clean.endsWith(".mov");
};

const ChapterCard = ({
  chapter,
  index,
  onClick,
}: {
  chapter: Chapter;
  index: number;
  onClick: () => void;
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const mediaSrc = chapterMedia[chapter.id] || chapter.image;
  const video = isVideo(mediaSrc);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay: index * 0.15 }}
      onClick={onClick}
      className="group cursor-pointer"
    >
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden romantic-shadow">
        {video ? (
          <video
            src={mediaSrc}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            muted
            playsInline
            preload="metadata"
            // optional: show a moving preview
            autoPlay
            loop
          />
        ) : (
          <img
            src={mediaSrc}
            alt={chapter.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            loading="lazy"
          />
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent
                        opacity-60 group-hover:opacity-80 transition-opacity duration-300"
        />

        {/* Content */}
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={isInView ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{ delay: 0.3 + index * 0.15 }}
          >
            <span className="text-primary-foreground/70 font-body text-sm tracking-widest uppercase">
              Chapter {chapter.id}
            </span>

            <h3
              className="font-display text-2xl md:text-3xl text-primary-foreground mt-2
                           group-hover:text-rose-light transition-colors duration-300"
            >
              {chapter.title}
            </h3>

            <motion.div
              className="mt-4 flex items-center gap-2 text-primary-foreground/80"
              initial={{ x: 0 }}
              whileHover={{ x: 5 }}
            >
              <span className="font-body text-sm">{video ? "Watch the moment" : "Read the story"}</span>
              <svg
                className="w-4 h-4 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          </motion.div>
        </div>

        {/* Decorative border on hover */}
        <div
          className="absolute inset-0 border-2 border-primary/0 rounded-2xl
                        group-hover:border-primary/30 transition-colors duration-300"
        />
      </div>
    </motion.div>
  );
};

const ChaptersSection = ({ chapters }: ChaptersSectionProps) => {
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);

  return (
    <section className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="font-body text-primary tracking-[0.2em] uppercase text-sm">
            Moments to Remember
          </span>
          <h2 className="font-display text-4xl md:text-5xl mt-4 text-foreground">
            Our Chapters
          </h2>
          <p className="font-body text-lg text-muted-foreground mt-4 max-w-2xl mx-auto">
            Click to discover the memories behind each moment.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8 max-w-6xl mx-auto">
          {chapters.map((chapter, index) => (
            <ChapterCard
              key={chapter.id}
              chapter={chapter}
              index={index}
              onClick={() =>
                setSelectedChapter({
                  ...chapter,
                  image: chapterMedia[chapter.id] || chapter.image, // could be mp4
                })
              }
            />
          ))}
        </div>
      </div>

      <ChapterModal
        chapter={selectedChapter}
        isOpen={!!selectedChapter}
        onClose={() => setSelectedChapter(null)}
      />
    </section>
  );
};

export default ChaptersSection;
