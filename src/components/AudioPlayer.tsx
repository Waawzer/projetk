'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiMusic, FiHeart } from 'react-icons/fi';

interface Track {
  id: string;
  title: string;
  artist: string;
  coverImage: string;
  audioUrl: string;
  duration: number;
}

interface AudioPlayerProps {
  tracks: Track[];
}

const AudioPlayer = ({ tracks }: AudioPlayerProps) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isLiked, setIsLiked] = useState<boolean[]>(new Array(tracks.length).fill(false));

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [showPlaylist, setShowPlaylist] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    if (audioRef.current) {
      setProgress(0);
      setCurrentTime(0);
      
      if (isPlaying) {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
          setIsPlaying(false);
        });
      }
    }
  }, [currentTrackIndex, isPlaying]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(error => {
          console.error('Error playing audio:', error);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handlePrevious = () => {
    setCurrentTrackIndex(prev => 
      prev === 0 ? tracks.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setCurrentTrackIndex(prev => 
      prev === tracks.length - 1 ? 0 : prev + 1
    );
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const duration = audioRef.current.duration;
      
      setCurrentTime(current);
      setDuration(duration);
      setProgress((current / duration) * 100);
    }
  };

  const handleProgressChange = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressBarRef.current && audioRef.current) {
      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const width = rect.width;
      const clickX = e.clientX - rect.left;
      
      const percentage = (clickX / width) * 100;
      setProgress(percentage);
      
      const newTime = (percentage / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      
      if (newMuteState) {
        audioRef.current.volume = 0;
      } else {
        audioRef.current.volume = volume;
      }
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleLike = (index: number) => {
    const newLiked = [...isLiked];
    newLiked[index] = !newLiked[index];
    setIsLiked(newLiked);
  };

  const playTrack = (index: number) => {
    if (currentTrackIndex === index) {
      togglePlayPause();
    } else {
      setCurrentTrackIndex(index);
      setIsPlaying(true);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8">
      {/* Grid of Tracks */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {tracks.map((track, index) => (
          <div key={track.id} className="group relative aspect-square">
            {/* Track Cover */}
            <div className="relative w-full h-full rounded-xl overflow-hidden">
              <Image
                src={track.coverImage}
                alt={`${track.title} by ${track.artist}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <button
                    onClick={() => playTrack(index)}
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white rounded-full w-16 h-16 flex items-center justify-center transition-all duration-300 transform hover:scale-110 mb-4"
                  >
                    {isPlaying && currentTrackIndex === index ? (
                      <FiPause size={24} />
                    ) : (
                      <FiPlay size={24} className="ml-1" />
                    )}
                  </button>
                  <h3 className="text-white font-bold text-center line-clamp-1">{track.title}</h3>
                  <p className="text-gray-300 text-sm text-center line-clamp-1">{track.artist}</p>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(index);
                    }}
                    className={`mt-2 transition-colors duration-200 ${
                      isLiked[index] ? 'text-red-500' : 'text-white hover:text-red-500'
                    }`}
                  >
                    <FiHeart size={20} className={isLiked[index] ? 'fill-current' : ''} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mini Player */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-background/95 via-card/95 to-background/95 backdrop-blur-md border-t border-white/5 p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          {/* Current Track Info */}
          <div className="flex items-center gap-3 flex-1">
            <div className="relative w-12 h-12 rounded-lg overflow-hidden">
              <Image
                src={currentTrack.coverImage}
                alt={currentTrack.title}
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h4 className="font-medium text-white line-clamp-1">{currentTrack.title}</h4>
              <p className="text-sm text-gray-400">{currentTrack.artist}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevious}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiSkipBack size={20} />
            </button>
            
            <button
              onClick={togglePlayPause}
              className="bg-primary hover:bg-primary-hover text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
            >
              {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="ml-1" />}
            </button>
            
            <button
              onClick={handleNext}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FiSkipForward size={20} />
            </button>
          </div>

          {/* Progress and Volume */}
          <div className="flex items-center gap-4 flex-1 justify-end">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <div 
                ref={progressBarRef}
                className="w-32 h-1 bg-gray-700/50 rounded-full cursor-pointer"
                onClick={handleProgressChange}
              >
                <div 
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={toggleMute} className="text-gray-400 hover:text-white">
                {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-20 accent-primary"
              />
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
      />
    </div>
  );
};

export default AudioPlayer; 