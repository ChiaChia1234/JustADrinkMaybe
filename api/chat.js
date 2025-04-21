export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userMessage = req.body.message;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: process.env.SYSTEM_PROMPT || "You are a bilingual parking assistant for Just A Drink Maybe." },
          { role: "user", content: userMessage }
        ]
      })
    });

    const data = await response.json();

    if (data && data.choices && data.choices[0] && data.choices[0].message) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(500).json({ error: "Invalid response format from OpenAI." });
    }
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
}
