import OpenAI from 'openai';

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: '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',
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
      max_tokens: 1000,
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