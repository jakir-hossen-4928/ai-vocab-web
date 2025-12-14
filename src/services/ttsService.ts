export const speakText = (text: string) => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Attempt to find a local voice to avoid network dependencies
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.lang === 'en-US' && v.localService) ||
      voices.find(v => v.lang === 'en-US');

    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.lang = 'en-US';
    utterance.rate = 0.9; // Slightly slower for learning
    utterance.pitch = 1;

    // Error handling for playback
    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      // Fallback or retry logic could go here
    };

    window.speechSynthesis.speak(utterance);
  } else {
    console.error('Text-to-speech not supported in this browser');
  }
};

export const stopSpeaking = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
};
