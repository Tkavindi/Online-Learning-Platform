import React, { useState } from 'react';
import axios from 'axios';
import { Send, Bot, User, BookOpen, MessageCircle, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; 

const Chatbot = () => {
  const BASE_URL = import.meta.env.VITE_BASE_URL;
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I can help you find the right courses for your career goals. What profession are you interested in?',
      courses: []
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuth(); 

  const sendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue,
      courses: []
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/api/gpt/recommend`,
        { prompt: inputValue },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      );

      const data = response.data;

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.message || 'Here are some course recommendations for you:',
        courses: data.courses || []
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);

      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while getting recommendations. Please try again.',
        courses: []
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Fixed Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 p-2 bg-black text-white rounded-full shadow-lg hover:bg-gray-800 transition-colors z-50 flex items-center justify-center"
      >
        {isOpen ? (
    <>
      <X className="w-6 h-6" />
    </>
  ) : (
    <>
      <MessageCircle className="w-6 h-6" />
      <span className="text-sm whitespace-nowrap">AI recommendations</span>
    </>
  )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96  bg-white border-2 border-black shadow-xl z-40 rounded">
          {/* Header */}
          <div className="bg-black text-white p-4 border-b border-black">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6" />
              <div>
                <h1 className="text-lg font-medium">Course Advisor</h1>
                <p className="text-gray-300 text-sm">AI assistant</p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="h-80 overflow-y-auto p-4 space-y-4 bg-white">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`flex gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border ${
                      message.type === 'user'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black'
                    }`}
                  >
                    {message.type === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>

                  <div
                    className={`rounded-lg p-3 border ${
                      message.type === 'user'
                        ? 'bg-black text-white border-black'
                        : 'bg-white text-black border-black'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {/* Course Recommendations */}
                    {message.courses && message.courses.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <div className="flex items-center gap-2 font-medium">
                          <BookOpen className="w-4 h-4" />
                          <span className="text-sm">Recommended Courses:</span>
                        </div>
                        <div className="space-y-1">
                          {message.courses.map((course, index) => (
                            <div
                              key={index}
                              className="bg-gray-100 border border-gray-300 rounded p-2"
                            >
                              <span className="text-black text-sm font-medium">{course}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-white text-black border border-black flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-white border border-black rounded-lg p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-sm text-gray-600">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t-2 border-black p-3 bg-white">
            <div className="flex gap-2">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about career courses..."
                className="flex-1 border border-black rounded px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-black text-sm"
                rows="2"
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="bg-black hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded px-3 py-2 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
