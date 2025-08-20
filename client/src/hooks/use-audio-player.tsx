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
let isInitialized = false;

function notifyListeners(state: AudioPlayerState) {
  console.log('notifyListeners called with:', state.currentTrack?.name, 'Listeners count:', globalStateListeners.length);
  globalStateListeners.forEach((listener, index) => {
    console.log(`Notifying listener ${index}:`, state.currentTrack?.name);
    // Force a new object reference to ensure React detects the change
    listener({...state});
  });
}

// Initialize audio element once
function initializeAudio() {
  if (isInitialized) return;
  
  if (!globalAudioRef) {
    globalAudioRef = new Audio();
    globalAudioRef.preload = 'metadata';
    
    // Add audio element to DOM for proper progress tracking
    globalAudioRef.style.display = 'none';
    document.body.appendChild(globalAudioRef);
    
    console.log('Audio element created and added to DOM');
  }
  
  isInitialized = true;
}

export function useAudioPlayer() {
  const hookId = useRef(Math.random().toString(36).substr(2, 9));
  const [state, setState] = useState<AudioPlayerState>(globalState);

  // Initialize audio element
  useEffect(() => {
    initializeAudio();

    const audio = globalAudioRef;
    if (!audio) return;

    const handleTimeUpdate = () => {
      globalState.currentTime = audio.currentTime || 0;
      globalState.duration = audio.duration || 0;
      notifyListeners(globalState);
    };

    const handleDurationChange = () => {
      globalState.duration = audio.duration || 0;
      notifyListeners(globalState);
    };

    const handleLoadedMetadata = () => {
      globalState.duration = audio.duration || 0;
      console.log('Audio element loaded metadata. Duration:', audio.duration);
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
      globalState.isLoading = false;
      globalState.currentTime = audio.currentTime || 0;
      globalState.duration = audio.duration || 0;
      console.log('Audio element can play through. Setting isPlaying to true');
      globalState.isPlaying = true;
      notifyListeners(globalState);
    };

    const handleError = (e: Event) => {
      console.error('Audio error:', e);
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

    // Initialize local state with global state
    console.log('Hook initialized, global state:', globalState);
    setState({...globalState});

    // Set up an interval to sync state (temporary fix)
    const syncInterval = setInterval(() => {
      if (globalState.currentTrack !== state.currentTrack || 
          globalState.isPlaying !== state.isPlaying ||
          globalState.currentTime !== state.currentTime ||
          globalState.duration !== state.duration) {
        console.log('State sync needed:', {
          globalTrack: globalState.currentTrack?.name,
          localTrack: state.currentTrack?.name,
          globalPlaying: globalState.isPlaying,
          localPlaying: state.isPlaying,
          globalTime: globalState.currentTime,
          localTime: state.currentTime
        });
        setState({...globalState}); // Force new object reference
      }
    }, 100);

    return () => {
      clearInterval(syncInterval);
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
      
      // Don't remove audio element from DOM - keep it for other instances
    };
  }, []);

  const playTrack = useCallback((track: JamendoTrack, queue: JamendoTrack[] = []) => {
    if (!globalAudioRef) {
      console.error('Audio element not initialized');
      return;
    }

    console.log('playTrack called with:', track.name, 'Queue length:', queue.length);

    const audio = globalAudioRef;
    const trackIndex = queue.findIndex(t => t.id === track.id);
    
    // Update global state first
    globalState.currentTrack = track;
    globalState.queue = queue.length > 0 ? queue : [track];
    globalState.currentIndex = trackIndex >= 0 ? trackIndex : 0;
    globalState.isLoading = true;
    globalState.currentTime = 0;
    globalState.duration = 0;
    globalState.isPlaying = false; // Will be set to true after successful play
    
    console.log('Global state updated:', {
      currentTrack: globalState.currentTrack?.name,
      queueLength: globalState.queue.length,
      currentIndex: globalState.currentIndex
    });
    
    // Notify listeners immediately with track info
    console.log('Notifying listeners with track:', track.name);
    notifyListeners(globalState);
    
    // Set audio source and load
    audio.src = track.audio;
    audio.load();
    
    // Force load metadata
    audio.preload = 'metadata';
    
    console.log('Starting playback for:', track.name);
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          console.log('Playback started successfully for:', track.name);
          globalState.isPlaying = true;
          globalState.isLoading = false;
          notifyListeners(globalState);
        })
        .catch(error => {
          console.error('Playback failed:', error);
          globalState.isPlaying = false;
          globalState.isLoading = false;
          notifyListeners(globalState);
        });
    }
  }, []);

  const togglePlayPause = useCallback(() => {
    if (!globalAudioRef) return;

    const audio = globalAudioRef;
    
    if (state.isPlaying) {
      audio.pause();
      globalState.isPlaying = false;
      notifyListeners(globalState);
    } else {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            globalState.isPlaying = true;
            notifyListeners(globalState);
          })
          .catch(error => {
            console.error('Playback failed:', error);
          });
      }
    }
  }, [state.isPlaying]);

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
    globalState.currentTime = time;
    notifyListeners(globalState);
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (!globalAudioRef) return;
    const clampedVolume = Math.max(0, Math.min(1, volume));
    globalAudioRef.volume = clampedVolume;
    globalState.volume = clampedVolume;
    globalState.isMuted = clampedVolume === 0;
    notifyListeners(globalState);
  }, []);

  const toggleMute = useCallback(() => {
    if (!globalAudioRef) return;
    
    if (state.isMuted) {
      globalAudioRef.volume = state.volume;
      globalState.isMuted = false;
      notifyListeners(globalState);
    } else {
      globalAudioRef.volume = 0;
      globalState.isMuted = true;
      notifyListeners(globalState);
    }
  }, [state.isMuted, state.volume]);

  const toggleShuffle = useCallback(() => {
    globalState.isShuffled = !state.isShuffled;
    notifyListeners(globalState);
  }, [state.isShuffled]);

  const toggleRepeat = useCallback(() => {
    const modes: Array<'off' | 'one' | 'all'> = ['off', 'one', 'all'];
    const currentIndex = modes.indexOf(state.repeatMode);
    const nextIndex = (currentIndex + 1) % modes.length;
    globalState.repeatMode = modes[nextIndex];
    notifyListeners(globalState);
  }, [state.repeatMode]);

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
    // Debug function
    debugState: () => {
      console.log('Global state:', globalState);
      console.log('Local state:', state);
      console.log('Listeners count:', globalStateListeners.length);
    }
  };
}
