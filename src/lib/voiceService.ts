/**
 * Voice Service for BloodLink
 * Handles Web Speech API for voice input and ElevenLabs for natural TTS output
 */

export interface VoiceSettings {
  stability: number;
  similarity_boost: number;
  style?: number;
  use_speaker_boost?: boolean;
}

export interface ElevenLabsResponse {
  audio: Blob;
  url: string;
}

export class VoiceService {
  private apiKey: string | null;
  private voiceId: string | null;
  private speechRecognition: SpeechRecognition | null = null;
  private isSupported: boolean = false;

  constructor() {
    this.apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || null;
    this.voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID || null;
    this.initializeSpeechRecognition();
  }

  /**
   * Initialize Web Speech API for voice input
   */
  private initializeSpeechRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = 'en-US';
      this.isSupported = true;
      console.log('🎤 Speech Recognition initialized successfully');
    } else {
      console.warn('🎤 Speech Recognition not supported in this browser');
      this.isSupported = false;
    }
  }

  /**
   * Check if voice input is supported
   */
  isVoiceInputSupported(): boolean {
    return this.isSupported && this.speechRecognition !== null;
  }

  /**
   * Check if ElevenLabs TTS is configured
   */
  isElevenLabsConfigured(): boolean {
    return !!(this.apiKey && this.voiceId);
  }

  /**
   * Start voice recognition
   */
  async startVoiceRecognition(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.speechRecognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      this.speechRecognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input received:', transcript);
        resolve(transcript);
      };

      this.speechRecognition.onerror = (event) => {
        console.error('🎤 Speech recognition error:', event.error);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      this.speechRecognition.onend = () => {
        console.log('🎤 Speech recognition ended');
      };

      try {
        this.speechRecognition.start();
        console.log('🎤 Speech recognition started');
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop voice recognition
   */
  stopVoiceRecognition(): void {
    if (this.speechRecognition) {
      this.speechRecognition.stop();
    }
  }

  /**
   * Generate speech using ElevenLabs API
   */
  async generateElevenLabsSpeech(
    text: string, 
    voiceSettings: VoiceSettings = { stability: 0.75, similarity_boost: 0.75 }
  ): Promise<ElevenLabsResponse> {
    if (!this.apiKey || !this.voiceId) {
      throw new Error('ElevenLabs API key or voice ID not configured');
    }

    // Clean text for better speech synthesis
    const cleanText = this.cleanTextForSpeech(text);

    if (cleanText.length === 0) {
      throw new Error('No valid text to synthesize');
    }

    console.log('🔊 Generating ElevenLabs speech for:', cleanText.substring(0, 100) + '...');

    try {
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${this.voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          voice_settings: voiceSettings
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      console.log('🔊 ElevenLabs speech generated successfully');

      return {
        audio: audioBlob,
        url: audioUrl
      };

    } catch (error) {
      console.error('🔊 ElevenLabs TTS failed:', error);
      throw error;
    }
  }

  /**
   * Fallback to Web Speech API for text-to-speech
   */
  async generateWebSpeech(text: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      try {
        // Cancel any ongoing speech
        speechSynthesis.cancel();

        const cleanText = this.cleanTextForSpeech(text);
        if (cleanText.length === 0) {
          reject(new Error('No valid text to synthesize'));
          return;
        }

        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;

        // Try to use a better voice if available
        const voices = speechSynthesis.getVoices();
        const preferredVoice = voices.find(voice => 
          voice.name.includes('Google') || 
          voice.name.includes('Microsoft') ||
          voice.name.includes('Alex') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Karen') ||
          voice.name.includes('Daniel')
        );
        
        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => {
          console.log('🔊 Web Speech synthesis completed');
          resolve();
        };

        utterance.onerror = (event) => {
          console.error('🔊 Web Speech synthesis error:', event.error);
          reject(new Error(`Speech synthesis error: ${event.error}`));
        };

        speechSynthesis.speak(utterance);
        console.log('🔊 Web Speech synthesis started');

      } catch (error) {
        console.error('🔊 Web Speech synthesis failed:', error);
        reject(error);
      }
    });
  }

  /**
   * Play audio from URL or blob
   */
  async playAudio(audioUrl: string): Promise<HTMLAudioElement> {
    return new Promise((resolve, reject) => {
      const audio = new Audio(audioUrl);
      
      audio.oncanplaythrough = () => {
        audio.play()
          .then(() => {
            console.log('🔊 Audio playback started');
            resolve(audio);
          })
          .catch(reject);
      };
      
      audio.onerror = () => {
        reject(new Error('Audio playback failed'));
      };
      
      audio.load();
    });
  }

  /**
   * Clean text for better speech synthesis
   */
  private cleanTextForSpeech(text: string): string {
    return text
      // Remove emojis and special characters
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Replace bullet points with commas
      .replace(/•/g, ',')
      // Replace newlines with periods
      .replace(/\n/g, '. ')
      // Remove markdown formatting
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1')
      // Clean up multiple spaces and periods
      .replace(/\s+/g, ' ')
      .replace(/\.+/g, '.')
      .replace(/,+/g, ',')
      // Trim whitespace
      .trim();
  }

  /**
   * Stop all audio playback
   */
  stopAllAudio(): void {
    // Stop Web Speech API
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    // Stop voice recognition
    this.stopVoiceRecognition();

    console.log('🔇 All audio stopped');
  }

  /**
   * Get available voices for Web Speech API
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    if ('speechSynthesis' in window) {
      return speechSynthesis.getVoices();
    }
    return [];
  }

  /**
   * Test ElevenLabs connection
   */
  async testElevenLabsConnection(): Promise<boolean> {
    if (!this.apiKey) {
      console.warn('🔊 ElevenLabs API key not configured');
      return false;
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': this.apiKey,
        }
      });

      const isConnected = response.ok;
      console.log(`🔊 ElevenLabs connection test: ${isConnected ? 'SUCCESS' : 'FAILED'}`);
      return isConnected;

    } catch (error) {
      console.error('🔊 ElevenLabs connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}