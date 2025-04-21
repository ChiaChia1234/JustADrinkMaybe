export default async function handler(req, res) {
  // 防止 CORS 錯誤
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const userMessage = req.body.message;

  if (!userMessage) {
    return res.status(400).json({ error: 'No message provided' });
  }

  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: process.env.SYSTEM_PROMPT || 'You are a helpful assistant.' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json();
      console.error('OpenAI API error:', errorData);
      return res.status(500).json({ error: 'OpenAI API Error', detail: errorData });
    }

    const data = await openaiResponse.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return res.status(500).json({ error: 'Invalid response from OpenAI' });
    }

    res.status(200).json({ reply });
  } catch (error) {
    console.error('Server Error:', error);
    res.status(500).json({ error: 'Server Error', detail: error.message });
  }
}
