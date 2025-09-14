import { GoogleGenerativeAI } from '@google/generative-ai';

/*
Using Firebase AI Logic with Google's Gemini AI models:
- Gemini-2.5-flash model for fast, cost-effective responses
- Free tier available with generous rate limits
- No API key required initially - uses free tier
- Supports multimodal inputs (text, images, audio, video)
*/

// Initialize Gemini AI with free tier (no API key needed initially)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatResponse {
  message: string;
  success: boolean;
  error?: string;
}

// Chat with AI assistant using Gemini
export async function chatWithAI(messages: ChatMessage[]): Promise<ChatResponse> {
  try {
    // Use Gemini 2.5 Flash model for fast, cost-effective responses
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Convert chat messages to Gemini format
    const history = messages.slice(0, -1).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const lastMessage = messages[messages.length - 1];
    
    // Start chat with history
    const chat = model.startChat({ history });
    const result = await chat.sendMessage(lastMessage.content);
    
    return {
      message: result.response.text() || "Sorry, I couldn't generate a response.",
      success: true
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      message: "Sorry, I'm having trouble connecting right now. Please try again.",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Text summarization using Gemini
export async function summarizeText(text: string): Promise<ChatResponse> {
  const prompt = `Please summarize the following text concisely while maintaining key points:\n\n${text}`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    const result = await model.generateContent(prompt);

    return {
      message: result.response.text() || "Could not summarize the text.",
      success: true
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      message: "Sorry, I couldn't summarize the text right now.",
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function analyzeSentiment(text: string): Promise<{
  rating: number,
  confidence: number,
  success: boolean,
  error?: string
}> {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    const prompt = `You are a sentiment analysis expert. Analyze the sentiment of the following text and provide:
1. A rating from 1 to 5 stars (1 = very negative, 5 = very positive)  
2. A confidence score between 0 and 1 (0 = not confident, 1 = very confident)

Respond with JSON in this exact format: {"rating": number, "confidence": number}

Text to analyze: ${text}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Extract JSON from response
    const jsonMatch = responseText.match(/\{[^{}]*\}/);
    const jsonData = jsonMatch ? JSON.parse(jsonMatch[0]) : { rating: 3, confidence: 0.5 };

    return {
      rating: Math.max(1, Math.min(5, Math.round(jsonData.rating))),
      confidence: Math.max(0, Math.min(1, jsonData.confidence)),
      success: true
    };
  } catch (error) {
    console.error('Gemini sentiment analysis error:', error);
    return {
      rating: 3,
      confidence: 0,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}