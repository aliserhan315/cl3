import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

interface AudioPlayerProps {
  songTitle: string;
  songUrl: string; // mp3 url OR YouTube url
}

/** Detect youtube links (youtube.com / youtu.be) */
const isYouTubeUrl = (url: string) => {
  try {
    const u = new URL(url);
    const h = u.hostname.replace("www.", "");
    return h === "youtube.com" || h === "m.youtube.com" || h === "youtu.be";
  } catch {
    return false;
  }
};

/** Extract YouTube video id from common url formats */
const getYouTubeVideoId = (url: string) => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    if (host === "youtu.be") {
      return u.pathname.replace("/", "").split("?")[0].split("&")[0];
    }

    if (u.pathname === "/watch") {
      return (u.searchParams.get("v") || "").trim();
    }

    if (u.pathname.startsWith("/embed/")) {
      return (u.pathname.split("/embed/")[1] || "").split("?")[0].split("&")[0];
    }

    if (u.pathname.startsWith("/shorts/")) {
      return (u.pathname.split("/shorts/")[1] || "").split("?")[0].split("&")[0];
    }

    return "";
  } catch {
    return "";
  }
};

const AudioPlayer = ({ songTitle, songUrl }: AudioPlayerProps) => {
  const isYT = useMemo(() => isYouTubeUrl(songUrl), [songUrl]);
  const ytId = useMemo(() => (isYT ? getYouTubeVideoId(songUrl) : ""), [isYT, songUrl]);

  // UI state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [audioSrc, setAudioSrc] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Audio ref (works for both MP3 and YouTube audio)
  const audioRef = useRef<HTMLAudioElement>(null);

  // Extract audio URL from YouTube video
  useEffect(() => {
    if (!isYT || !ytId) {
      setAudioSrc(songUrl);
      return;
    }

    const fetchYouTubeAudio = async () => {
      setIsLoading(true);
      setError("");

      try {
        // Using a CORS-friendly YouTube audio extraction service
        // Option 1: Use inv.nadeko.net (Invidious instance) - lightweight and fast
        const invidiousUrl = `https://inv.nadeko.net/api/v1/videos/${ytId}`;
        
        const response = await fetch(invidiousUrl);
        if (!response.ok) throw new Error("Failed to fetch audio");

        const data = await response.json();
        
        // Find the best audio-only format
        const audioFormats = data.adaptiveFormats?.filter(
          (f: any) => f.type?.startsWith("audio/")
        ) || [];

        if (audioFormats.length === 0) {
          throw new Error("No audio format found");
        }

        // Prefer opus or webm audio, fallback to mp4
        const bestAudio = audioFormats.find((f: any) => f.type?.includes("opus")) ||
                         audioFormats.find((f: any) => f.type?.includes("webm")) ||
                         audioFormats[0];

        setAudioSrc(bestAudio.url);
        setIsLoading(false);
      } catch (err) {
        console.error("YouTube audio extraction failed:", err);
        setError("Failed to load audio from YouTube");
        setIsLoading(false);
        
        // Fallback: try alternative method using youtube-nocookie embed
        // This won't extract audio but will show an error to the user
        setAudioSrc("");
      }
    };

    fetchYouTubeAudio();
  }, [isYT, ytId, songUrl]);

  // Autoplay logic
  useEffect(() => {
    if (!audioSrc) return;

    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.3;

    const startAudio = async () => {
      try {
        audio.muted = false;
        await audio.play();
        setIsPlaying(true);
        setIsMuted(false);
      } catch {
        try {
          audio.muted = true;
          await audio.play();
          setIsPlaying(true);
          setIsMuted(true);
        } catch {
          setIsPlaying(false);
          setIsMuted(true);
        }
      }
    };

    startAudio();
  }, [audioSrc]);

  // Visibility timer
  useEffect(() => {
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

      audio.muted = false;
      setIsMuted(false);
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && !isPlaying) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
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

        @keyframes spin {
          to { transform: rotate(360deg); }
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

        .spin-animation {
          animation: spin 1s linear infinite;
        }
      `}</style>

      {/* Single audio element for both MP3 and YouTube audio */}
      {audioSrc && (
        <audio ref={audioRef} loop preload="auto">
          <source src={audioSrc} type="audio/mpeg" />
          <source src={audioSrc} type="audio/webm" />
          <source src={audioSrc} type="audio/mp4" />
        </audio>
      )}

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
            disabled={isLoading || !!error}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full spin-animation" />
            ) : (
              <Music size={18} className={isPlaying ? "pulse-animation" : ""} />
            )}
          </button>

          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">
              {isLoading ? "Loading..." : error ? "Error" : "Now Playing"}
            </p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {error || songTitle}
            </p>
          </div>

          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 btn-hover"
            aria-label={isMuted ? "Unmute" : "Mute"}
            disabled={isLoading || !!error}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
