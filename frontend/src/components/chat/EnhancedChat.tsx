import { useState, useRef, useEffect } from 'react';
import { FiSend, FiFile, FiMessageCircle, FiUser, FiLoader, FiRefreshCw } from 'react-icons/fi';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

interface Message {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
  isTyping?: boolean;
  images?: string[]; 
}

interface Document {
  _id: string;
  originalName: string;
  filename: string;
}

interface EnhancedChatProps {
  selectedDocuments?: Document[];
  className?: string;
}

export default function EnhancedChat({ selectedDocuments = [], className = "" }: EnhancedChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<'all' | 'specific'>('all');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedDocuments.length > 0) {
      setChatMode('specific');
    }
  }, [selectedDocuments]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: 'typing',
      sender: 'bot',
      text: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const token = localStorage.getItem('token');
      const payload: any = { question: userMessage.text };
      
      // Add document filtering for specific mode
      if (chatMode === 'specific' && selectedDocuments.length > 0) {
        payload.documentIds = selectedDocuments.map(doc => doc._id);
      }

      const response = await axios.post(
        'http://localhost:3000/api/rag/chat',
        payload,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        return [
          ...withoutTyping,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: response.data.response.answer || 'I apologize, but I couldn\'t generate a response.',
            timestamp: new Date(),
            images: response.data.response.images || [] 
          }
        ];
      });

    } catch (error: any) {
      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => msg.id !== 'typing');
        return [
          ...withoutTyping,
          {
            id: (Date.now() + 1).toString(),
            sender: 'bot',
            text: 'I apologize, but I encountered an error while processing your question. Please try again.',
            timestamp: new Date()
          }
        ];
      });
      
      toast.error('Failed to get response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const suggestedQuestions = [
    "Show me laptops under $1000",
    "I need a red backpack",
    "What's available in electronics?",
    "Help me find running shoes"
  ];

  return (
    <div className={`flex flex-col h-full bg-white rounded-xl shadow-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FiMessageCircle className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Product Assistant</h3>
            <p className="text-sm text-gray-600">
              Ask about products, get recommendations, place orders
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Chat Mode Toggle */}
          <div className="flex bg-white rounded-lg p-1 border">
            <button
              onClick={() => setChatMode('all')}
              className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
                chatMode === 'all'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              All Docs
            </button>
            <button
              onClick={() => setChatMode('specific')}
              disabled={selectedDocuments.length === 0}
              className={`px-3 py-1 text-sm rounded transition-all duration-200 ${
                chatMode === 'specific'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : selectedDocuments.length === 0
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-600 hover:text-blue-600'
              }`}
            >
              Selected
            </button>
          </div>

          <button
            onClick={clearChat}
            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
            title="Clear chat"
          >
            <FiRefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full mb-4">
              <FiMessageCircle className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Start shopping</h4>
            <p className="text-gray-600 mb-6">Ask about products and get personalized recommendations.</p>
            
            {/* Suggested Questions */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700 mb-3">Try asking:</p>
              {suggestedQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setInput(question)}
                  className="block w-full text-left p-3 text-sm bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all duration-200"
                >
                  "{question}"
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gradient-to-br from-gray-100 to-gray-200'
              }`}>
                {message.sender === 'user' ? (
                  <FiUser className="w-4 h-4 text-white" />
                ) : (
                  <FiMessageCircle className="w-4 h-4 text-gray-600" />
                )}
              </div>

              {/* Message Content */}
              <div className={`flex-1 max-w-xs md:max-w-md lg:max-w-lg ${
                message.sender === 'user' ? 'text-right' : ''
              }`}>
                <div className={`inline-block p-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.isTyping ? (
                    <div className="flex items-center gap-1">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                      <span className="text-sm text-gray-500 ml-2">AI is thinking...</span>
                    </div>
                  ) : (
                    <div className="prose prose-sm max-w-none">
                      {message.sender === 'bot' ? (
                        <ReactMarkdown
                          components={{
                            // Custom styling for markdown elements
                            h1: ({children}) => <h1 className="text-lg font-bold mb-2 text-gray-900">{children}</h1>,
                            h2: ({children}) => <h2 className="text-base font-semibold mb-2 text-gray-900">{children}</h2>,
                            h3: ({children}) => <h3 className="text-sm font-medium mb-1 text-gray-900">{children}</h3>,
                            p: ({children}) => <p className="mb-2 text-gray-900">{children}</p>,
                            ul: ({children}) => <ul className="list-disc list-inside mb-2 text-gray-900">{children}</ul>,
                            ol: ({children}) => <ol className="list-decimal list-inside mb-2 text-gray-900">{children}</ol>,
                            li: ({children}) => <li className="mb-1 text-gray-900">{children}</li>,
                            strong: ({children}) => <strong className="font-semibold text-gray-900">{children}</strong>,
                            em: ({children}) => <em className="italic text-gray-900">{children}</em>,
                            code: ({children}) => <code className="bg-gray-200 px-1 py-0.5 rounded text-sm text-gray-900">{children}</code>,
                          }}
                        >
                          {message.text}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap text-white">{message.text}</p>
                      )}
                      {message.images && message.images.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          {message.images.map((imgUrl, idx) => (
                            <img
                              key={idx}
                              src={imgUrl} 
                              alt={`chat-image-${idx}`}
                              className="rounded-lg border border-gray-300 shadow-sm"
                            />
                          ))}
                        </div>
                      )}
                    </div>

                  )}
                </div>
                {!message.isTyping && (
                  <p className={`text-xs mt-1 text-gray-500 ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about products, search by image, or place an order..."
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs text-gray-400">
                {input.length}/500
              </span>
            </div>
          </div>
          
          <button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 font-medium"
          >
            {isLoading ? (
              <FiLoader className="w-4 h-4 animate-spin" />
            ) : (
              <FiSend className="w-4 h-4" />
            )}
            Send
          </button>
        </div>

        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
          <span>Press Enter to send, Shift + Enter for new line</span>
          <span>{chatMode === 'specific' ? 'Specific docs' : 'All docs'} mode</span>
        </div>
      </div>
    </div>
  );
}