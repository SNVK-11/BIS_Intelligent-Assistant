import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  BookOpen,
  Building2,
  FileText,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Copy,
  Check,
  Download,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ChatMessage, Citation } from '../types';
import { FREQUENT_QUESTIONS } from '../data/bisKnowledge';

interface ChatViewProps {
  language: 'en' | 'hi';
  initialQuery?: string;
  onNavigateToLabs?: (standardCode?: string) => void;
  onNavigateToStandards?: (code?: string) => void;
  onNavigateToCalculator?: () => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  language,
  initialQuery,
  onNavigateToLabs,
  onNavigateToStandards,
  onNavigateToCalculator,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text:
        language === 'hi'
          ? `नमस्ते! मैं **BIS TECH Warriors AI Assistant** हूँ — भारतीय मानक ब्यूरो (BIS), भारतीय मानकों (IS Codes), गुणवत्ता नियंत्रण आदेशों (QCO) और प्रमाणीकरण योजनाओं का आपका आधिकारिक डिजिटल मार्गदर्शक।\n\nआप किसी भी उत्पाद (जैसे स्टेनलेस स्टील के बर्तन, हेलमेट, पानी की बोतलें, सीमेंट, खिलौने, या सोने की हॉलमार्किंग) के बारे में पूछ सकते हैं।\n\n🎯 **उदाहरण प्रश्न:** *"स्टेनलेस स्टील के बर्तनों के लिए कौन सा बीआईएस प्रमाणन आवश्यक है?"*`
          : `Hello! I am the **BIS TECH Warriors AI Assistant** — your intelligent, citation-backed guide to the Bureau of Indian Standards (BIS), Indian Standards (IS Codes), Quality Control Orders (QCOs), and certification processes.\n\nAsk me about any product, standard requirements, testing labs, or licensing procedures for industries, MSMEs, startups, or consumers.\n\n🎯 **Try asking:** *"What BIS certification is required for stainless steel utensils?"* or *"How do MSMEs claim 50% fee concession?"*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: [
        {
          source: 'Bureau of Indian Standards',
          code: 'BIS Act 2016',
          title: 'National Standards Body of India',
          description: 'Governs conformity assessment, ISI mark, CRS, and hallmarking.',
        },
      ],
      suggestedQueries: [
        'What BIS certification is required for stainless steel utensils?',
        'How do MSMEs and Startups get 50% concession on BIS certification fees?',
        'How can a consumer verify a 6-digit HUID gold hallmark on the BIS Care App?',
        'What is the complete process to get ISI mark for packaged drinking water (IS 14543)?',
      ],
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Speech-to-Text
  const handleVoiceInput = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your query.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputQuery(prev => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Handle Text-to-Speech
  const handleTextToSpeech = (id: string, text: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    if (speakingMessageId === id) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*_#`[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 1.0;

    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    setSpeakingMessageId(id);
    window.speechSynthesis.speak(utterance);
  };

