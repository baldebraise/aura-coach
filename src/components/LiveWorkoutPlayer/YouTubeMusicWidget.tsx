import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Music, ChevronDown, ChevronUp, Radio } from 'lucide-react';

interface WorkoutPlaylist {
  id: string;
  name: string;
  genre: string;
  videoId: string; // YouTube Video or embed ID for continuous gym workout mix
  duration: string;
}

const DEFAULT_PLAYLISTS: WorkoutPlaylist[] = [
  {
    id: 'hiphop-gym',
    name: 'Heavy Hip-Hop Gym Beast Mode',
    genre: 'Rap & Hip-Hop',
    videoId: 'kJQP7kiw5Fk', // Popular continuous gym mix
    duration: '1h 15m'
  },
  {
    id: 'cyber-synth',
    name: 'Cyberpunk & Synthwave Training',
    genre: 'Electronic / Synthwave',
    videoId: '4xDzrJKXOOY',
    duration: '1h 00m'
  },
  {
    id: 'hard-rock',
    name: 'High Intensity Hard Rock Motivation',
    genre: 'Rock & Metal',
    videoId: 'fJ9rUzIMcZQ',
    duration: '50m'
  },
  {
    id: 'lofi-recovery',
    name: 'Deep Focus & Flow Workout',
    genre: 'Lofi & Instrumental',
    videoId: 'jfKfPfyJRdk',
    duration: '1h 30m'
  }
];

export const YouTubeMusicWidget: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentPlaylist, setCurrentPlaylist] = useState<WorkoutPlaylist>(DEFAULT_PLAYLISTS[0]);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [customUrl, setCustomUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Switch to next playlist
  const handleNext = () => {
    const currentIndex = DEFAULT_PLAYLISTS.findIndex((p) => p.id === currentPlaylist.id);
    const nextIndex = (currentIndex + 1) % DEFAULT_PLAYLISTS.length;
    setCurrentPlaylist(DEFAULT_PLAYLISTS[nextIndex]);
    setIsPlaying(true);
  };

  const handlePrev = () => {
    const currentIndex = DEFAULT_PLAYLISTS.findIndex((p) => p.id === currentPlaylist.id);
    const prevIndex = (currentIndex - 1 + DEFAULT_PLAYLISTS.length) % DEFAULT_PLAYLISTS.length;
    setCurrentPlaylist(DEFAULT_PLAYLISTS[prevIndex]);
    setIsPlaying(true);
  };

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const loadCustomVideo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;
    
    // Extract YouTube ID if valid URL
    let extractedId = customUrl.trim();
    if (customUrl.includes('v=')) {
      extractedId = customUrl.split('v=')[1]?.split('&')[0] || extractedId;
    } else if (customUrl.includes('youtu.be/')) {
      extractedId = customUrl.split('youtu.be/')[1]?.split('?')[0] || extractedId;
    }

    if (extractedId) {
      setCurrentPlaylist({
        id: 'custom-' + Date.now(),
        name: 'Mix Personnel YouTube Music',
        genre: 'Playlist Personnalisée',
        videoId: extractedId,
        duration: 'En direct'
      });
      setIsPlaying(true);
      setCustomUrl('');
    }
  };

  return (
    <div className="w-full bg-zinc-950/95 border border-zinc-800 rounded-xl overflow-hidden backdrop-blur-md shadow-lg transition-all duration-300">
      {/* Hidden/Persistent IFrame when playing */}
      <div className="hidden">
        {isPlaying && (
          <iframe
            ref={iframeRef}
            width="200"
            height="200"
            src={`https://www.youtube.com/embed/${currentPlaylist.videoId}?autoplay=1&enablejsapi=1&playsinline=1`}
            title="YouTube Workout Music"
            allow="autoplay; encrypted-media"
          />
        )}
      </div>

      {/* Main Bar (Waze style) */}
      <div className="p-3 flex items-center justify-between gap-3">
        {/* Left: Music Icon + Track Info */}
        <div 
          onClick={() => setIsExpanded(!isExpanded)} 
          className="flex items-center gap-3 flex-1 min-w-0 cursor-pointer"
        >
          <div className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 text-emerald-400">
            {isPlaying ? (
              <Radio className="w-5 h-5 animate-pulse text-emerald-400" />
            ) : (
              <Music className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-mono text-zinc-500 tracking-wider">
                YouTube Music
              </span>
              {isPlaying && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>
            <p className="text-xs font-medium text-zinc-100 truncate">
              {currentPlaylist.name}
            </p>
            <p className="text-[11px] text-zinc-500 truncate">
              {currentPlaylist.genre} • {currentPlaylist.duration}
            </p>
          </div>
        </div>

        {/* Center/Right: Audio Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 active:bg-zinc-800 transition"
            aria-label="Morceau précédent"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className={`p-2 rounded-xl transition flex items-center justify-center ${
              isPlaying
                ? 'bg-emerald-500 text-zinc-950 font-bold hover:bg-emerald-400'
                : 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700'
            }`}
            aria-label={isPlaying ? 'Pause' : 'Lecture'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
          </button>

          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 active:bg-zinc-800 transition"
            aria-label="Morceau suivant"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-zinc-500 hover:text-zinc-300 ml-1"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expandable Playlist Selector */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 border-t border-zinc-900 bg-zinc-900/60">
          <p className="text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-2">
            Playlists de Séance Disponibles
          </p>
          <div className="grid grid-cols-1 gap-1.5 max-h-44 overflow-y-auto pr-1">
            {DEFAULT_PLAYLISTS.map((playlist) => {
              const isSelected = playlist.id === currentPlaylist.id;
              return (
                <button
                  key={playlist.id}
                  onClick={() => {
                    setCurrentPlaylist(playlist);
                    setIsPlaying(true);
                  }}
                  className={`flex items-center justify-between p-2 rounded-lg text-left transition text-xs ${
                    isSelected
                      ? 'bg-emerald-950/60 border border-emerald-800/80 text-emerald-200'
                      : 'bg-zinc-950/60 hover:bg-zinc-800/60 text-zinc-300 border border-zinc-800/40'
                  }`}
                >
                  <div className="truncate mr-2">
                    <span className="font-medium">{playlist.name}</span>
                    <span className="text-[10px] text-zinc-500 block">{playlist.genre}</span>
                  </div>
                  <span className="text-[10px] text-zinc-500 font-mono shrink-0">
                    {playlist.duration}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Custom Link input */}
          <form onSubmit={loadCustomVideo} className="mt-2.5 flex gap-2">
            <input
              type="text"
              placeholder="Coller un lien ou ID YouTube..."
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}
              className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition"
            >
              Charger
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
