import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX, Music } from "lucide-react";

interface AudioPlayerProps {
  songTitle: string;
  songUrl: string; // mp3 url OR YouTube url
}

const YT_SCRIPT_ID = "yt-iframe-api";
let ytScriptPromise: Promise<void> | null = null;

const isYouTubeUrl = (url: string) => {
  try {
    const u = new URL(url);
    const h = u.hostname.replace("www.", "");
    return h === "youtube.com" || h === "m.youtube.com" || h === "youtu.be";
  } catch {
    return false;
  }
};

const getYouTubeVideoId = (url: string) => {
  try {
    const u = new URL(url);
    const host = u.hostname.replace("www.", "");

    if (host === "youtu.be") return u.pathname.replace("/", "").split(/[?&/]/)[0];
    if (u.pathname === "/watch") return (u.searchParams.get("v") || "").trim();
    if (u.pathname.startsWith("/embed/")) return (u.pathname.split("/embed/")[1] || "").split(/[?&/]/)[0];
    if (u.pathname.startsWith("/shorts/")) return (u.pathname.split("/shorts/")[1] || "").split(/[?&/]/)[0];

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

/** Load YT script once, shared across renders */
const loadYouTubeAPI = () => {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytScriptPromise) return ytScriptPromise;

  ytScriptPromise = new Promise<void>((resolve) => {
    // if tag already exists (e.g. Next dev fast refresh)
    const existing = document.getElementById(YT_SCRIPT_ID);
    if (existing) {
      const check = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(check);
          resolve();
        }
      }, 20);
      return;
    }

    const tag = document.createElement("script");
    tag.id = YT_SCRIPT_ID;
    tag.src = "https://www.youtube.com/iframe_api";
    tag.async = true;
    document.head.appendChild(tag);

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
  });

  return ytScriptPromise;
};

const AudioPlayer = ({ songTitle, songUrl }: AudioPlayerProps) => {
  const isYT = useMemo(() => isYouTubeUrl(songUrl), [songUrl]);
  const ytId = useMemo(() => (isYT ? getYouTubeVideoId(songUrl) : ""), [isYT, songUrl]);

  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const audioRef = useRef<HTMLAudioElement>(null);

  const ytPlayerRef = useRef<any>(null);
  const ytContainerIdRef = useRef(`yt-audio-${Math.random().toString(16).slice(2)}`);

  // ✅ preload YT asap (even before player creation)
  useEffect(() => {
    if (isYT) loadYouTubeAPI();
  }, [isYT]);

  // MP3 autoplay
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

  // YouTube player (fast path)
  useEffect(() => {
    if (!isYT) return;

    // show UI faster (doesn't affect audio)
    const uiTimer = setTimeout(() => setIsVisible(true), 300);

    const setup = async () => {
      if (!ytId) {
        setIsPlaying(false);
        setIsMuted(true);
        return;
      }

      await loadYouTubeAPI();

      // destroy old
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerIdRef.current, {
        videoId: ytId,
        playerVars: {
          autoplay: 1,
          controls: 0,
          rel: 0,
          playsinline: 1,
          loop: 1,
          playlist: ytId,
          // ✅ "start" can also help skip initial black frame for some vids
          // start: 0,
        },
        events: {
          onReady: (e: any) => {
            const p = e.target;

            // volume like mp3
            try {
              p.setVolume(30);
            } catch {}

            // try unmuted autoplay first, fallback to muted autoplay
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
            if (e.data === 1) setIsPlaying(true);
            if (e.data === 2) setIsPlaying(false);
            if (e.data === 0) setIsPlaying(false);
          },
        },
      });
    };

    setup();

    return () => {
      clearTimeout(uiTimer);
      if (ytPlayerRef.current?.destroy) {
        try {
          ytPlayerRef.current.destroy();
        } catch {}
        ytPlayerRef.current = null;
      }
    };
  }, [isYT, ytId]);

  // UI visibility for mp3 (fast)
  useEffect(() => {
    if (isYT) return;
    const t = setTimeout(() => setIsVisible(true), 300);
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
          p.unMute();
          setIsMuted(false);
          p.playVideo();
          setIsPlaying(true);
        }
      } catch {}
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
      } catch {}
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;

    const nextMuted = !isMuted;
    audio.muted = nextMuted;
    setIsMuted(nextMuted);

    if (!nextMuted && !isPlaying) {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px);} to { opacity: 1; transform: translateY(0);} }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }
        .fade-in-up { animation: fadeInUp 0.35s ease-out forwards; }
        .glass-card { background: rgba(255,255,255,.1); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,.2); box-shadow: 0 8px 32px rgba(0,0,0,.1); }
        .btn-hover { transition: transform .2s ease; }
        .btn-hover:hover { transform: scale(1.1); }
        .btn-hover:active { transform: scale(.95); }
        .pulse-animation { animation: pulse 2s cubic-bezier(.4,0,.6,1) infinite; }
        .yt-hidden { position: fixed; width: 1px; height: 1px; left: -9999px; top: -9999px; opacity: 0; pointer-events: none; }
      `}</style>

      {!isYT && (
        <audio ref={audioRef} loop preload="auto">
          <source src={songUrl} type="audio/mpeg" />
        </audio>
      )}

      {isYT && <div id={ytContainerIdRef.current} className="yt-hidden" />}

      <div className={`fixed bottom-6 right-6 z-50 ${isVisible ? "fade-in-up" : "opacity-0"}`}>
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
