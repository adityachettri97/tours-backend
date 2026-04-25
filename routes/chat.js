const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and knowledgeable travel assistant for TravelPeak, a travel agency specializing in curated tours to Darjeeling, Kalimpong, and Sikkim in Northeast India.

Your role:
- Help visitors plan trips, answer questions about destinations, and provide travel tips
- Share details about our tour packages to Darjeeling, Kalimpong, and Sikkim
- Provide information about the best time to visit, local culture, food, and attractions
- Encourage interested visitors to book tours or contact us at info@travelpeak.com or +91 9876543210
- Keep responses concise, warm, and enthusiastic about travel

Key destinations we cover:
- Darjeeling: Famous for tea gardens, Tiger Hill sunrise views, the toy train, and stunning Himalayan panoramas
- Kalimpong: Known for flower nurseries, Buddhist monasteries, colonial-era architecture, and serene hill station vibes
- Sikkim: Home to Kanchenjunga (third highest peak), Rumtek Monastery, Tsomgo Lake, and lush green valleys

Best time to visit: March–May (spring flowers) and October–December (clear mountain views).
Monsoon (June–September) is lush but rainy.

Always be helpful and gently guide interested visitors toward booking a tour or contacting us.`;

router.post("/", async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array is required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  try {
    // Filter out the initial assistant welcome message
    const firstUserIdx = messages.findIndex((m) => m.role === "user");
    const apiMessages = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : messages;

    const stream = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        ...apiMessages,
      ],
      stream: true,
      max_tokens: 1024,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || "";
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write("data: [DONE]\n\n");
    res.end();
  } catch (error) {
    console.error("Chat error:", error.message);
    res.write(`data: ${JSON.stringify({ error: error.message || "Failed to get response" })}\n\n`);
    res.end();
  }
});

module.exports = router;
