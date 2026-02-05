import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

interface AudioPlayerProps {
  songTitle: string;
  songUrl: string; // can be mp3 url OR YouTube url
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

/** Convert YouTube watch/embed/short/youtu.be -> embed URL */
const toYouTubeEmbedUrl = (url: string) => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    let videoId = "";

    if (host === "youtu.be") {
      videoId = u.pathname.replace("/", "");
    } else if (u.pathname.startsWith("/watch")) {
      videoId = u.searchParams.get("v") || "";
    } else if (u.pathname.startsWith("/embed/")) {
      videoId = u.pathname.split("/embed/")[1] || "";
    } else if (u.pathname.startsWith("/shorts/")) {
      videoId = u.pathname.split("/shorts/")[1] || "";
    }

    // strip extra path fragments (e.g. /shorts/ID?...)
    videoId = videoId.split("?")[0].split("&")[0].split("/")[0];

    if (!videoId) return url;

    // Note:
    // - Autoplay with sound is usually blocked.
    // - Autoplay muted is more likely to work.
    // - loop for YT needs playlist=VIDEO_ID
    const params = new URLSearchParams({
      autoplay: "1",
      mute: "1",
      controls: "0",
      playsinline: "1",
      rel: "0",
      modestbranding: "1",
      loop: "1",
      playlist: videoId,
    });

    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  } catch {
    return url;
  }
};

const AudioPlayer = ({ songTitle, songUrl }: AudioPlayerProps) => {
  const isYT = useMemo(() => isYouTubeUrl(songUrl), [songUrl]);
  const ytEmbed = useMemo(() => (isYT ? toYouTubeEmbedUrl(songUrl) : ""), [isYT, songUrl]);

  // Start as "trying to play + unmuted" on mount (for audio files)
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // If YouTube: we can't control play/pause/mute reliably from an iframe without the YouTube IFrame API.
    // We'll treat the UI as a "simple hint": autoplay will be muted; user can open YT controls by clicking play.
    if (isYT) {
      setIsPlaying(true);
      setIsMuted(true); // embed starts muted
      const t = setTimeout(() => setIsVisible(true), 2000);
      return () => clearTimeout(t);
    }

    // Normal audio file behavior
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
  }, [isYT]);

  const togglePlay = async () => {
    // YouTube fallback: open the song in a new tab (best UX without the iframe API)
    if (isYT) {
      window.open(songUrl, "_blank", "noopener,noreferrer");
      return;
    }

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
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    // YouTube fallback: cannot reliably mute/unmute without YouTube IFrame API
    if (isYT) {
      // keep state toggling for UI only
      setIsMuted((m) => !m);
      return;
    }

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

        .yt-hidden {
          position: fixed;
          width: 1px;
          height: 1px;
          left: -9999px;
          top: -9999px;
          opacity: 0;
          pointer-events: none;
        }
      `}</style>

      {/* If YouTube URL: embed a muted autoplay loop (works only if browser allows) */}
      {isYT ? (
        <iframe
          className="yt-hidden"
          src={ytEmbed}
          title="YouTube audio"
          allow="autoplay; encrypted-media"
        />
      ) : (
        <audio ref={audioRef} loop preload="auto">
          <source src={songUrl} type="audio/mpeg" />
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
            title={isYT ? "Open YouTube" : undefined}
          >
            <Music size={18} className={isPlaying ? "pulse-animation" : ""} />
          </button>

          <div className="hidden sm:block">
            <p className="text-xs text-gray-400">Now Playing</p>
            <p className="text-sm text-gray-900 dark:text-gray-100">
              {songTitle}
            </p>
            {isYT && (
              <p className="text-[10px] text-gray-400">YouTube link</p>
            )}
          </div>

          <button
            onClick={toggleMute}
            className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-900 dark:text-gray-100 btn-hover"
            aria-label={isMuted ? "Unmute" : "Mute"}
            title={isYT ? "Mute toggle is limited for YouTube" : undefined}
          >
            {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default AudioPlayer;
