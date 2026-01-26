import HeroSection from '@/components/HeroSection';
import StoryOverview from '@/components/StoryOverview';
import ChaptersSection from '@/components/ChaptersSection';
import FinaleSection from '@/components/FinaleSection';
import FloatingHearts from '@/components/FloatingHearts';
import AudioPlayer from '@/components/AudioPlayer';
import data from '@/data/data.json';

const Index = () => {
  return (
    <div className="relative bg-background overflow-x-hidden">
      {/* Floating hearts decoration */}
      <FloatingHearts />
      
      {/* Audio player */}
      <AudioPlayer songTitle={data.song.title}  songUrl={data.song.url} />

      {/* Hero Section */}
      <HeroSection 
        name1={data.couple.name1} 
        name2={data.couple.name2} 
      />

      {/* Story Overview - 3 cards */}
      <StoryOverview story={data.storyOverview} />

      {/* Chapters Section - 4 image chapters */}
      <ChaptersSection chapters={data.chapters} />

      {/* Finale Section */}
      <FinaleSection 
        finale={data.finale} 
        coupleNames={data.couple}
      />
    </div>
  );
};

export default Index;
