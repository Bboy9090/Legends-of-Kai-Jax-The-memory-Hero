import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Separator } from './separator';
import { Badge } from './badge';

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

export function AIAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [textToAnalyze, setTextToAnalyze] = useState('');
  const [sentiment, setSentiment] = useState<{ rating: number; confidence: number } | null>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTop = scrollElement.scrollHeight;
      }
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      const data: ChatResponse = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.success ? data.message : (data.error || 'Sorry, something went wrong.'),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const summarizeText = async () => {
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      const data: ChatResponse = await response.json();

      const summaryMessage: ChatMessage = {
        role: 'assistant',
        content: `Summary: ${data.success ? data.message : (data.error || 'Could not summarize text.')}`,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, summaryMessage]);
    } catch (error) {
      console.error('Summarize error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const analyzeSentiment = async () => {
    if (!textToAnalyze.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/sentiment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textToAnalyze }),
      });

      const data = await response.json();

      if (data.success) {
        setSentiment({ rating: data.rating, confidence: data.confidence });
        
        const sentimentMessage: ChatMessage = {
          role: 'assistant',
          content: `Sentiment Analysis: ${data.rating}/5 stars (${Math.round(data.confidence * 100)}% confidence)`,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, sentimentMessage]);
      }
    } catch (error) {
      console.error('Sentiment analysis error:', error);
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
    setMessages([{
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: new Date()
    }]);
    setSentiment(null);
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <CardHeader className="bg-blue-50 dark:bg-blue-900">
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-gray-100">
          <span>🤖 AI Assistant</span>
          <Button variant="outline" size="sm" onClick={clearChat} className="text-gray-700 dark:text-gray-300">
            Clear Chat
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {/* Chat Messages */}
        <ScrollArea className="h-96 w-full pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-400">AI is thinking...</p>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Chat Input */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
          <Button onClick={sendMessage} disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </div>

        <Separator className="my-4" />

        {/* Text Analysis Tools */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Text Analysis Tools</h3>
          <Input
            value={textToAnalyze}
            onChange={(e) => setTextToAnalyze(e.target.value)}
            placeholder="Enter text to analyze or summarize..."
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
          />
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={summarizeText} 
              disabled={isLoading || !textToAnalyze.trim()}
              className="text-gray-700 dark:text-gray-300"
            >
              Summarize
            </Button>
            <Button 
              variant="outline" 
              onClick={analyzeSentiment} 
              disabled={isLoading || !textToAnalyze.trim()}
              className="text-gray-700 dark:text-gray-300"
            >
              Analyze Sentiment
            </Button>
          </div>
          {sentiment && (
            <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
              Sentiment: {sentiment.rating}/5 stars ({Math.round(sentiment.confidence * 100)}% confidence)
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}