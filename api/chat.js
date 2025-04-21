export default async function handler(req, res) {
  // 設定 CORS header
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 如果是預請求（OPTIONS），直接回200
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userMessage = req.body.message;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: process.env.SYSTEM_PROMPT || "You are a bilingual parking assistant for Just A Drink Maybe..." },
        { role: "user", content: userMessage }
      ]
    })
  });

  const data = await response.json();
  res.status(200).json(data);
}
