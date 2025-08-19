export interface JamendoTrack {
  id: string;
  name: string;
  duration: number;
  artist_name: string;
  artist_id: string;
  album_name: string;
  album_id: string;
  album_image: string;
  image: string;
  audio: string;
  audiodownload: string;
  prourl: string;
  shorturl: string;
  shareurl: string;
  waveform: string;
  licenseurl: string;
  position: number;
  releasedate: string;
  album_datecreated: string;
  musicinfo: {
    vocalinstrumental: string;
    gender: string;
    speed: string;
    acousticelectric: string;
    tags: {
      genres: string[];
      instruments: string[];
      moods: string[];
    };
  };
}

export interface JamendoApiResponse {
  headers: {
    status: string;
    code: number;
    error_message: string;
    warnings: string;
    results_count: number;
    next: string;
  };
  results: JamendoTrack[];
}

export interface PlaylistTrack {
  id: string;
  name: string;
  artist_name: string;
  album_name: string;
  album_image: string;
  audio: string;
  duration: number;
}

export interface AudioPlayerState {
  isPlaying: boolean;
  currentTrack: JamendoTrack | null;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isLoading: boolean;
  queue: JamendoTrack[];
  currentIndex: number;
  isShuffled: boolean;
  repeatMode: 'off' | 'one' | 'all';
}
