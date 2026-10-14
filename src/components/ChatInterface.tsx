import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message, LLMConfig } from '../types';
import { sendChatRequest } from '../utils/api';
import MessageBubble from './MessageBubble';
import { Send, Loader2, Trash2, AlertCircle, Bot } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ChatInterfaceProps {
  config: LLMConfig;
}

export default function ChatInterface({ config }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (!config.endpoint) {
      setError('Endpoint URL belum dikonfigurasi. Buka pengaturan untuk mengisi.');
      return;
    }

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);
    setError(null);
    setStreamingContent('');

    await sendChatRequest(
      config,
      newMessages,
      (chunk) => {
        setStreamingContent((prev) => prev + chunk);
      },
      () => {
        setStreamingContent((prev) => {
          if (prev) {
            const assistantMessage: Message = {
              id: uuidv4(),
              role: 'assistant',
              content: prev,
              timestamp: Date.now(),
            };
            setMessages((msgs) => [...msgs, assistantMessage]);
          }
          return '';
        });
        setIsLoading(false);
      },
      (errorMsg) => {
        setError(errorMsg);
        setIsLoading(false);
        setStreamingContent('');
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([]);
    setError(null);
    setStreamingContent('');
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {messages.length === 0 && !streamingContent && (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">AI Chatbot</h2>
            <p className="text-gray-400 max-w-md text-sm leading-relaxed">
              Mulai percakapan dengan AI. Pastikan konfigurasi endpoint, API key, dan model sudah
              diatur di panel pengaturan.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 justify-center">
              {['Jelaskan konsep AI', 'Buatkan kode Python', 'Tulis puisi'].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 text-xs bg-gray-800 border border-gray-700 rounded-full text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}

        {/* Streaming indicator */}
        {streamingContent && (
          <div className="flex gap-3 group">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col max-w-[80%]">
              <div className="rounded-2xl px-4 py-3 bg-gray-800 text-gray-100 border border-gray-700">
                <div className="prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {streamingContent}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading without streaming */}
        {isLoading && !config.streamEnabled && !streamingContent && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
              <Loader2 className="w-4 h-4 text-white animate-spin" />
            </div>
            <div className="rounded-2xl px-4 py-3 bg-gray-800 border border-gray-700">
              <p className="text-sm text-gray-400">Sedang memproses...</p>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-900/30 border border-red-800/50 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-red-300 font-medium">Error</p>
              <p className="text-sm text-red-400 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="flex-shrink-0 p-2.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
              title="Hapus percakapan"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan... (Shift+Enter untuk baris baru)"
              rows={1}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
              disabled={isLoading}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 p-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-xl transition-colors"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-600 mt-2">
          Model: {config.modelName} | Endpoint: {config.endpoint ? new URL(config.endpoint).hostname : 'Belum diatur'}
        </p>
      </div>
    </div>
  );
}
