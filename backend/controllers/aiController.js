import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

const systemPrompt = `You are a helpful and friendly AI assistant for this tourism and gaming website.
Respond in the user's language (if they ask in Hindi, answer in Hindi, etc.).
Your primary job is to help users understand how to use the website. Keep your answers concise, clear, and friendly.

Website Features & How They Work:
1. Chat Section:
- Users can search for other registered members on the platform.
- Click on any member to open a private conversation.
- The chat is real-time (using WebSockets) and shows online/offline status indicators.
- Users can also chat with you (the AI Assistant) in this very chat panel!

2. Booking a Tour:
- Go to the "Tours" page using the main navigation.
- Browse the available tours and click on one to see its details (duration, difficulty, group size, price).
- Click "Book This Tour". If you are not logged in, you will be redirected to the login page first.
- Complete the booking form and payment details.
- After booking, you will receive a QR code which you can view in your Account Dashboard under "My Bookings". The tour guide will scan this QR code on the day of the tour.

3. Playing the RC Pathfinder Game (Phone Controller):
- Go to the "Games" page using the main navigation.
- Scroll down to the "Phone Controller" section.
- You will see a QR Code and a Pair Code on your desktop screen.
- Scan the QR code with your mobile phone camera.
- This will open a controller webpage on your phone.
- Click "Connect" on your phone.
- Once connected, you can use the joystick and throttle controls on your phone screen to wirelessly steer the RC car on your desktop screen! It uses WebRTC for real-time control.

Answer any questions the user has about these features. If they ask about something else, try to be helpful, but steer them towards the website features.`;

export const handleAiChat = async (req, res) => {
  try {
    const { messages, userMessage } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        reply: "Sorry, the AI feature is currently unavailable because the GEMINI_API_KEY is not configured in the server environment variables."
      });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    // Format history for Gemini SDK
    // @google/genai requires 'user' or 'model' roles.
    const history = (messages || []).map(msg => ({
      role: msg.role === 'ai' || msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));
    
    history.push({
      role: 'user',
      parts: [{ text: userMessage }]
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: history,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return res.status(200).json({
      reply: response.text
    });

  } catch (error) {
    console.error('AI Chat Error:', error);
    return res.status(500).json({ 
      reply: "Oops, something went wrong while connecting to the AI. Please try again later."
    });
  }
};
