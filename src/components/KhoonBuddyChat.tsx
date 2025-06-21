import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Heart, HelpCircle, Volume2, VolumeX, Minimize2, Maximize2, Sparkles, Mic, MicOff, Speaker, Loader2 } from 'lucide-react';
import { khoonBuddyAgent, type ChatMessage } from '../lib/khoonBuddyAgent';

export default function KhoonBuddyChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Voice input states
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [voiceInputSupported, setVoiceInputSupported] = useState(false);
  
  // ElevenLabs TTS states
  const [isGeneratingVoice, setIsGeneratingVoice] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [lastResponseAudio, setLastResponseAudio] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, isMinimized]);

  // ESC key support to close chat
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => document.removeEventListener('keydown', handleEscKey);
  }, [isOpen]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
        console.log('🎤 Voice recognition started');
      };
      
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('🎤 Voice input received:', transcript);
        setInputMessage(transcript);
        setIsListening(false);
      };
      
      recognition.onerror = (event) => {
        console.error('🎤 Voice recognition error:', event.error);
        setIsListening(false);
      };
      
      recognition.onend = () => {
        setIsListening(false);
        console.log('🎤 Voice recognition ended');
      };
      
      setSpeechRecognition(recognition);
      setVoiceInputSupported(true);
    } else {
      console.warn('🎤 Speech recognition not supported in this browser');
      setVoiceInputSupported(false);
    }
  }, []);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: "Hi! I'm KhoonBuddy — your AI blood donation assistant! 🤖🩸\n\nI'm here to answer questions about:\n• Blood donation eligibility\n• The donation process\n• Health and safety\n• Blood types and compatibility\n• Finding donation centers\n\nWhat would you like to know? You can type or use the microphone to speak!",
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
      
      // Generate welcome voice if voice is enabled
      if (voiceEnabled) {
        setTimeout(() => {
          generateElevenLabsVoice(welcomeMessage.content);
        }, 500);
      }
    }
  }, [isOpen, messages.length, voiceEnabled]);

  // ElevenLabs Text-to-Speech function
  const generateElevenLabsVoice = async (text: string) => {
    if (!voiceEnabled) return;

    try {
      setIsGeneratingVoice(true);
      
      // Clean text for better speech synthesis
      const cleanText = text
        .replace(/🤖|🩸|•|❤️|💪|🦸‍♀️|🦸‍♂️|🌟|✨|🎉|🙏|🌍|🌈|💧|⏰|🚨|⚠️|ℹ️|🔍|📍|🏥|📅|💊|🛡️|🎨|🍪|🥗|🍎|🏃‍♀️|🤗|😊/g, '')
        .replace(/\n/g, '. ')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .trim();

      if (cleanText.length === 0) return;

      const apiKey = import.meta.env.VITE_ELEVENLABS_API_KEY;
      const voiceId = import.meta.env.VITE_ELEVENLABS_VOICE_ID;

      if (!apiKey || !voiceId) {
        console.warn('🔊 ElevenLabs API key or voice ID not configured, falling back to Web Speech API');
        playWebSpeechVoice(cleanText);
        return;
      }

      console.log('🔊 Generating ElevenLabs voice for:', cleanText.substring(0, 50) + '...');

      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
        method: 'POST',
        headers: {
          'xi-api-key': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: cleanText,
          voice_settings: {
            stability: 0.75,
            similarity_boost: 0.75
          }
        })
      });

      if (!response.ok) {
        throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);
      
      // Store for replay functionality
      setLastResponseAudio(audioUrl);
      
      // Play the audio
      const audio = new Audio(audioUrl);
      setCurrentAudio(audio);
      setIsPlayingVoice(true);
      
      audio.onended = () => {
        setIsPlayingVoice(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsPlayingVoice(false);
        setCurrentAudio(null);
        console.error('🔊 Audio playback error');
      };
      
      await audio.play();
      console.log('🔊 ElevenLabs voice played successfully');

    } catch (error) {
      console.error('🔊 ElevenLabs TTS failed:', error);
      // Fallback to Web Speech API
      playWebSpeechVoice(text);
    } finally {
      setIsGeneratingVoice(false);
    }
  };

  // Fallback Web Speech API function
  const playWebSpeechVoice = (text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;

    try {
      speechSynthesis.cancel();
      
      const cleanText = text
        .replace(/🤖|🩸|•|❤️|💪|🦸‍♀️|🦸‍♂️|🌟|✨|🎉|🙏|🌍|🌈|💧|⏰|🚨|⚠️|ℹ️|🔍|📍|🏥|📅|💊|🛡️|🎨|🍪|🥗|🍎|🏃‍♀️|🤗|😊/g, '')
        .replace(/\n/g, '. ')
        .replace(/\*\*(.*?)\*\*/g, '$1')
        .trim();

      if (cleanText.length === 0) return;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice => 
        voice.name.includes('Google') || 
        voice.name.includes('Microsoft') ||
        voice.name.includes('Alex') ||
        voice.name.includes('Samantha')
      );
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      utterance.onstart = () => setIsPlayingVoice(true);
      utterance.onend = () => setIsPlayingVoice(false);
      utterance.onerror = () => setIsPlayingVoice(false);

      speechSynthesis.speak(utterance);
      console.log('🔊 Web Speech API voice played as fallback');
    } catch (error) {
      console.error('🔊 Web Speech API failed:', error);
      setIsPlayingVoice(false);
    }
  };

  // Start voice input
  const startVoiceInput = () => {
    if (!speechRecognition || isListening) return;
    
    try {
      speechRecognition.start();
    } catch (error) {
      console.error('🎤 Failed to start voice recognition:', error);
    }
  };

  // Stop voice input
  const stopVoiceInput = () => {
    if (!speechRecognition || !isListening) return;
    
    try {
      speechRecognition.stop();
    } catch (error) {
      console.error('🎤 Failed to stop voice recognition:', error);
    }
  };

  // Replay last response
  const replayLastResponse = () => {
    if (lastResponseAudio && !isPlayingVoice) {
      const audio = new Audio(lastResponseAudio);
      setCurrentAudio(audio);
      setIsPlayingVoice(true);
      
      audio.onended = () => {
        setIsPlayingVoice(false);
        setCurrentAudio(null);
      };
      
      audio.onerror = () => {
        setIsPlayingVoice(false);
        setCurrentAudio(null);
      };
      
      audio.play();
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    // Simulate typing delay for more natural feel
    setTimeout(async () => {
      const response = khoonBuddyAgent.generateResponse(userMessage.content);
      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsTyping(false);

      // Generate voice response
      if (voiceEnabled) {
        setTimeout(() => {
          generateElevenLabsVoice(response);
        }, 300);
      }
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
    
    // Stop any playing audio
    if (currentAudio) {
      currentAudio.pause();
      setCurrentAudio(null);
      setIsPlayingVoice(false);
    }
    
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    
    // Stop voice input if active
    if (isListening) {
      stopVoiceInput();
    }
  };

  const toggleVoice = () => {
    const newVoiceState = !voiceEnabled;
    setVoiceEnabled(newVoiceState);
    
    if (!newVoiceState) {
      // Stop current audio and speech
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setIsPlayingVoice(false);
      }
      
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      
      console.log('🔇 Voice disabled, all audio stopped');
    } else {
      console.log('🔊 Voice enabled');
    }
  };

  const formatMessage = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const sampleQuestions = khoonBuddyAgent.getSampleQuestions();

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 z-50 group animate-pulse hover:animate-none"
          aria-label="Open KhoonBuddy Voice Assistant"
        >
          <div className="relative">
            <MessageCircle className="h-6 w-6" />
            <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 animate-bounce">
              <Heart className="h-3 w-3 text-red-500" />
            </div>
          </div>
          
          {/* Enhanced Tooltip */}
          <div className="absolute bottom-full right-0 mb-3 px-4 py-2 bg-gray-900 text-white text-sm rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span>Voice Assistant Ready!</span>
              <Mic className="h-4 w-4 text-green-400" />
            </div>
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-end p-4 z-50 md:items-center md:justify-center">
          <div className={`w-full h-full md:w-96 bg-white rounded-t-3xl md:rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 md:slide-in-from-right-4 duration-300 ${
            isMinimized ? 'md:h-16' : 'md:h-[600px]'
          }`}>
            {/* Enhanced Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 p-2 rounded-full animate-pulse">
                  <Heart className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg flex items-center space-x-2">
                    <span>KhoonBuddy</span>
                    <Sparkles className="h-4 w-4 text-yellow-300" />
                  </h3>
                  <p className="text-red-100 text-sm flex items-center space-x-1">
                    <span>AI Voice Assistant</span>
                    {voiceEnabled && <Volume2 className="h-3 w-3" />}
                    {voiceInputSupported && <Mic className="h-3 w-3" />}
                  </p>
                </div>
              </div>
              
              {/* Header Controls */}
              <div className="flex items-center space-x-2">
                {/* Voice Toggle */}
                <button
                  onClick={toggleVoice}
                  className={`p-2 rounded-full transition-all duration-200 ${
                    voiceEnabled 
                      ? 'text-white bg-white/20 hover:bg-white/30' 
                      : 'text-white/60 hover:text-white/80'
                  }`}
                  title={voiceEnabled ? "Disable voice" : "Enable voice"}
                >
                  {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
                </button>

                {/* Replay Last Response */}
                {lastResponseAudio && voiceEnabled && (
                  <button
                    onClick={replayLastResponse}
                    disabled={isPlayingVoice}
                    className="p-2 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50"
                    title="Replay last response"
                  >
                    {isPlayingVoice ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Speaker className="h-4 w-4" />
                    )}
                  </button>
                )}

                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="hidden md:block text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-200"
                  aria-label={isMinimized ? "Maximize" : "Minimize"}
                >
                  {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
                </button>
                <button
                  onClick={handleClose}
                  className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all duration-200 group"
                  aria-label="Close KhoonBuddy Chat"
                >
                  <X className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            {!isMinimized && (
              <>
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in-0 slide-in-from-bottom-2 duration-500`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div
                        className={`max-w-[85%] p-4 rounded-2xl shadow-sm ${
                          message.type === 'user'
                            ? 'bg-red-600 text-white rounded-br-md'
                            : 'bg-white text-gray-800 rounded-bl-md border border-gray-100'
                        }`}
                      >
                        {message.type === 'assistant' && (
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="bg-red-100 p-1.5 rounded-full">
                              <Heart className="h-3 w-3 text-red-600" />
                            </div>
                            <span className="text-xs font-semibold text-red-600">KhoonBuddy AI</span>
                            <div className="flex-1"></div>
                            {voiceEnabled && (
                              <div className="flex items-center space-x-1">
                                {isGeneratingVoice && (
                                  <Loader2 className="h-3 w-3 text-blue-600 animate-spin" />
                                )}
                                <button
                                  onClick={() => generateElevenLabsVoice(message.content)}
                                  disabled={isGeneratingVoice || isPlayingVoice}
                                  className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                                  title="Play voice"
                                >
                                  <Volume2 className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                        <div className={`text-sm leading-relaxed ${message.type === 'user' ? 'text-white' : 'text-gray-800'}`}>
                          {formatMessage(message.content)}
                        </div>
                        <div className={`text-xs mt-3 ${message.type === 'user' ? 'text-red-100' : 'text-gray-400'}`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Enhanced Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
                      <div className="bg-white p-4 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-2 mb-3">
                          <div className="bg-red-100 p-1.5 rounded-full">
                            <Heart className="h-3 w-3 text-red-600" />
                          </div>
                          <span className="text-xs font-semibold text-red-600">KhoonBuddy is thinking...</span>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Quick Questions */}
                  {messages.length <= 1 && !isTyping && (
                    <div className="space-y-4 animate-in fade-in-0 slide-in-from-bottom-4 duration-700">
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-4 font-medium flex items-center justify-center space-x-2">
                          <Sparkles className="h-4 w-4 text-yellow-500" />
                          <span>Try asking me about:</span>
                          {voiceEnabled && <Volume2 className="h-4 w-4 text-green-500" />}
                          {voiceInputSupported && <Mic className="h-4 w-4 text-blue-500" />}
                        </p>
                      </div>
                      <div className="grid gap-3">
                        {sampleQuestions.slice(0, 4).map((question, index) => (
                          <button
                            key={index}
                            onClick={() => handleQuickQuestion(question)}
                            className="text-left p-4 bg-white border-2 border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-sm text-gray-700 hover:text-red-700 shadow-sm hover:shadow-md transform hover:scale-[1.02] group"
                          >
                            <div className="flex items-start space-x-3">
                              <HelpCircle className="h-4 w-4 text-red-500 mt-0.5 group-hover:scale-110 transition-transform" />
                              <span className="font-medium">{question}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Enhanced Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="flex-1 relative">
                      <input
                        ref={inputRef}
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={isListening ? "Listening..." : "Ask me anything about blood donation..."}
                        className={`w-full px-4 py-3 pr-20 border-2 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 text-sm placeholder-gray-500 ${
                          isListening ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
                        }`}
                        disabled={isTyping || isListening}
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                        {/* Voice Input Button */}
                        {voiceInputSupported && (
                          <button
                            onClick={isListening ? stopVoiceInput : startVoiceInput}
                            disabled={isTyping}
                            className={`p-1.5 rounded-lg transition-all duration-200 ${
                              isListening 
                                ? 'bg-blue-600 text-white animate-pulse' 
                                : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
                            }`}
                            title={isListening ? "Stop listening" : "Start voice input"}
                          >
                            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                          </button>
                        )}
                        <Heart className="h-4 w-4 text-red-400" />
                      </div>
                    </div>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputMessage.trim() || isTyping || isListening}
                      className="bg-red-600 text-white p-3 rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex-shrink-0 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none"
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                  
                  {/* Voice Status Indicators */}
                  {(isListening || isGeneratingVoice || isPlayingVoice) && (
                    <div className="mb-3 flex items-center justify-center space-x-4 text-sm">
                      {isListening && (
                        <div className="flex items-center space-x-2 text-blue-600">
                          <Mic className="h-4 w-4 animate-pulse" />
                          <span>Listening...</span>
                        </div>
                      )}
                      {isGeneratingVoice && (
                        <div className="flex items-center space-x-2 text-purple-600">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Generating voice...</span>
                        </div>
                      )}
                      {isPlayingVoice && (
                        <div className="flex items-center space-x-2 text-green-600">
                          <Volume2 className="h-4 w-4 animate-pulse" />
                          <span>Playing response...</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Enhanced Footer */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500 leading-relaxed flex items-center justify-center space-x-1">
                      <Heart className="h-3 w-3 text-red-400" />
                      <span>KhoonBuddy provides general information. Always consult healthcare professionals for medical advice.</span>
                      {voiceEnabled && <Volume2 className="h-3 w-3 text-green-400" />}
                      {voiceInputSupported && <Mic className="h-3 w-3 text-blue-400" />}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}