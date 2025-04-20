import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser, FaSearch, FaChartLine } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AiChatbot({ businessData, competitors, seoData, aiInsights }) {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: `Hello! I'm your growth assistant. Ask me anything about your business metrics, SEO strategy, or how to outrank your competitors in search results.` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    // Add user message to chat
    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    
    try {
      // Call the AI Chat API
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: input,
          businessData,
          competitors,
          seoData,
          aiInsights
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get response');
      }
      
      const data = await response.json();
      
      // Add bot response to chat
      setMessages(prev => [...prev, { role: 'bot', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        role: 'bot', 
        content: "I'm sorry, I couldn't process your question. Please try again or consider booking a call with our SEO experts for personalized assistance." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full glass-card rounded-2xl border border-card-border shadow-float flex flex-col h-96 overflow-hidden backdrop-blur-sm"
    >
      <div className="bg-gradient-to-r from-primary-500 to-secondary-500 p-4 rounded-t-xl">
        <h2 className="text-white font-semibold flex items-center">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20 mr-3">
            <FaChartLine className="text-white" size={14} />
          </div>
          Growth Strategy Assistant
        </h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-5 space-y-4 bg-background-secondary/30">
        {messages.map((message, index) => (
          <motion.div 
            key={index}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-3/4 p-3 rounded-lg shadow-sm
              ${message.role === 'user' 
                ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white rounded-tr-none' 
                : 'bg-neutral-800 text-foreground rounded-tl-none'}
            `}>
              <div className="flex items-center mb-1">
                {message.role === 'bot' ? (
                  <FaRobot className="mr-2 text-primary-500" size={14} />
                ) : (
                  <FaUser className="mr-2 text-white" size={14} />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : 'Growth Assistant'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          </motion.div>
        ))}
        
        {isLoading && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-neutral-800 text-foreground p-3 rounded-lg rounded-tl-none max-w-3/4 shadow-sm">
              <div className="flex items-center mb-1">
                <FaRobot className="mr-2 text-primary-500" size={14} />
                <span className="text-xs font-medium">Growth Assistant</span>
              </div>
              <p className="text-sm">
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse"></span>
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse mx-1" style={{ animationDelay: '0.2s' }}></span>
                <span className="inline-block w-2 h-2 bg-primary-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </p>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t border-card-border bg-background-secondary/50">
        <form onSubmit={handleSubmit} className="flex">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" size={14} />
            </div>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about SEO strategy, competitor analysis, or growth tactics..."
              className="w-full pl-10 pr-4 py-3 border border-card-border rounded-l-xl focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 bg-neutral-900/50 backdrop-blur-sm"
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-5 py-3 rounded-r-xl flex items-center justify-center ${
              isLoading || !input.trim() 
                ? 'bg-neutral-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-600 hover:to-secondary-600 text-white'
            }`}
          >
            <FaPaperPlane size={14} />
          </button>
        </form>
      </div>
    </motion.div>
  );
} 