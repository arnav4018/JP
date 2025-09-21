'use client';

import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Minimize2, 
  Maximize2, 
  X, 
  MessageCircle,
  User,
  Bot,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile
} from 'lucide-react';

const LiveChat = ({ isOpen, onToggle, onClose }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'support',
      senderName: 'Sarah (Support)',
      text: 'Hello! How can I help you today?',
      timestamp: new Date(Date.now() - 10000),
      type: 'text'
    },
    {
      id: 2,
      sender: 'user',
      senderName: 'You',
      text: 'Hi! I have a question about posting jobs.',
      timestamp: new Date(Date.now() - 8000),
      type: 'text'
    },
    {
      id: 3,
      sender: 'support',
      senderName: 'Sarah (Support)',
      text: 'I\'d be happy to help you with job posting! What specifically would you like to know?',
      timestamp: new Date(Date.now() - 5000),
      type: 'text'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      senderName: 'You',
      text: newMessage,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate support response
    setIsTyping(true);
    setTimeout(() => {
      const supportResponse = {
        id: Date.now() + 1,
        sender: 'support',
        senderName: 'Sarah (Support)',
        text: 'Thanks for your question! Let me help you with that. You can post jobs by going to the "Post a Job" section in your dashboard.',
        timestamp: new Date(),
        type: 'text'
      };
      setMessages(prev => [...prev, supportResponse]);
      setIsTyping(false);
    }, 2000);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div 
        className="w-80 rounded-lg shadow-2xl border overflow-hidden transition-all duration-300"
        style={{ 
          backgroundColor: 'var(--background-panel)', 
          borderColor: 'var(--accent-subtle)',
          height: isMinimized ? '60px' : '500px'
        }}
      >
        {/* Chat Header */}
        <div 
          className="flex items-center justify-between p-4 border-b"
          style={{ 
            backgroundColor: 'var(--accent-interactive)', 
            borderColor: 'var(--accent-subtle)',
            color: 'var(--background-deep)'
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Bot className="h-4 w-4" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h3 className="font-medium text-sm">Live Support</h3>
              <p className="text-xs opacity-80">Usually responds in minutes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Chat Messages */}
        {!isMinimized && (
          <>
            <div className="flex-1 p-4 overflow-y-auto" style={{ height: '350px' }}>
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {isTyping && (
                  <div className="flex items-start space-x-2">
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: 'var(--accent-subtle)' }}
                    >
                      <Bot className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
                    </div>
                    <div 
                      className="max-w-xs px-3 py-2 rounded-lg"
                      style={{ backgroundColor: 'var(--accent-subtle)' }}
                    >
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-secondary)', animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-secondary)', animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 rounded-full animate-bounce" style={{ backgroundColor: 'var(--text-secondary)', animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div 
              className="p-4 border-t"
              style={{ borderColor: 'var(--accent-subtle)' }}
            >
              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <button 
                      className="p-1 rounded hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Paperclip className="h-4 w-4" />
                    </button>
                    <button 
                      className="p-1 rounded hover:opacity-80 transition-opacity"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <Smile className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-end space-x-2">
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 px-3 py-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-opacity-50 text-sm"
                      style={{
                        backgroundColor: 'var(--background-deep)',
                        borderColor: 'var(--accent-subtle)',
                        color: 'var(--text-primary)',
                        focusRingColor: 'var(--accent-interactive)'
                      }}
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        backgroundColor: 'var(--accent-interactive)', 
                        color: 'var(--background-deep)'
                      }}
                    >
                      <Send className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// Message Bubble Component
const MessageBubble = ({ message }) => {
  const isUser = message.sender === 'user';
  
  return (
    <div className={`flex items-start space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      <div 
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: 'var(--accent-subtle)' }}
      >
        {isUser ? (
          <User className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
        ) : (
          <Bot className="h-4 w-4" style={{ color: 'var(--accent-interactive)' }} />
        )}
      </div>
      
      <div className={`max-w-xs ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div 
          className="px-3 py-2 rounded-lg break-words"
          style={{ 
            backgroundColor: isUser ? 'var(--accent-interactive)' : 'var(--accent-subtle)',
            color: isUser ? 'var(--background-deep)' : 'var(--text-primary)'
          }}
        >
          <p className="text-sm">{message.text}</p>
        </div>
        <p 
          className="text-xs mt-1 px-1"
          style={{ color: 'var(--text-secondary)' }}
        >
          {formatTime(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

// Chat Toggle Button (floating action button)
export const ChatToggleButton = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-4 right-4 w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 z-40"
      style={{ backgroundColor: 'var(--accent-interactive)', color: 'var(--background-deep)' }}
    >
      <MessageCircle className="h-6 w-6 mx-auto" />
    </button>
  );
};

export default LiveChat;