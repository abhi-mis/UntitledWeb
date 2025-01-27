import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: import.meta.env.VITE_OPENROUTER_API_KEY,
  defaultHeaders: {
    "HTTP-Referer": window.location.href,
    "X-Title": "Chat Application",
  },
  dangerouslyAllowBrowser: true
});

export const generateChatResponse = async (message: string) => {
  try {
    console.log('Sending request with payload:', {
      model: "sophosympatheia/rogue-rose-103b-v0.2:free",
      messages: [{ role: "user", content: message }]
    });

    const completion = await openai.chat.completions.create({
      model: "sophosympatheia/rogue-rose-103b-v0.2:free",
      messages: [
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 100000,
    });

    console.log('Received response:', completion);
    
    if (!completion.choices || completion.choices.length === 0) {
      throw new Error('No response from API');
    }

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    return "Sorry, I'm having trouble connecting to the AI service right now.";
  }
};