export const speak = (text: string): SpeechSynthesisUtterance | null => {
  if ('speechSynthesis' in window) {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Hindi language
    utterance.rate = 0.8; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch for friendliness
    utterance.volume = 1;
    
    window.speechSynthesis.speak(utterance);
    return utterance;
  }
  return null;
};
