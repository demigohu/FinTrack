import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/Button.jsx';
import Card from '../components/Card.jsx';
import Badge from '../components/Badge.jsx';
import Input from '../components/Input.jsx';

export default function AIAdvisorPage() {
  const { currency, setCurrency } = useContext(AuthContext);
  const [aiChatHistory, setAiChatHistory] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Load AI chat history from backend
  const loadAiChatHistory = async () => {
    try {
      // TODO: Implement AI chat history service
      // For now, we'll use a default welcome message
      setAiChatHistory([
        {
          id: 1,
          role: 'assistant',
          content: 'Hello! I\'m your AI financial advisor. I can help you with budgeting, investment advice, and financial planning. What would you like to know?',
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError('Failed to load chat history');
      console.error('Error loading chat history:', err);
    }
  };

  useEffect(() => {
    loadAiChatHistory();
  }, []);

  const getAiAdvice = async (message) => {
    setIsTyping(true);
    try {
      // TODO: Implement AI advice service
      // For now, we'll simulate AI responses
      const userMessage = {
        id: Date.now(),
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      };

      setAiChatHistory(prev => [...prev, userMessage]);

      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          role: 'assistant',
          content: generateAiResponse(message),
          timestamp: new Date().toISOString()
        };
        setAiChatHistory(prev => [...prev, aiResponse]);
        setIsTyping(false);
      }, 2000);

    } catch (err) {
      setError('Failed to get AI advice');
      console.error('Error getting AI advice:', err);
      setIsTyping(false);
    }
  };

  const generateAiResponse = (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
      return 'Based on your spending patterns, I recommend setting aside 20% of your income for savings and limiting discretionary spending to 30%. Consider using the 50/30/20 rule: 50% for needs, 30% for wants, 20% for savings.';
    } else if (lowerMessage.includes('invest') || lowerMessage.includes('investment')) {
      return 'For investment advice, I recommend starting with a diversified portfolio: 60% stocks, 30% bonds, 10% alternative investments. Consider low-cost index funds for long-term growth. Always do your own research and consider consulting a financial advisor.';
    } else if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      return 'Great question! Start by building an emergency fund of 3-6 months of expenses. Then focus on high-yield savings accounts and consider automated savings transfers. Set specific goals like "save $10,000 for emergency fund" to stay motivated.';
    } else if (lowerMessage.includes('debt') || lowerMessage.includes('loan')) {
      return 'For debt management, prioritize high-interest debt first (credit cards). Consider the debt snowball or avalanche method. Focus on paying more than minimum payments and avoid taking on new debt while paying off existing balances.';
    } else {
      return 'I\'m here to help with your financial questions! You can ask me about budgeting, saving, investing, debt management, or any other financial topics. What specific area would you like to discuss?';
    }
  };

  const onSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    
    setLoading(true);
    await getAiAdvice(input);
    setInput('');
    setLoading(false);
  };

  const clearChat = () => {
    setAiChatHistory([
      {
        id: Date.now(),
        role: 'assistant',
        content: 'Chat history cleared. How can I help you today?',
        timestamp: new Date().toISOString()
      }
    ]);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">{error}</div>
          <button 
            onClick={loadAiChatHistory}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">AI Financial Advisor</h2>
        <Button variant="secondary" onClick={clearChat}>
          Clear Chat
        </Button>
      </div>

      {/* AI Chat Interface */}
      <Card className="h-96 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {aiChatHistory.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">
                    {msg.role === 'user' ? 'You' : 'AI Advisor'}
                  </span>
                  <Badge color={msg.role === 'user' ? 'blue' : 'green'} size="sm">
                    {msg.role === 'user' ? 'User' : 'AI'}
                  </Badge>
                </div>
                <p className="text-sm">{msg.content}</p>
                <div className="text-xs opacity-70 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-medium">AI Advisor</span>
                  <Badge color="green" size="sm">AI</Badge>
                </div>
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <div className="border-t p-4">
          <form className="flex gap-2" onSubmit={onSend}>
            <Input 
              placeholder="Ask me about budgeting, investing, saving, or debt management..." 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              disabled={loading || isTyping}
              className="flex-1"
            />
            <Button type="submit" loading={loading} disabled={isTyping}>
              Send
            </Button>
          </form>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <div className="text-2xl mb-2">💰</div>
            <h3 className="font-semibold text-sm mb-1">Budgeting</h3>
            <p className="text-xs text-gray-500">Get personalized budget advice</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl mb-2">📈</div>
            <h3 className="font-semibold text-sm mb-1">Investing</h3>
            <p className="text-xs text-gray-500">Investment strategies and tips</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl mb-2">💎</div>
            <h3 className="font-semibold text-sm mb-1">Saving</h3>
            <p className="text-xs text-gray-500">Smart saving strategies</p>
          </div>
        </Card>
        
        <Card>
          <div className="text-center">
            <div className="text-2xl mb-2">💳</div>
            <h3 className="font-semibold text-sm mb-1">Debt</h3>
            <p className="text-xs text-gray-500">Debt management advice</p>
          </div>
        </Card>
      </div>

      {/* AI Capabilities */}
      <Card>
        <h3 className="font-semibold mb-4">AI Capabilities</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium mb-2">Financial Analysis</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Spending pattern analysis</li>
              <li>• Budget optimization</li>
              <li>• Investment recommendations</li>
              <li>• Risk assessment</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">Personalized Advice</h4>
            <ul className="space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Goal-based planning</li>
              <li>• Debt management strategies</li>
              <li>• Tax optimization tips</li>
              <li>• Emergency fund guidance</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
} 