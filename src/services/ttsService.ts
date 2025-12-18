const PREFERRED_VOICE_KEY = 'tts_voice_preference';
const PREFERRED_RATE_KEY = 'tts_rate_preference';
const PREFERRED_PITCH_KEY = 'tts_pitch_preference';

let voicesCache: SpeechSynthesisVoice[] = [];

export const loadVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      voicesCache = voices;
      resolve(voices);
    } else {
      window.speechSynthesis.onvoiceschanged = () => {
        const updatedVoices = window.speechSynthesis.getVoices();
        voicesCache = updatedVoices;
        resolve(updatedVoices);
      };
    }
  });
};

export const getStoredVoiceName = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(PREFERRED_VOICE_KEY);
};

export const setStoredVoiceName = (name: string) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFERRED_VOICE_KEY, name);
};

export const getStoredRate = (): number => {
  if (typeof window === 'undefined') return 1;
  const rate = localStorage.getItem(PREFERRED_RATE_KEY);
  return rate ? parseFloat(rate) : 1;
};

export const setStoredRate = (rate: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFERRED_RATE_KEY, rate.toString());
};

export const getStoredPitch = (): number => {
  if (typeof window === 'undefined') return 1;
  const pitch = localStorage.getItem(PREFERRED_PITCH_KEY);
  return pitch ? parseFloat(pitch) : 1;
};

export const setStoredPitch = (pitch: number) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PREFERRED_PITCH_KEY, pitch.toString());
};

export const speakText = async (text: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.error('Text-to-speech not supported in this browser');
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Ensure voices are loaded
  if (voicesCache.length === 0) {
    await loadVoices();
  }

  const utterance = new SpeechSynthesisUtterance(text);

  // Find preferred voice
  const preferredName = getStoredVoiceName();
  let selectedVoice = voicesCache.find(v => v.name === preferredName);

  // Fallback logic: prefer local English voice, then any English voice
  if (!selectedVoice) {
    selectedVoice = voicesCache.find(v => v.lang.startsWith('en') && v.localService) ||
      voicesCache.find(v => v.lang.startsWith('en'));
  }

  if (selectedVoice) {
    utterance.voice = selectedVoice;
  } else {
    // Fallback lang if no voice found
    utterance.lang = 'en-US';
  }

  utterance.rate = getStoredRate();
  utterance.pitch = getStoredPitch();

  // Error handling for playback
  utterance.onerror = (e) => {
    console.error('TTS Error:', e);
  };

  window.speechSynthesis.speak(utterance);
};

export const stopSpeaking = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
