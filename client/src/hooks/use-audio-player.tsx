import { useState, useRef, useEffect, useCallback } from "react";
import { JamendoTrack, AudioPlayerState } from "@/types/music";

export function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    currentTrack: null,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isMuted: false,
    isLoading: false,
    queue: [],
    currentIndex: -1,
    isShuffled: false,
    repeatMode: 'off',
  });

  // Initialize audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'metadata';
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }));
    };

    const handleDurationChange = () => {
      setState(prev => ({ ...prev, duration: audio.duration || 0 }));
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleLoadStart = () => {
      setState(prev => ({ ...prev, isLoading: true }));
    };

    const handleCanPlay = () => {
      setState(prev => ({ ...prev, isLoading: false }));
    };

    const handleError = () => {
      setState(prev => ({ ...prev, isLoading: false, isPlaying: false }));
      console.error('Audio playback error');
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const playTrack = useCallback((track: JamendoTrack, queue: JamendoTrack[] = []) => {
    if (!audioRef.current) return;

    const audio = audioRef.current;
    const trackIndex = queue.findIndex(t => t.id === track.id);
    
    setState(prev => ({
      ...prev,
      currentTrack: track,
      queue: queue.length > 0 ? queue : [track],
      currentIndex: trackIndex >= 0 ? trackIndex : 0,
      isLoading: true,
    }));

    audio.src = track.audio;
    audio.load();
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setState(prev => ({ ...prev, isPlaying: true, isLoading: false }));
        })
        .catch(error => {
          console.error('Playback failed:', error);
          setState(prev => ({ ...prev, isPlaying: false, isLoading: false }));
        });
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !state.currentTrack) return;

    const audio = audioRef.current;
    
    if (state.isPlaying) {
      audio.pause();
      setState(prev => ({ ...prev, isPlaying: false }));
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setState(prev => ({ ...prev, isPlaying: true }));
          })
          .catch(error => {
            console.error('Playback failed:', error);
          });
      }
    }
  }, [state.isPlaying, state.currentTrack]);

  const handleNext = useCallback(() => {
    if (state.queue.length === 0) return;

    let nextIndex: number;
    
    if (state.repeatMode === 'one') {
      nextIndex = state.currentIndex;
    } else if (state.isShuffled) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      nextIndex = state.currentIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeatMode === 'all') {
          nextIndex = 0;
        } else {
          return; // End of queue
        }
      }
    }

    const nextTrack = state.queue[nextIndex];
    if (nextTrack) {
      playTrack(nextTrack, state.queue);
    }
  }, [state.queue, state.currentIndex, state.repeatMode, state.isShuffled, playTrack]);

  const handlePrevious = useCallback(() => {
    if (state.queue.length === 0) return;

    let prevIndex: number;
    
    if (state.isShuffled) {
      prevIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      prevIndex = state.currentIndex - 1;
      if (prevIndex < 0) {
        if (state.repeatMode === 'all') {
          prevIndex = state.queue.length - 1;
        } else {
          return;
        }
      }
    }

    const prevTrack = state.queue[prevIndex];
    if (prevTrack) {
      playTrack(prevTrack, state.queue);
    }
  }, [state.queue, state.currentIndex, state.repeatMode, state.isShuffled, playTrack]);

  const seekTo = useCallback((time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    audioRef.current.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;
    
    if (state.isMuted) {
      audioRef.current.volume = state.volume;
      setState(prev => ({ ...prev, isMuted: false }));
    } else {
      audioRef.current.volume = 0;
      setState(prev => ({ ...prev, isMuted: true }));
    }
  }, [state.isMuted, state.volume]);

  const toggleShuffle = useCallback(() => {
    setState(prev => ({ ...prev, isShuffled: !prev.isShuffled }));
  }, []);

  const toggleRepeat = useCallback(() => {
    setState(prev => {
      const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextIndex = (currentIndex + 1) % modes.length;
      return { ...prev, repeatMode: modes[nextIndex] };
    });
  }, []);

  return {
    ...state,
    playTrack,
    togglePlayPause,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
  };
}
