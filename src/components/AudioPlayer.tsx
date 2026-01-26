import { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

interface AudioPlayerProps {
  songTitle: string;
  songUrl: string;
}

const AudioPlayer = ({ songTitle, songUrl }: AudioPlayerProps) => {
  // Start as "trying to play + unmuted" on mount
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;

    const startAudio = async () => {
      try {
        // Try autoplay with sound
        audio.muted = false;
        await audio.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch {
        // Autoplay with sound blocked -> fallback to muted autoplay
        try {
          audio.muted = true;
          await audio.play();
          setIsPlaying(true);
          setIsMuted(true);
        } catch {
          // Autoplay fully blocked
          setIsPlaying(false);
          setIsMuted(true);
        }
      }
    };

    startAudio();
    const t = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
        return;
      }

      // When user clicks play, we can safely unmute (gesture)
      audio.muted = false;
      setIsMuted(false);
      await audio.play();
      setIsPlaying(true);
    } catch {
      // If it fails, keep state consistent
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    // If user unmutes and audio was paused, try to play (gesture)
    if (!nextMuted && !isPlaying) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          /* ignore */
        });
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }

        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
        }

        .btn-hover { transition: transform 0.2s ease; }
        .btn-hover:hover { transform: scale(1.1); }
        .btn-hover:active { transform: scale(0.95); }

        .pulse-animation {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      <audio ref={audioRef} loop preload="auto">
        <source src={songUrl} type="audio/mpeg" />
      </audio>

      <div
        className={`fixed bottom-6 right-6 z-50 ${
          isVisible ? "fade-in-up" : "opacity-0"
        }`}
      >
        <div className="glass-card rounded-full p-3 flex items-center gap-3">
          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white btn-hover"
            aria-label={isPlaying ? "Pause music" : "Play music"}
          >
            <Music size={18} className={isPlaying ? "pulse-animation" : ""} />
          </button>

          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Now Playing</p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {songTitle}
            </p>
          </div>

          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 btn-hover"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
