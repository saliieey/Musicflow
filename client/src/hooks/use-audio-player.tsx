import { useState, useRef, useEffect, useCallback } from "react";
import { JamendoTrack, AudioPlayerState } from "@/types/music";

// Singleton audio player to prevent multiple instances
let globalAudioRef: HTMLAudioElement | null = null;
let globalState: AudioPlayerState = {
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
};

let globalStateListeners: Array<(state: AudioPlayerState) => void> = [];

function notifyListeners(state: AudioPlayerState) {
  globalStateListeners.forEach(listener => listener(state));
}

export function useAudioPlayer() {
  const hookId = useRef(Math.random().toString(36).substr(2, 9));
  
  console.log(`useAudioPlayer hook initialized with ID: ${hookId.current}`);
  
  const [state, setState] = useState<AudioPlayerState>(globalState);

  // Initialize audio element
  useEffect(() => {
    if (!globalAudioRef) {
      globalAudioRef = new Audio();
      globalAudioRef.preload = 'metadata';
      
      // Add audio element to DOM for proper progress tracking
      globalAudioRef.style.display = 'none';
      document.body.appendChild(globalAudioRef);
    }

    const audio = globalAudioRef;

    const handleTimeUpdate = () => {
      console.log(`[Hook ${hookId.current}] Time update:`, audio.currentTime, audio.duration);
      globalState.currentTime = audio.currentTime || 0;
      globalState.duration = audio.duration || 0;
      notifyListeners(globalState);
    };

    const handleDurationChange = () => {
      console.log(`[Hook ${hookId.current}] Duration change:`, audio.duration);
      globalState.duration = audio.duration || 0;
      notifyListeners(globalState);
    };

    const handleLoadedMetadata = () => {
      console.log(`[Hook ${hookId.current}] Metadata loaded:`, audio.duration);
      globalState.duration = audio.duration || 0;
      notifyListeners(globalState);
    };

    const handleEnded = () => {
      handleNext();
    };

    const handleLoadStart = () => {
      globalState.isLoading = true;
      notifyListeners(globalState);
    };

    const handleCanPlay = () => {
      console.log(`[Hook ${hookId.current}] Can play:`, audio.currentTime, audio.duration);
      globalState.isLoading = false;
      globalState.currentTime = audio.currentTime || 0;
      globalState.duration = audio.duration || 0;
      notifyListeners(globalState);
    };

    const handleError = (e: Event) => {
      console.error(`[Hook ${hookId.current}] Audio error:`, e);
      globalState.isLoading = false;
      globalState.isPlaying = false;
      notifyListeners(globalState);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    // Register this hook instance as a listener
    globalStateListeners.push(setState);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
      
      // Remove this hook instance from listeners
      const index = globalStateListeners.indexOf(setState);
      if (index > -1) {
        globalStateListeners.splice(index, 1);
      }
      
      // Clean up audio element from DOM only if no listeners remain
      if (globalStateListeners.length === 0 && globalAudioRef && document.body.contains(globalAudioRef)) {
        document.body.removeChild(globalAudioRef);
        globalAudioRef = null;
      }
    };
  }, []);

  const playTrack = useCallback((track: JamendoTrack, queue: JamendoTrack[] = []) => {
    if (!globalAudioRef) return;

    const audio = globalAudioRef;
    const trackIndex = queue.findIndex(t => t.id === track.id);
    
    globalState.currentTrack = track;
    globalState.queue = queue.length > 0 ? queue : [track];
    globalState.currentIndex = trackIndex >= 0 ? trackIndex : 0;
    globalState.isLoading = true;
    globalState.currentTime = 0;
    globalState.duration = 0;
    notifyListeners(globalState);

    console.log(`[Hook ${hookId.current}] Playing track:`, track.name, 'Audio URL:', track.audio);
    
    audio.src = track.audio;
    audio.load();
    
    // Force load metadata
    audio.preload = 'metadata';
    
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log(`[Hook ${hookId.current}] Playback started successfully`);
          globalState.isPlaying = true;
          globalState.isLoading = false;
          notifyListeners(globalState);
        })
        .catch(error => {
          console.error(`[Hook ${hookId.current}] Playback failed:`, error);
          globalState.isPlaying = false;
          globalState.isLoading = false;
          notifyListeners(globalState);
        });
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!globalAudioRef || !state.currentTrack) return;

    const audio = globalAudioRef;
    
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
    if (!globalAudioRef) return;
    globalAudioRef.currentTime = time;
    setState(prev => ({ ...prev, currentTime: time }));
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!globalAudioRef) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    globalAudioRef.volume = clampedVolume;
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: clampedVolume === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!globalAudioRef) return;
    
    if (state.isMuted) {
      globalAudioRef.volume = state.volume;
      setState(prev => ({ ...prev, isMuted: false }));
    } else {
      globalAudioRef.volume = 0;
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
