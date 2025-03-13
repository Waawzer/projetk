'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { FiPlay, FiPause, FiSkipForward, FiSkipBack, FiVolume2, FiVolumeX } from 'react-icons/fi';

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

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  const currentTrack = tracks[currentTrackIndex];

  useEffect(() => {
    // Reset player state when track changes
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

  return (
    <div className="w-full max-w-4xl mx-auto bg-card rounded-xl overflow-hidden shadow-2xl">
      <div className="flex flex-col md:flex-row">
        {/* Album Cover */}
        <div className="relative w-full md:w-1/3 aspect-square">
          <Image 
            src={currentTrack.coverImage} 
            alt={`${currentTrack.title} by ${currentTrack.artist}`}
            fill
            className="object-cover"
          />
        </div>
        
        {/* Player Controls */}
        <div className="w-full md:w-2/3 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{currentTrack.title}</h3>
            <p className="text-gray-400 mb-6">{currentTrack.artist}</p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div 
              ref={progressBarRef}
              className="h-2 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
              onClick={handleProgressChange}
            >
              <div 
                className="h-full bg-primary rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <button 
                onClick={handlePrevious}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Previous track"
              >
                <FiSkipBack size={20} />
              </button>
              
              <button 
                onClick={togglePlayPause}
                className="bg-primary hover:bg-primary-hover text-white rounded-full w-12 h-12 flex items-center justify-center transition-colors"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} className="ml-1" />}
              </button>
              
              <button 
                onClick={handleNext}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Next track"
              >
                <FiSkipForward size={20} />
              </button>
            </div>
            
            {/* Volume Control */}
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMute}
                className="text-gray-400 hover:text-white transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
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
                aria-label="Volume"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Track List */}
      <div className="bg-card-hover p-4">
        <h4 className="text-sm font-medium text-gray-400 mb-2">Playlist</h4>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {tracks.map((track, index) => (
            <div 
              key={track.id}
              className={`flex items-center p-2 rounded-md cursor-pointer transition-colors ${
                currentTrackIndex === index 
                  ? 'bg-primary/20 text-primary' 
                  : 'hover:bg-card text-gray-300'
              }`}
              onClick={() => setCurrentTrackIndex(index)}
            >
              <div className="relative w-10 h-10 mr-3 flex-shrink-0">
                <Image 
                  src={track.coverImage} 
                  alt={track.title}
                  fill
                  className="object-cover rounded"
                />
              </div>
              <div className="flex-grow">
                <p className="text-sm font-medium">{track.title}</p>
                <p className="text-xs text-gray-500">{track.artist}</p>
              </div>
              <span className="text-xs text-gray-500">{formatTime(track.duration)}</span>
            </div>
          ))}
        </div>
      </div>
      
      <audio 
        ref={audioRef}
        src={currentTrack.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onLoadedMetadata={handleTimeUpdate}
        className="hidden"
      />
    </div>
  );
};

export default AudioPlayer; 