  // Handle Copy text
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Send query
  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };

    setMessages(prev => [...prev, userMessage]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          language,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: data.citations,
        suggestedQueries: data.suggestedQueries,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      // Fallback friendly message
      const errMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text:
          language === 'hi'
            ? 'क्षमा करें, नेटवर्क में देरी के कारण उत्तर देने में समस्या आई। कृपया पुनः प्रयास करें।'
            : 'I encountered a brief connection issue. Please retry or click one of the suggested topics below.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger query if passed from other tabs (e.g. Product Mapper)
  const lastProcessedInitialQuery = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (initialQuery && initialQuery !== lastProcessedInitialQuery.current) {
      lastProcessedInitialQuery.current = initialQuery;
      handleSend(initialQuery);
    }
  }, [initialQuery]);

  // Download entire conversation or summary as text
  const handleDownloadGuidance = (msg: ChatMessage) => {
    const title = 'BIS_Guidance_Summary.txt';
    const content = `=====================================================
BIS TECH WARRIORS - OFFICIAL GUIDANCE ADVISORY
AI-powered Intelligent Assistant for Indian Standards
=====================================================

Date: ${new Date().toLocaleDateString()}
Query / Topic: Indian Standards Compliance

----------------- GUIDANCE DETAILS ------------------
${msg.text}

-------------------- CITATIONS ----------------------
${(msg.citations || [])
  .map(
    c => `• ${c.code}: ${c.title}
  Clause/Ref: ${c.clause || 'Standard Specification'}
  Authority: ${c.source}
  Summary: ${c.description}\n`
  )
  .join('\n')}

----------------- OFFICIAL PORTALS ------------------
- BIS Official Standards Portal: https://www.services.bis.gov.in
- Manakonline Licensing: https://www.manakonline.in
- CRS Electronics Portal: https://www.crsbis.in
- BIS CARE Mobile App: Available on Google Play & Apple App Store

This document is generated for informational guidance by BIS TECH Warriors.
`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = title;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Simple parser to render markdown bolding and bullet points cleanly
  const renderFormattedText = (text: string) => {
    const paragraphs = text.split('\n\n');
    return paragraphs.map((para, pIdx) => {
      const lines = para.split('\n');
      return (
        <div key={pIdx} className="mb-3 last:mb-0">
          {lines.map((line, lIdx) => {
            const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
            const isNumbered = /^\d+\.\s/.test(line.trim());

            // Process bold **text**
            const parts = line.split(/(\*\*.*?\*\*)/g);

            return (
              <div
                key={lIdx}
                className={`${isBullet ? 'flex items-start gap-2 ml-2 my-1' : ''} ${
                  isNumbered ? 'font-medium my-1' : ''
                }`}
              >
                {isBullet && <span className="text-amber-500 font-bold">•</span>}
                <div>
                  {parts.map((part, idx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return (
                        <strong key={idx} className="font-semibold text-slate-900">
                          {part.slice(2, -2)}
                        </strong>
                      );
                    }
                    if (part.startsWith('*') && part.endsWith('*')) {
                      return (
                        <em key={idx} className="italic text-slate-700">
                          {part.slice(1, -1)}
                        </em>
                      );
                    }
                    return <span key={idx}>{part}</span>;
                  })}
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[620px] max-w-5xl mx-auto w-full px-3 sm:px-6 py-4">
      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-4 rounded-2xl p-3 sm:p-5 bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-xs">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 text-sm leading-relaxed transition-all ${
                  isUser
                    ? 'bg-slate-900 text-slate-50 rounded-tr-xs shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-xs shadow-xs'
                }`}
              >
                {/* Header row with time and tools */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1.5 border-b border-slate-100 text-[11px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1.5">
                    {isUser ? (
                      <span className="text-slate-300 font-semibold">You</span>
                    ) : (
                      <span className="text-amber-600 font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                        BIS Knowledge Engine
                      </span>
                    )}
                    <span>• {msg.timestamp}</span>
                  </span>

                  {!isUser && (
                    <div className="flex items-center gap-1">
                      {/* Read Aloud Button */}
                      <button
                        id={`btn-tts-${msg.id}`}
                        onClick={() => handleTextToSpeech(msg.id, msg.text)}
                        title="Read aloud"
                        className={`p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors ${
                          speakingMessageId === msg.id ? 'text-amber-600 bg-amber-50' : ''
                        }`}
                      >
                        {speakingMessageId === msg.id ? (
                          <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                        ) : (
                          <Volume2 className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Copy Button */}
                      <button
                        id={`btn-copy-${msg.id}`}
                        onClick={() => handleCopy(msg.id, msg.text)}
                        title="Copy answer"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        {copiedId === msg.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Download Advisory */}
                      <button
                        id={`btn-download-${msg.id}`}
                        onClick={() => handleDownloadGuidance(msg)}
                        title="Download Guidance PDF/Text"
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Message Body */}
                <div className="text-slate-800 font-normal">
                  {isUser ? msg.text : renderFormattedText(msg.text)}
                </div>

                {/* Citations & Clause References */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      Official Standards & Clause Citations
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {msg.citations.map((cite, cIdx) => (
                        <div
                          key={cIdx}
                          className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-3 hover:border-slate-300 hover:bg-white transition-all text-xs shadow-2xs"
                        >
                          <div className="flex items-start justify-between gap-1">
                            <span className="font-bold text-amber-900 bg-amber-100/80 px-2 py-0.5 rounded-md text-[11px]">
                              {cite.code}
                            </span>
                            {cite.clause && (
                              <span className="text-[10px] text-slate-500 bg-white border border-slate-200 px-1.5 py-0.5 rounded">
                                {cite.clause}
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-slate-900 mt-1.5 line-clamp-1">
                            {cite.title}
                          </p>
                          <p className="text-[11px] text-slate-600 mt-0.5 line-clamp-2">
                            {cite.description}
                          </p>
                          <div className="mt-2.5 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400">{cite.source}</span>
                            {onNavigateToStandards && (
                              <button
                                onClick={() => onNavigateToStandards(cite.code)}
                                className="text-slate-900 hover:text-amber-600 font-semibold flex items-center gap-0.5 transition-colors"
                              >
                                View Specs <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Action Shortcuts inside message */}
                {!isUser && (
                  <div className="mt-3.5 pt-2.5 flex flex-wrap gap-2 text-xs">
                    {onNavigateToLabs && (
                      <button
                        onClick={() => onNavigateToLabs()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/80 text-xs shadow-2xs"
                      >
                        <Building2 className="w-3.5 h-3.5 text-blue-600" />
                        Find Testing Labs
                      </button>
                    )}
                    {onNavigateToCalculator && (
                      <button
                        onClick={() => onNavigateToCalculator()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium transition-colors border border-slate-200/80 text-xs shadow-2xs"
                      >
                        <FileText className="w-3.5 h-3.5 text-emerald-600" />
                        Calculate License Fees
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-amber-400 flex items-center justify-center shrink-0 shadow-xs border border-slate-800">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/80 rounded-2xl rounded-tl-xs p-4 shadow-xs text-sm text-slate-600 flex items-center gap-3">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"></span>
                <span
                  className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className="w-2 h-2 rounded-full bg-amber-500 animate-bounce"
                  style={{ animationDelay: '0.3s' }}
                ></span>
              </div>
              <span className="text-xs font-medium text-slate-500">
                {language === 'hi'
                  ? 'बीआईएस डेटाबेस एवं मानकों से उत्तर तैयार किया जा रहा है...'
                  : 'Retrieving Indian Standards, clauses & testing protocols...'}
              </span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Prompt Chips */}
      <div className="py-2.5 overflow-x-auto scrollbar-none flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 whitespace-nowrap pl-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          {language === 'hi' ? 'सुझाए गए प्रश्न:' : 'Suggested Questions:'}
        </span>
        {FREQUENT_QUESTIONS.map((item, idx) => (
          <button
            key={idx}
            id={`suggested-chip-${idx}`}
            onClick={() => handleSend(language === 'hi' ? item.hindiQuestion : item.question)}
            className="whitespace-nowrap text-xs bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 px-3.5 py-1.5 rounded-full transition-all shrink-0 font-medium shadow-2xs hover:border-slate-300"
          >
            {language === 'hi' ? item.hindiQuestion : item.question}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="mt-1 bg-white border border-slate-200/90 rounded-2xl p-2 shadow-xs focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-900/5 transition-all">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Input Mic */}
          <button
            type="button"
            id="btn-voice-input"
            onClick={handleVoiceInput}
            title={isListening ? 'Listening...' : 'Voice Search (Speech to text)'}
            className={`p-2 rounded-xl transition-colors ${
              isListening
                ? 'bg-red-500 text-white animate-pulse'
                : 'text-slate-400 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            id="chat-input-field"
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            placeholder={
              language === 'hi'
                ? 'कोई भी भारतीय मानक, उत्पाद या बीआईएस प्रक्रिया पूछें (उदा. स्टेनलेस स्टील के बर्तन, पानी)...'
                : 'Ask about any Indian Standard, product, or certification (e.g. stainless steel utensils, drinking water)...'
            }
            className="flex-1 text-sm text-slate-900 placeholder-slate-400 bg-transparent outline-none px-2 font-normal"
          />

          <button
            id="chat-send-btn"
            type="submit"
            disabled={!inputQuery.trim() || isLoading}
            className="p-2.5 rounded-xl bg-slate-900 text-amber-400 hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-slate-900 transition-all shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

        <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1.5 border-t border-slate-100 mt-1">
          <span>
            {language === 'hi'
              ? 'हिन्दी एवं अंग्रेजी दोनों भाषाओं में प्रश्न पूछ सकते हैं'
              : 'Supports natural English and Hindi queries'}
          </span>
          <span className="flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Clause-Verified AI Engine
          </span>
        </div>
      </div>
    </div>
  );
};
