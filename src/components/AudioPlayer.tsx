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

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

const AudioPlayer = ({ songTitle, songUrl }: AudioPlayerProps) => {
  const isYT = useMemo(() => isYouTubeUrl(songUrl), [songUrl]);
  const ytId = useMemo(() => (isYT ? getYouTubeVideoId(songUrl) : ""), [isYT, songUrl]);

  // UI state
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // MP3 audio ref
  const audioRef = useRef<HTMLAudioElement>(null);

  // YouTube player refs
  const ytPlayerRef = useRef<any>(null);
  const ytContainerIdRef = useRef(`yt-audio-${Math.random().toString(16).slice(2)}`);

  // --- MP3 autoplay (same logic you had) ---
  useEffect(() => {
    if (isYT) return;

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
  }, [isYT, songUrl]);

  // --- YouTube: load API + create hidden player ---
  useEffect(() => {
    if (!isYT) return;
    if (!ytId) {
      setIsPlaying(false);
      setIsMuted(true);
      return;
    }

    const showTimer = setTimeout(() => setIsVisible(true), 2000);

    const ensureScript = () =>
      new Promise<void>((resolve) => {
        // already loaded
        if (window.YT && window.YT.Player) return resolve();

        // already injected
        const existing = document.getElementById("yt-iframe-api");
        if (existing) {
          const check = setInterval(() => {
            if (window.YT && window.YT.Player) {
              clearInterval(check);
              resolve();
            }
          }, 50);
          return;
        }

        const tag = document.createElement("script");
        tag.id = "yt-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        document.body.appendChild(tag);

        const prev = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
          prev?.();
          resolve();
        };
      });

    const createPlayer = async () => {
      await ensureScript();

      // destroy old player if any
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          /* ignore */
        }
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerIdRef.current, {
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          loop: 1,
          playlist: ytId, // required for loop
        },
        events: {
          onReady: async (e: any) => {
            const p = e.target;

            // set volume similar to mp3 behavior (0-100)
            try {
              p.setVolume(30);
            } catch {}

            // Try autoplay with sound first, then fallback to muted
            try {
              p.unMute();
              setIsMuted(false);
              p.playVideo();
              setIsPlaying(true);
            } catch {
              try {
                p.mute();
                setIsMuted(true);
                p.playVideo();
                setIsPlaying(true);
              } catch {
                setIsPlaying(false);
                setIsMuted(true);
              }
            }
          },
          onStateChange: (e: any) => {
            // YT states: 1 playing, 2 paused, 0 ended
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2) setIsPlaying(false);
            if (e.data === 0) setIsPlaying(false);
          },
        },
      });
    };

    createPlayer();

    return () => {
      clearTimeout(showTimer);
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {
          /* ignore */
        }
        ytPlayerRef.current = null;
      }
    };
  }, [isYT, ytId]);

  // visibility timer for both cases
  useEffect(() => {
    if (isYT) return; // YT handled above
    const t = setTimeout(() => setIsVisible(true), 2000);
    return () => clearTimeout(t);
  }, [isYT]);

  const togglePlay = async () => {
    if (isYT) {
      const p = ytPlayerRef.current;
      if (!p) return;

      try {
        if (isPlaying) {
          p.pauseVideo();
          setIsPlaying(false);
        } else {
          // user gesture helps unmute policies
          p.unMute();
          setIsMuted(false);
          p.playVideo();
          setIsPlaying(true);
        }
      } catch {
        /* ignore */
      }
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

      audio.muted = false;
      setIsMuted(false);
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    if (isYT) {
      const p = ytPlayerRef.current;
      if (!p) return;

      try {
        if (isMuted) {
          p.unMute();
          setIsMuted(false);
        } else {
          p.mute();
          setIsMuted(true);
        }
      } catch {
        /* ignore */
      }
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

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

        /* hidden YouTube player container */
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

      {/* MP3 / direct audio */}
      {!isYT && (
        <audio ref={audioRef} loop preload="auto">
          <source src={songUrl} type="audio/mpeg" />
        </audio>
      )}

      {/* YouTube hidden player */}
      {isYT && <div id={ytContainerIdRef.current} className="yt-hidden" />}

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
            <p className="text-sm text-gray-900 dark:text-gray-100">{songTitle}</p>
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
