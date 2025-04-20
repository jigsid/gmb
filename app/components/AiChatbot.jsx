import { useState, useRef, useEffect } from 'react';
import { FaPaperPlane, FaRobot, FaUser } from 'react-icons/fa';

export default function AiChatbot({ businessData, competitors, seoData, aiInsights }) {
  const [messages, setMessages] = useState([
    { 
      role: 'bot', 
      content: "Hello! I'm your AI assistant. Ask me anything about your business metrics, competitors, or recommendations for improvement." 
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
        content: "I'm sorry, I couldn't process your question. Please try again." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-xl shadow-md flex flex-col h-96">
      <div className="bg-primary p-4 rounded-t-xl">
        <h2 className="text-white font-semibold flex items-center">
          <FaRobot className="mr-2" /> AI Assistant
        </h2>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`
              max-w-3/4 p-3 rounded-lg
              ${message.role === 'user' 
                ? 'bg-primary text-white rounded-tr-none' 
                : 'bg-gray-100 text-gray-800 rounded-tl-none'}
            `}>
              <div className="flex items-center mb-1">
                {message.role === 'bot' ? (
                  <FaRobot className="mr-2 text-primary" size={14} />
                ) : (
                  <FaUser className="mr-2 text-white" size={14} />
                )}
                <span className="text-xs font-medium">
                  {message.role === 'user' ? 'You' : 'AI Assistant'}
                </span>
              </div>
              <p className="text-sm whitespace-pre-line">{message.content}</p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-800 p-3 rounded-lg rounded-tl-none max-w-3/4">
              <div className="flex items-center mb-1">
                <FaRobot className="mr-2 text-primary" size={14} />
                <span className="text-xs font-medium">AI Assistant</span>
              </div>
              <p className="text-sm">
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse"></span>
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse mx-1" style={{ animationDelay: '0.2s' }}></span>
                <span className="inline-block w-2 h-2 bg-gray-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></span>
              </p>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-4 border-t">
        <form onSubmit={handleSubmit} className="flex">
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about your business..."
            className="flex-grow px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className={`px-4 py-2 rounded-r-md ${
              isLoading || !input.trim() 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-primary hover:bg-secondary text-white'
            }`}
          >
            <FaPaperPlane />
          </button>
        </form>
      </div>
    </div>
  );
} 