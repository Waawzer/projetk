'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX, FiMusic, FiHeart, FiX } from 'react-icons/fi';
import { TrackDTO } from '@/types/track';

interface AudioPlayerProps {
  tracks: TrackDTO[];
  initialTrackIndex: number;
  onClose: () => void;
}

const AudioPlayer = ({ tracks, initialTrackIndex, onClose }: AudioPlayerProps) => {
  const [currentTrackIndex, setCurrentTrackIndex] = useState(initialTrackIndex);
  const [isPlaying, setIsPlaying] = useState(true);
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
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-background/95 via-card/95 to-background/95 backdrop-blur-md border-t border-white/5 p-4">
      <div className="max-w-7xl mx-auto flex items-center gap-4">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors p-2"
          aria-label="Fermer le lecteur"
        >
          <FiX size={20} />
        </button>

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
            className="bg-white/5 hover:bg-white/10 text-white rounded-full w-10 h-10 flex items-center justify-center transition-all duration-300"
          >
            {isPlaying ? <FiPause size={18} /> : <FiPlay size={18} className="translate-x-[1px]" />}
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